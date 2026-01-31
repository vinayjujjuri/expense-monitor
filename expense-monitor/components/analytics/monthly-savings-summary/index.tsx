"use client";

import { useEffect, useState } from "react";
import YearMonthSelector from "@/components/year-month-selector";

export default function MonthlySavingsSummary() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [totalCredit, setTotalCredit] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await fetch(
        `/api/analytics/monthly/summary?month=${month}&year=${year}`,
        { cache: "no-store" }
      );

      const data = await res.json();
      setTotalCredit(data.totalCredit ?? 0);
      setTotalDebit(data.totalDebit ?? 0);
      setLoading(false);
    }

    load();
  }, [month, year]);

  const savings = totalCredit - totalDebit;

  return (
    <div className="space-y-4">
      {/* Selector */}
      <YearMonthSelector
        month={month}
        year={year}
        onChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
      />

      {/* Card */}
      <div className="rounded-xl bg-white p-6 shadow">
        {loading ? (
          <p className="text-center text-gray-500">
            Calculating savings...
          </p>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-800">
              Monthly Savings
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Credit − Debit for selected month
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Credit */}
              <div className="rounded-lg bg-emerald-50 p-4 text-center">
                <p className="text-xs text-emerald-700">
                  Total Credit
                </p>
                <p className="text-xl font-bold text-emerald-800">
                  ₹{totalCredit.toLocaleString()}
                </p>
              </div>

              {/* Debit */}
              <div className="rounded-lg bg-rose-50 p-4 text-center">
                <p className="text-xs text-rose-700">
                  Total Debit
                </p>
                <p className="text-xl font-bold text-rose-800">
                  ₹{totalDebit.toLocaleString()}
                </p>
              </div>

              {/* Savings */}
              <div
                className={`rounded-lg p-4 text-center ${
                  savings >= 0
                    ? "bg-teal-50"
                    : "bg-orange-50"
                }`}
              >
                <p className="text-xs text-gray-600">
                  Net Savings
                </p>
                <p
                  className={`text-xl font-bold ${
                    savings >= 0
                      ? "text-teal-700"
                      : "text-orange-700"
                  }`}
                >
                  ₹{savings.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Insight */}
            <div className="mt-4 text-center text-sm text-gray-600">
              {savings >= 0
                ? "🎉 Good job! You saved money this month."
                : "⚠️ You spent more than you earned this month."}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
