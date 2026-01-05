"use client"

import { useEffect, useState } from "react"

export interface ImportedExpense {
  date: string
  description: string
  amount: number
  type: "credit" | "debit"
}

interface Props {
  data: ImportedExpense[]
  onConfirm: (selected: ImportedExpense[]) => void
}

export default function ImportPreviewTable({ data, onConfirm }: Props) {
  const [selected, setSelected] = useState<boolean[]>([])

  useEffect(() => {
    setSelected(data.map(() => true))
  }, [data])

  const toggleAll = (checked: boolean) =>
    setSelected(data.map(() => checked))

  const toggleRow = (index: number) => {
    setSelected((prev) => {
      const copy = [...prev]
      copy[index] = !copy[index]
      return copy
    })
  }

  const selectedCount = selected.filter(Boolean).length

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Import Preview
          </h2>
          <p className="text-sm text-gray-500">
            Review and confirm expenses before saving
          </p>
        </div>

        <span className="text-sm text-gray-600">
          Selected: <b>{selectedCount}</b> / {data.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.every(Boolean)}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-center">Type</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className={`border-t ${
                  selected[i] ? "bg-white" : "bg-gray-50 opacity-60"
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected[i]}
                    onChange={() => toggleRow(i)}
                  />
                </td>

                <td className="px-4 py-3">
                  {new Date(row.date).toLocaleDateString()}
                </td>

                <td className="px-4 py-3 text-gray-800">
                  {row.description}
                </td>

                <td className="px-4 py-3 text-right font-medium">
                  ₹{row.amount.toFixed(2)}
                </td>

                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium
                      ${
                        row.type === "debit"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-teal-100 text-teal-700"
                      }`}
                  >
                    {row.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 p-4 border-t">
        <button
          disabled={selectedCount === 0}
          onClick={() =>
            onConfirm(data.filter((_, i) => selected[i]))
          }
          className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          Import Selected
        </button>
      </div>
    </div>
  )
}
