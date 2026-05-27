import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { CATEGORIES, type Category } from "@/lib/expenses";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type ReceiptAnalysis = {
  description: string;
  amount: number;
  category: Category;
  date: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "La API key de Gemini no está configurada." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("receipt");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No se recibió ningún archivo." },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato no soportado. Usa JPG, PNG o WebP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "El archivo es demasiado grande (máx. 10 MB)." },
      { status: 400 }
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analiza este recibo o ticket de compra y extrae la información del gasto.
Categorías válidas: ${CATEGORIES.join(", ")}.
- description: nombre del comercio o descripción breve del gasto
- amount: monto total numérico (sin símbolo de moneda)
- category: la categoría más apropiada de la lista
- date: fecha del recibo en formato YYYY-MM-DD; si no aparece, usa la fecha de hoy`,
            },
            {
              inlineData: {
                mimeType: file.type,
                data: base64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            description: { type: "string" },
            amount: { type: "number" },
            category: { type: "string", enum: [...CATEGORIES] },
            date: { type: "string" },
          },
          required: ["description", "amount", "category", "date"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json(
        { error: "No se pudo leer el recibo." },
        { status: 422 }
      );
    }

    const parsed = JSON.parse(text) as ReceiptAnalysis;

    if (
      !parsed.description?.trim() ||
      typeof parsed.amount !== "number" ||
      parsed.amount <= 0
    ) {
      return NextResponse.json(
        { error: "No se encontraron datos válidos en el recibo." },
        { status: 422 }
      );
    }

    const category = CATEGORIES.includes(parsed.category)
      ? parsed.category
      : "Otros";

    return NextResponse.json({
      description: parsed.description.trim(),
      amount: parsed.amount,
      category,
      date: parsed.date || new Date().toISOString().slice(0, 10),
    });
  } catch (error) {
    console.error("Gemini receipt analysis error:", error);
    return NextResponse.json(
      { error: "Error al analizar el recibo. Intenta con otra imagen." },
      { status: 500 }
    );
  }
}
