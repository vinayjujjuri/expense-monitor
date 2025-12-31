"use client"

import { useEffect, useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

type Category = { _id: string; totalAmount: number }

export default function MonthlyPieChart() {
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
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

  if (loading) return <div className="p-4">Loading analytics...</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>

  if (!categories || categories.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-600">No debit categories with amounts for this month.</p>
        <p className="mt-2 text-xs text-gray-500">Total spent: {total}</p>
      </div>
    )
  }

  const labels = categories.map((c) => c._id)
  const data = categories.map((c) => c.totalAmount)

  const chartData = {
    labels,
    datasets: [
      {
        label: `Monthly spending by category (${total})`,
        data,
        backgroundColor: [
          "#EF4444",
          "#F59E0B",
          "#10B981",
          "#3B82F6",
          "#8B5CF6",
          "#EC4899",
        ],
        borderColor: "rgba(255,255,255,0.6)",
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Monthly spending</h3>
      <Pie data={chartData} />
      <p className="mt-3 text-sm text-gray-600">Total spent: {total}</p>
    </div>
  )
}
