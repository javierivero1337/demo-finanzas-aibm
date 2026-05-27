"use client";

import {
  CATEGORY_COLORS,
  formatCurrency,
  type Expense,
} from "@/lib/expenses";

type ExpenseListProps = {
  expenses: Expense[];
  onDelete: (id: string) => void;
};

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const sorted = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-zinc-500">
        No hay gastos registrados. Agrega el primero arriba.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-zinc-900">Gastos</h2>
      </div>
      <ul className="divide-y divide-zinc-100">
        {sorted.map((expense) => (
          <li
            key={expense.id}
            className="flex items-center justify-between gap-3 px-5 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                />
                <p className="truncate font-medium text-zinc-900">
                  {expense.description}
                </p>
              </div>
              <p className="mt-0.5 text-sm text-zinc-500">
                {expense.category} ·{" "}
                {new Date(expense.date).toLocaleDateString("es-ES")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-zinc-900">
                {formatCurrency(expense.amount)}
              </span>
              <button
                type="button"
                onClick={() => onDelete(expense.id)}
                className="rounded-md px-2 py-1 text-sm text-red-600 transition hover:bg-red-50"
                aria-label={`Eliminar ${expense.description}`}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
