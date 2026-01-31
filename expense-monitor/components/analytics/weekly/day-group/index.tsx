"use client";

import ConfirmDialog from "@/components/ui/confirm-dialog";
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

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"edit" | "delete" | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);

  return (
    <>
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
                      className="px-2 py-1 rounded-md border border-teal-100 bg-teal-50 hover:bg-teal-100 text-teal-600 text-xs transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        // discard edits
                        setEditingId(null);
                        setAmount("");
                      }}
                      className="px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-xs text-gray-600 transition"
                    >
                      Discard
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 items-center">
                    <span>₹{e.amount}</span>
                    <button
                      onClick={() => {
                        // open confirm for edit
                        setPendingId(e._id);
                        setPendingAmount(e.amount ?? null);
                        setConfirmAction("edit");
                        setConfirmOpen(true);
                      }}
                      className="px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-xs text-gray-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        // open confirm for delete
                        setPendingId(e._id);
                        setConfirmAction("delete");
                        setConfirmOpen(true);
                      }}
                      className="px-2 py-1 rounded-md border border-red-100 bg-red-50 hover:bg-red-100 text-xs text-red-600 transition"
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
      <ConfirmDialog
        open={confirmOpen}
        title={confirmAction === "delete" ? "Delete entry" : "Edit entry"}
        description={
          confirmAction === "delete"
            ? "This will permanently delete the expense. Are you sure?"
            : "Start editing this expense? You can discard changes later."
        }
        danger={confirmAction === "delete"}
        confirmLabel={confirmAction === "delete" ? "Delete" : "Edit"}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmAction(null);
          setPendingId(null);
          setPendingAmount(null);
        }}
        onConfirm={() => {
          if (!pendingId) return;

          if (confirmAction === "delete") {
            // call remove
            fetch(`/api/expenses/${pendingId}`, { method: "DELETE" }).then(() => location.reload());
          } else if (confirmAction === "edit") {
            setEditingId(pendingId);
            setAmount(pendingAmount !== null ? String(pendingAmount) : "");
          }

          setConfirmOpen(false);
          setConfirmAction(null);
          setPendingId(null);
          setPendingAmount(null);
        }}
      />
    </>
  );
}
