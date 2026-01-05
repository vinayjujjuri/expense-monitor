"use client"

export interface ImportedExpense {
  date: string
  description: string
  amount: number | string   // 👈 important fix
  type: "credit" | "debit",
  counterparty: string | null
}

interface Props {
  data: ImportedExpense[]
  onConfirm: (all: ImportedExpense[]) => void
}

export default function ImportPreviewTable({ data, onConfirm }: Props) {
    console.log("Imported data:", data);
  const normalize = (amount: number | string) =>
    Number(amount) || 0

  const totalDebit = data
    .filter((e) => e.type.toLowerCase() === "debit")
    .reduce((sum, e) => sum + normalize(e.amount), 0)

  const totalCredit = data
    .filter((e) => e.type.toLowerCase() === "credit")
    .reduce((sum, e) => sum + normalize(e.amount), 0)

  const netAmount = totalCredit - totalDebit

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Import Preview</h2>
        <p className="text-sm text-gray-500">
          Review expenses before saving
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 border-b bg-gray-50 text-sm">
        <div className="rounded-lg bg-rose-50 p-3">
          <p className="text-rose-600 font-medium">Total Debit</p>
          <p className="text-lg font-semibold text-rose-700">
            ₹{totalDebit.toFixed(2)}
          </p>
        </div>

        <div className="rounded-lg bg-teal-50 p-3">
          <p className="text-teal-600 font-medium">Total Credit</p>
          <p className="text-lg font-semibold text-teal-700">
            ₹{totalCredit.toFixed(2)}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-600 font-medium">Net Amount</p>
          <p
            className={`text-lg font-semibold ${
              netAmount >= 0 ? "text-teal-700" : "text-rose-700"
            }`}
          >
            ₹{netAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-center">Type</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => {
              const amount = normalize(row.amount)

              return (
                <tr
                  key={i}
                  className={`border-t ${
                    row.type === "debit"
                      ? "bg-rose-50/30"
                      : "bg-teal-50/30"
                  }`}
                >
                  <td className="px-4 py-3">
                    {new Date(row.date).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 text-gray-800">
                    {row.type === "debit"
    ? `Paid to ${row.counterparty}`
    : `Received from ${row.counterparty}`}
                  </td>

                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      row.type === "debit"
                        ? "text-rose-700"
                        : "text-teal-700"
                    }`}
                  >
                    ₹{amount.toFixed(2)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        row.type.toLowerCase() === "debit"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-teal-100 text-teal-700"
                      }`}
                    >
                      {row.type.toUpperCase()}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {/* <div className="flex justify-end p-4 border-t">
        <button
          onClick={() => onConfirm(data)}
          className="rounded-md bg-teal-600 px-6 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Import {data.length} Transactions
        </button>
      </div> */}
    </div>
  )
}
