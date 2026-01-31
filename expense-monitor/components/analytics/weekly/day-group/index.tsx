"use client";

import { toTitleCase } from "@/utils/format";
import { useState } from "react";

export default function DayGroup({ entries }: { entries: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const grouped = entries.reduce((acc: any, e) => {
    const day = new Date(e.transactionDate).toLocaleDateString(
      "en-IN",
      { weekday: "short", day: "numeric", month: "short" }
    );
    acc[day] = acc[day] || [];
    acc[day].push(e);
    return acc;
  }, {});

  async function update(id: string) {
    await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    location.reload();
  }

  async function remove(id: string) {
    if (!confirm("Delete this expense?")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    location.reload();
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([day, items]: any) => {
        const total = items.reduce(
          (s: number, i: any) => s + i.amount,
          0
        );

        return (
          <div key={day} className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between mb-2">
              <span className="font-medium">{day}</span>
              <span className="text-teal-700 font-semibold">
                ₹{total}
              </span>
            </div>

            {items.map((e: any) => (
              <div
                key={e._id}
                className="flex justify-between items-center text-sm py-1"
              >
                <span>{toTitleCase(e.categoryId?.name || "")}</span>

                {editingId === e._id ? (
                  <div className="flex gap-2">
                    <input
                      value={amount}
                      onChange={(ev) =>
                        setAmount(ev.target.value)
                      }
                      className="w-20 border rounded px-2 py-1 text-xs"
                    />
                    <button
                      onClick={() => update(e._id)}
                      className="text-teal-600 text-xs"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 items-center">
                    <span>₹{e.amount}</span>
                    <button
                      onClick={() => {
                        setEditingId(e._id);
                        setAmount(String(e.amount));
                      }}
                      className="text-xs text-gray-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(e._id)}
                      className="text-xs text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
