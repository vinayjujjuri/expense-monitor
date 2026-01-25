"use client";

import { useState } from "react";

interface Expense {
  _id: string;
  amount: number;
  transactionDate: string;
  categoryId?: { name: string };
}

export default function DayGroup({
  entries,
}: {
  entries: Expense[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  async function deleteExpense(id: string) {
    if (!confirm("Delete this expense?")) return;

    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    location.reload(); // simple + safe
  }

  async function saveEdit(id: string) {
    await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(editAmount) }),
    });
    setEditingId(null);
    location.reload();
  }

  const grouped = entries.reduce((acc: any, e) => {
    const day = new Date(e.transactionDate).toLocaleDateString();
    acc[day] = acc[day] || [];
    acc[day].push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([day, items]: any) => {
        const total = items.reduce(
          (sum: number, i: Expense) => sum + i.amount,
          0
        );

        return (
          <div
            key={day}
            className="rounded-lg bg-gray-50 p-4"
          >
            {/* Day Header */}
            <div className="flex justify-between mb-2">
              <h4 className="font-medium text-gray-800">
                {day}
              </h4>
              <span className="font-semibold text-teal-700">
                ₹{total}
              </span>
            </div>

            {/* Expenses */}
            <div className="space-y-2">
              {items.map((e: Expense) => (
                <div
                  key={e._id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700">
                    {e.categoryId?.name ?? "Expense"}
                  </span>

                  {editingId === e._id ? (
                    <div className="flex gap-2 items-center">
                      <input
                        value={editAmount}
                        onChange={(ev) =>
                          setEditAmount(ev.target.value)
                        }
                        className="w-20 rounded border px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => saveEdit(e._id)}
                        className="text-teal-600 text-xs font-medium"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span>₹{e.amount}</span>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditingId(e._id);
                          setEditAmount(String(e.amount));
                        }}
                        className="text-xs text-gray-500 hover:text-teal-600"
                      >
                        Edit
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteExpense(e._id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
