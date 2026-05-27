"use client";

import { useRef, useState } from "react";
import {
  CATEGORIES,
  formatCurrency,
  type Category,
  type Expense,
} from "@/lib/expenses";

type ReceiptUploadProps = {
  onAdd: (expense: Omit<Expense, "id">) => void;
};

type AnalyzedReceipt = Omit<Expense, "id">;

export function ReceiptUpload({ onAdd }: ReceiptUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzedReceipt | null>(null);
  const [editedCategory, setEditedCategory] = useState<Category>("Comida");

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setLoading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    reset();
    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const response = await fetch("/api/analyze-receipt", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as
        | AnalyzedReceipt
        | { error: string };

      if (!response.ok) {
        setError("error" in data ? data.error : "Error desconocido.");
        return;
      }

      if ("error" in data) {
        setError(data.error);
        return;
      }

      setResult(data);
      setEditedCategory(data.category);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!result) return;

    onAdd({
      ...result,
      category: editedCategory,
    });
    reset();
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Escanear recibo con IA
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Sube una foto del ticket y Gemini lo leerá y categorizará
            automáticamente.
          </p>
        </div>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
          Powered by Gemini
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center transition hover:border-zinc-400 hover:bg-zinc-100">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="sr-only"
            disabled={loading}
          />
          <span className="text-sm font-medium text-zinc-700">
            {loading ? "Analizando recibo..." : "Haz clic para subir un recibo"}
          </span>
          <span className="mt-1 text-xs text-zinc-500">JPG, PNG o WebP · máx. 10 MB</span>
        </label>

        {previewUrl && (
          <div className="shrink-0 overflow-hidden rounded-xl border border-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Vista previa del recibo"
              className="h-40 w-40 object-cover"
            />
          </div>
        )}
      </div>

      {loading && (
        <p className="mt-4 text-sm text-violet-600">
          Gemini está leyendo tu recibo...
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">
            Recibo detectado
          </p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-emerald-700">Descripción</dt>
              <dd className="font-medium text-emerald-900">{result.description}</dd>
            </div>
            <div>
              <dt className="text-emerald-700">Monto</dt>
              <dd className="font-medium text-emerald-900">
                {formatCurrency(result.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-emerald-700">Fecha</dt>
              <dd className="font-medium text-emerald-900">
                {new Date(result.date).toLocaleDateString("es-ES")}
              </dd>
            </div>
            <div>
              <dt className="text-emerald-700">Categoría</dt>
              <dd>
                <select
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value as Category)}
                  className="mt-1 w-full rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-emerald-900 outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
            >
              Agregar gasto
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
