"use client"

import React from "react"

type Props = {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div className="relative w-full max-w-sm mx-4 bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              danger
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
