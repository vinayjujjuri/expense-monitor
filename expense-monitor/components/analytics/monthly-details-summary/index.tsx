"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toTitleCase } from "@/utils/format"

type Category = {
  categoryId: string
  name: string
  amount: number
}

export default function MonthlyCategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/analytics/monthly/categories", {
        cache: "no-store",
      })
      const data = await res.json()

      setCategories(data.categories ?? [])
      setTotal(data.totalSpent ?? 0)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Loading monthly analytics…</p>
      </div>
    )
  }

  return (
    <section className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Monthly Debit Summary
          </h3>
          <p className="text-xs text-gray-500">
            Category-wise expenses (current month)
          </p>
        </div>

        <Link
          href="/monthly-details"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 sm:mt-0"
        >
          Go to Dashboard
          <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {categories.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-600">
              No debit transactions this month.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Total spent: ₹{total.toLocaleString()}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {categories.map((c) => (
              <li
                key={c.categoryId}
                className="flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-teal-50"
              >
                <span className="text-sm font-medium text-gray-700">
                  {toTitleCase(c.name)}
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  ₹{c.amount.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between rounded-b-2xl bg-teal-50 px-5 py-4">
        <span className="text-sm font-medium text-gray-700">
          Total spent
        </span>
        <span className="text-xl font-bold text-teal-700">
          ₹{total.toLocaleString()}
        </span>
      </div>
    </section>
  )
}
