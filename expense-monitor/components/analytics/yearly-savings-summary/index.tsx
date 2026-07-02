"use client";

import { useEffect, useState } from "react";
import Dropdown from "@/components/dropdown";
import YearlyCategoryPieChart from "@/components/analytics/yearly/categories";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

type Category = { category: string | null; totalAmount: number };

export default function YearlySavingsSummary() {
  const [year, setYear] = useState(currentYear);
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      setLoading(true);
      setError(null);

      try {
        const [summaryRes, categoriesRes] = await Promise.all([
          fetch(`/api/analytics/yearly/summary?year=${year}`, {
            cache: "no-store",
          }),
          fetch(`/api/analytics/yearly/categories?year=${year}`, {
            cache: "no-store",
          }),
        ]);

        if (!summaryRes.ok) {
          throw new Error(`Summary request failed with status ${summaryRes.status}`);
        }

        if (!categoriesRes.ok) {
          throw new Error(`Category request failed with status ${categoriesRes.status}`);
        }

        const summaryData = await summaryRes.json();
        const categoryData = await categoriesRes.json();

        if (!mounted) return;

        setTotalCredit(summaryData.totalCredit ?? 0);
        setTotalDebit(summaryData.totalDebit ?? 0);
        setCategories(categoryData.categories ?? []);
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
  const topCategories = categories.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Yearly Savings</h1>
          <p className="mt-2 text-sm text-gray-600">
            View total credit, debit, net savings, and year-long spending by category.
          </p>
        </div>

        <div className="w-full max-w-xs">
          <label className="mb-2 block text-sm font-medium text-gray-700">Select year</label>
          <Dropdown
            options={yearOptions.map((option) => ({
              label: option.toString(),
              value: option,
            }))}
            value={year}
            onChange={(value) => setYear(value as number)}
            buttonClassName="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
            placeholder="Select year"
            showChevron={true}
            listHoverColor="emerald"
          />
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

            <section className="rounded-3xl border border-gray-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Category wise expense distribution</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    See which categories consumed most of your spending this year.
                  </p>
                </div>
              </div>

              {categories.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                  No category data found for this year.
                </div>
              ) : (
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

                  <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900">Top categories</h3>
                    <div className="space-y-3">
                      {topCategories.map((category, index) => (
                        <div key={category.category ?? index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-medium text-slate-900">
                              {category.category ?? "Uncategorized"}
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                              ₹{category.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
