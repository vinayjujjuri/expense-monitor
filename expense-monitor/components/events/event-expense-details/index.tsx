"use client";
import { useEffect, useState } from "react";

export default function EventExpensesDetails({
  eventId,
}: {
  eventId: string;
}) {
  const [data, setData] = useState<any[]>([]);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/expenses`, {
      cache: "no-store",
    });
    setData(await res.json());
    setLoading(false);
  }

  async function addExpense() {
    if (!expenseName || !amount) return;

    await fetch(`/api/events/${eventId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: eventId,
        expenseName,
        amount: Number(amount),
        expenseDate: new Date().toISOString(),
      }),
    });

    setExpenseName("");
    setAmount("");
    load();
  }

  useEffect(() => {
    if (eventId) load();
  }, [eventId]);

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Event Expenses
        </h1>
        <p className="text-sm text-gray-500">
          Track expenses for this event — day by day
        </p>
      </div>

      {/* Add Expense Card */}
      <div className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          Add Expense
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            placeholder="Expense name (Food, Travel, Hotel...)"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />

          <div className="relative w-full sm:w-36">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              ₹
            </span>
            <input
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-8 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>

          <button
            onClick={addExpense}
            className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Expenses List */}
      {loading ? (
        <p className="text-gray-500">Loading expenses...</p>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 p-6 text-center text-gray-500">
          No expenses added yet.
        </div>
      ) : (
        <div className="space-y-5">
          {data.map((day) => (
            <div
              key={day._id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              {/* Day Header */}
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  {day._id}
                </h3>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                  Total ₹{day.total}
                </span>
              </div>

              {/* Expense Rows */}
              <div className="divide-y divide-gray-100">
                {day.expenses.map((e: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between py-2 text-sm"
                  >
                    <span className="text-gray-700">
                      {e.expenseName}
                    </span>
                    <span className="font-medium text-gray-900">
                      ₹{e.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
