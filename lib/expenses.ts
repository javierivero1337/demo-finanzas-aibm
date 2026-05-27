export const CATEGORIES = [
  "Comida",
  "Transporte",
  "Entretenimiento",
  "Servicios",
  "Compras",
  "Otros",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: Category;
  date: string;
};

const STORAGE_KEY = "personal-finance-expenses";

export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Expense[];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export const CATEGORY_COLORS: Record<Category, string> = {
  Comida: "#f97316",
  Transporte: "#3b82f6",
  Entretenimiento: "#a855f7",
  Servicios: "#14b8a6",
  Compras: "#ec4899",
  Otros: "#6b7280",
};
