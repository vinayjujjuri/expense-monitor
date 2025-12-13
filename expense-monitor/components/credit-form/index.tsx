"use client"

import { useEffect, useRef, useState } from "react"
import Dropdown from "../../app/components/dropdown"

type CreditType = "salary" | "other"

export function CreditForm() {
    const [amount, setAmount] = useState<string>("")
    const [type, setType] = useState<CreditType>("salary")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const successTimerRef = useRef<number | null>(null)
    const amountRef = useRef<HTMLInputElement | null>(null)

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
            // start auto-dismiss timer (5s)
            if (successTimerRef.current) {
                window.clearTimeout(successTimerRef.current)
            }
            successTimerRef.current = window.setTimeout(() => setSuccess(null), 5000)
            // autofocus amount input for next entry
            setTimeout(() => amountRef.current?.focus(), 50)
        } catch (err: any) {
            setError(err?.message || "Failed to save credit")
        } finally {
            setLoading(false)
        }
    }

    // Clear success when user types or changes fields
    function clearSuccess() {
        if (success) {
            setSuccess(null)
        }
        if (successTimerRef.current) {
            window.clearTimeout(successTimerRef.current)
            successTimerRef.current = null
        }
    }

    useEffect(() => {
        return () => {
            if (successTimerRef.current) {
                window.clearTimeout(successTimerRef.current)
            }
        }
    }, [])

    return (
        <form onSubmit={handleSubmit} aria-label="credit-form" className="w-full max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-600">
                        <path d="M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Add Credit</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Record incoming money — salaries or other credits.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                        <input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            ref={amountRef}
                            value={amount}
                            onChange={(e) => { setAmount(e.target.value); clearSuccess(); }}
                            placeholder="0.00"
                            required
                            className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-10 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credit Type</label>
                    <Dropdown
                        id="type"
                        options={[{ label: 'Salary', value: 'salary' }, { label: 'Other', value: 'other' }]}
                        value={type}
                        onChange={(v: any) => { setType(v as CreditType); clearSuccess(); }}
                        placeholder="Select type"
                        className="w-full"
                        buttonClassName="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-left"
                        listStyle={{ minWidth: '100%' }}
                    />
                </div>

                <div className="flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
                                </svg>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <span>Add Credit</span>
                        )}
                    </button>
                </div>
            </div>

            {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
            {success && (
                <div role="status" className="mt-3 flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-8 h-8">
                        <span className="absolute inline-flex h-8 w-8 rounded-full bg-emerald-500 opacity-75 animate-ping" aria-hidden="true"></span>
                        <span className="relative inline-flex rounded-full bg-emerald-600 w-8 h-8 items-center justify-center text-white">
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 6L8.5 13.5L4 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{success}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Saved to your transactions</span>
                    </div>
                </div>
            )}
        </form>
    )
}