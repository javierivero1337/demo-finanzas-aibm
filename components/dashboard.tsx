"use client";

import { useEffect, useState } from "react";
import {
  formatCurrency,
  loadExpenses,
  saveExpenses,
  type Expense,
} from "@/lib/expenses";
import { CategoryChart } from "./category-chart";
import { ExpenseForm } from "./expense-form";
import { ExpenseList } from "./expense-list";
import { ReceiptUpload } from "./receipt-upload";

export function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveExpenses(expenses);
  }, [expenses, loaded]);

  function handleAdd(expense: Omit<Expense, "id">) {
    setExpenses((prev) => [
      ...prev,
      { ...expense, id: crypto.randomUUID() },
    ]);
  }

  function handleDelete(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Mis Finanzas
        </h1>
        <p className="mt-1 text-zinc-500">
          Registra, categoriza y visualiza tus gastos personales.
        </p>
        {loaded && expenses.length > 0 && (
          <p className="mt-4 text-2xl font-semibold text-zinc-900">
            Total gastado: {formatCurrency(total)}
          </p>
        )}
      </header>

      <div className="mb-6">
        <ReceiptUpload onAdd={handleAdd} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ExpenseForm onAdd={handleAdd} />
        <CategoryChart expenses={expenses} />
      </div>

      <div className="mt-6">
        <ExpenseList expenses={expenses} onDelete={handleDelete} />
      </div>
    </div>
  );
}
