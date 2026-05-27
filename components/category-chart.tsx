"use client";

import {
  CATEGORIES,
  CATEGORY_COLORS,
  formatCurrency,
  type Expense,
} from "@/lib/expenses";

type CategoryChartProps = {
  expenses: Expense[];
};

export function CategoryChart({ expenses }: CategoryChartProps) {
  const totals = CATEGORIES.map((category) => ({
    category,
    total: expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0),
  })).filter((item) => item.total > 0);

  const grandTotal = totals.reduce((sum, item) => sum + item.total, 0);
  const maxTotal = Math.max(...totals.map((t) => t.total), 1);

  if (totals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-zinc-500">
        El gráfico aparecerá cuando agregues gastos.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">
        Gastos por categoría
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Total: {formatCurrency(grandTotal)}
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {totals.map(({ category, total }) => {
          const pct = (total / grandTotal) * 100;
          const barWidth = (total / maxTotal) * 100;

          return (
            <div key={category}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-700">{category}</span>
                <span className="text-zinc-500">
                  {formatCurrency(total)} ({pct.toFixed(0)}%)
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: CATEGORY_COLORS[category],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex h-40 items-end justify-center gap-3">
        {totals.map(({ category, total }) => {
          const height = (total / maxTotal) * 100;
          return (
            <div
              key={category}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-32 w-full items-end justify-center">
                <div
                  className="w-full max-w-12 rounded-t-md transition-all duration-300"
                  style={{
                    height: `${height}%`,
                    backgroundColor: CATEGORY_COLORS[category],
                  }}
                  title={`${category}: ${formatCurrency(total)}`}
                />
              </div>
              <span className="text-center text-xs text-zinc-500">
                {category.slice(0, 4)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
