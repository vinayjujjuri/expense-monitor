"use client"

import { useEffect, useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import { toTitleCase } from "@/utils/format"

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

        const res = await fetch("/api/analytics/monthly")
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
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <p className="text-sm text-gray-600">
          No debit data available for this month.
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Total spent: ₹{total}
        </p>
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
    labels: categories.map((c:Category) => toTitleCase(c.name)),
    datasets: [
      {
        label: "Monthly spending by category " + total,
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
    <div className="max-w-md mx-auto p-5 bg-white rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Monthly Spending
      </h3>
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
        Total spent: <span className="text-rose-600">₹{total}</span>
      </div>
    </div>
  )
}
