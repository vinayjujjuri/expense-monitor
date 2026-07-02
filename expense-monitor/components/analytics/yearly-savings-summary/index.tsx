"use client";

import { useEffect, useState } from "react";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function YearlySavingsSummary() {
  const [year, setYear] = useState(currentYear);
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/analytics/yearly/summary?year=${year}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        if (!mounted) return;

        setTotalCredit(data.totalCredit ?? 0);
        setTotalDebit(data.totalDebit ?? 0);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Unable to load yearly savings summary.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSummary();
    return () => {
      mounted = false;
    };
  }, [year]);

  const savings = totalCredit - totalDebit;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Yearly Savings
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            View total credit, debit, and net savings for the selected year.
          </p>
        </div>

        <div className="w-full max-w-xs">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select year
          </label>
          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          >
            {yearOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow">
        {loading ? (
          <p className="text-center text-gray-500">Calculating yearly savings...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-emerald-50 p-5 text-center">
                <p className="text-sm font-medium text-emerald-700">Total Credit</p>
                <p className="mt-3 text-3xl font-semibold text-emerald-900">
                  ₹{totalCredit.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl bg-rose-50 p-5 text-center">
                <p className="text-sm font-medium text-rose-700">Total Debit</p>
                <p className="mt-3 text-3xl font-semibold text-rose-900">
                  ₹{totalDebit.toLocaleString()}
                </p>
              </div>

              <div
                className={`rounded-2xl p-5 text-center ${
                  savings >= 0 ? "bg-teal-50" : "bg-orange-50"
                }`}
              >
                <p className="text-sm font-medium text-gray-600">Net Savings</p>
                <p
                  className={`mt-3 text-3xl font-semibold ${
                    savings >= 0 ? "text-teal-900" : "text-orange-900"
                  }`}
                >
                  ₹{savings.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center text-sm text-gray-600">
              {savings > 0
                ? "Great! You saved money across the year."
                : savings === 0
                ? "You don't have any savings this year."
                : "Warning: expenses exceeded income for this year."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
