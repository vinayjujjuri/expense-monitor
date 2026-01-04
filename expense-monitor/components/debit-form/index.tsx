"use client"

import { useEffect, useRef, useState } from "react"
import Dropdown from "../dropdown"
import { toTitleCase } from "@/utils/format"

type DebitType = "Other Expenses" | "Recharges/Bills" | "Office travel" | "Fast food" | "EMI" | "Offline Shopping/Online Shopping"

interface DebitCategory {
  _id: string
  name: string
}

export function DebitForm() {
  const [amount, setAmount] = useState<string>("")
  const [type, setType] = useState<DebitType>("Other Expenses")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<string | null>(null)
  const successTimerRef = useRef<number | null>(null)
  const amountRef = useRef<HTMLInputElement | null>(null)
  const [categories, setCategories] = useState<DebitCategory[]>([])
  const [categoryId, setCategoryId] = useState<string>("")

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/debit-categories", {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to load categories")
        const data = await res.json()
        setCategories(data)
        if (data.length) setCategoryId(data[0]._id)
      } catch (err: any) {
        setError(err.message)
      }
    }
    fetchCategories()
  }, [])

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
      const res = await fetch("/api/debit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), categoryId: categoryId }),
        credentials: "include"
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed: ${res.status}`)
      }
      setSuccess("Debit saved successfully")
      setAmount("")
      setType("Other Expenses")
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current)
      }
      successTimerRef.current = window.setTimeout(() => setSuccess(null), 5000)
      setTimeout(() => amountRef.current?.focus(), 50)
    } catch (err: any) {
      setError(err?.message || "Failed to save debit")
    } finally {
      setLoading(false)
    }
  }

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

  const successComponent = () => {
    if(!success) return null
    return (
      <div role="status" className="mt-3 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8">
            <span className="absolute inline-flex h-8 w-8 rounded-full bg-rose-500 opacity-75 animate-ping" aria-hidden="true"></span>
            <span className="relative inline-flex rounded-full bg-rose-600 w-8 h-8 items-center justify-center text-white">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 6L8.5 13.5L4 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-rose-700">{success}</span>
            <span className="text-xs text-gray-500">Saved to your transactions</span>
          </div>
        </div>
    )
  };

  const errorComponent = () => {
    if(!error) return null
    return (
      <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>
    )
  };

  return (
    <form onSubmit={handleSubmit} aria-label="debit-form" className="w-full max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-rose-600">
            <path d="M6 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Add Debit</h2>
          <p className="text-sm text-gray-500">Record outgoing money — bills, shopping, travel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
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
              className="w-full rounded-md border border-gray-200 px-10 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {categories.length === 0 ?
          <div className="rounded-lg border border-dashed border-rose-300 bg-rose-50 p-4">
            <p className="text-sm text-rose-700 font-medium">
              No debit types found
            </p>
            <p className="mt-1 text-xs text-gray-600">
              You need at least one debit type before adding expenses.
            </p>

            <a
              href="/manage-debit-types"
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              ➕ Add Debit Type
            </a>
          </div> :
          <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Debit Type</label>
          <Dropdown
            id="type"
            options={categories.map(cat => ({
              label: toTitleCase(cat.name),
              value: cat._id,
            }))}
            value={categoryId}
            onChange={(v: any) => setCategoryId(v)}
            placeholder="Select category"
            className="w-full"
            buttonClassName="w-full rounded-md border border-gray-200 px-3 py-2 bg-white text-gray-900 text-left"
            listStyle={{ minWidth: '100%' }}
            searchable={true}
            searchPlaceholder="Search for your Debit type"
            emptyState={
              <div className="flex flex-col gap-2 p-2">
                  <p className="text-sm text-gray-600">
                    No debit type found
                  </p>
                  <a
                    href="/manage-debit-types"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
                  >
                    ➕ Add Debit Type
                  </a>
              </div>
            }
          />
        </div>
        }
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading || categories.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-md disabled:opacity-60"
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
              <span>Add Debit</span>
            )}
          </button>
        </div>
      </div>

      {errorComponent()}
      {successComponent()}
    </form>
  )
}
