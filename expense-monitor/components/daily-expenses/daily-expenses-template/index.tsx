"use client";

import { toTitleCase } from "@/utils/format";

interface Expense {
  _id: string;
  amount: number;
  transactionDate: string;
  categoryId?: { name: string };
}

export default function DaySectionTemplate({
  title,
  expenses,
}: {
  title: string;
  expenses: Expense[];
}) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <span className="text-sm font-medium text-rose-600">
          ₹ {total.toFixed(2)}
        </span>
      </div>

      {expenses.length === 0 ? (
        <p className="text-sm text-gray-500">
          No expenses recorded.
        </p>
      ) : (
        <ul className="divide-y">
          {expenses.map((e) => (
            <li key={e._id} className="flex justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {toTitleCase(e.categoryId?.name ?? "Uncategorized")}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(e.transactionDate).toLocaleTimeString()}
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                ₹ {e.amount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}