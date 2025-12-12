"use client"

import { useState } from "react"

type CreditType = "salary" | "other"

export function CreditForm() {
    const [amount, setAmount] = useState<string>("")
    const [type, setType] = useState<CreditType>("salary")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)

    function validate(): boolean {
        setError(null)
        const num = Number(amount)
        if (!amount) {
            setError("Amount is required")
            return false
        }
        if (Number.isNaN(num) || num <= 0) {
            setError("Enter a valid positive number for amount")
            return false
        }
        return true
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSuccess(null)
        if (!validate()) return
        setLoading(true)
        try {
            const res = await fetch("/api/credit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: Number(amount), creditType: type }),
            })
            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || `Request failed: ${res.status}`)
            }
            setSuccess("Credit saved successfully")
            setAmount("")
            setType("salary")
        } catch (err: any) {
            setError(err?.message || "Failed to save credit")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} aria-label="credit-form" className="w-full max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Add Credit</h2>

            <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credit Type</label>
                <select
                    id="type"
                    name="type"
                    value={type}
                    onChange={(e) => setType(e.target.value as CreditType)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="salary">Salary</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="flex items-center justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md disabled:opacity-60"
                >
                    {loading ? "Saving..." : "Add Credit"}
                </button>
            </div>

            {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
            {success && <p role="status" className="mt-3 text-sm text-green-700">{success}</p>}
        </form>
    )
}