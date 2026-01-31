"use client"

import { useEffect, useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import { toTitleCase } from "@/utils/format"
import Link from "next/link"

ChartJS.register(ArcElement, Tooltip, Legend)

type Category = {
  categoryId: string
  name: string
  amount: number
}

export default function MonthlyPieChart() {
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch("/api/analytics/monthly", {
          cache: "no-store",
        })
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)

        const data = await res.json()
        if (!mounted) return

        setCategories(data.categories ?? [])
        setTotal(data.totalSpent ?? 0)
      } catch (err: any) {
        setError(err?.message || "Failed to load analytics")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return <div className="p-4 text-sm text-gray-600">Loading analytics…</div>
  }

  if (error) {
    return <div className="p-4 text-sm text-red-600">{error}</div>
  }

  if (!categories.length) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-5 bg-white rounded-xl shadow-md">
        <div className="text-center sm:text-left">
          <p className="text-sm sm:text-base text-gray-600">
            No debit data available for this month.
          </p>

          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            Total spent: <span className="text-rose-600 font-medium">₹{total}</span>
          </p>
        </div>

        <div className="mt-4 sm:mt-3 flex justify-center sm:justify-end">
          <Link
            href="/analytics/monthly"
            className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            View monthly details →
          </Link>
        </div>
      </div>
    )
  }

  function stringToColor(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 55%)`
  }

  const chartData = {
    labels: categories.map((c) => toTitleCase(c.name)),
    datasets: [
      {
        label: "Monthly spending",
        data: categories.map((c) => c.amount),
        backgroundColor: categories.map((c) =>
          stringToColor(c.name)
        ),
        borderColor: "rgba(255,255,255,0.7)",
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 bg-white rounded-xl shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between mb-1 gap-3 sm:gap-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-center sm:text-left">
          Monthly Spending
        </h3>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-center sm:justify-end">
          <Link
            href="/monthly-details"
            className="text-sm sm:text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            View details →
          </Link>

          <Link
            href="/monthly-savings-summary"
            className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs sm:text-sm font-medium rounded-md border border-green-100 bg-green-50 text-green-700 hover:bg-green-100 transition"
          >
            Savings
          </Link>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Category-wise debit distribution
      </p>

      <Pie
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top",
              labels: {
                boxWidth: 14,
                padding: 12,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ₹${ctx.parsed}`,
              },
            },
          },
        }}
      />

      <div className="mt-4 text-sm text-gray-700 font-medium text-center">
        Total spent:{" "}
        <span className="text-rose-600">₹{total}</span>
      </div>
    </div>
  )
}
