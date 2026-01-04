"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"

interface Option<T = unknown> {
  label: string
  value: T
  disabled?: boolean
}

interface DropdownProps<T = unknown> {
  options: Option<T>[]
  value?: T | T[]
  onChange?: (value: T | T[]) => void
  placeholder?: string
  multi?: boolean
  renderValue?: (selected: Option<T> | Option<T>[] | null) => React.ReactNode
  renderOption?: (option: Option<T>, isSelected: boolean) => React.ReactNode
  className?: string
  id?: string
  buttonClassName?: string
  listStyle?: React.CSSProperties
  showChevron?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  emptyState?: React.ReactNode
}

export default function Dropdown<T = unknown>({
  options,
  value,
  onChange,
  placeholder = "Select...",
  multi = false,
  renderValue,
  renderOption,
  className,
  id,
  buttonClassName,
  listStyle,
  showChevron = true,
  searchable = false,
  searchPlaceholder = "Search...",
  emptyState,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [search, setSearch] = useState("")
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const selectedOptions = useMemo<Option<T>[] | Option<T> | null>(() => {
    if (multi) {
      const vals = Array.isArray(value) ? value : []
      return options.filter((o) => vals.includes(o.value))
    }
    return options.find((o) => o.value === value) ?? null
  }, [options, value, multi])

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options
    return options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [options, search, searchable])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, searchable])

  function selectOption(option: Option<T>) {
    if (option.disabled) return

    if (multi) {
      const current = Array.isArray(value) ? value : []
      const exists = current.includes(option.value)
      const next = exists
        ? current.filter((v) => v !== option.value)
        : [...current, option.value]
      onChange?.(next)
    } else {
      onChange?.(option.value)
      setOpen(false)
      setSearch("")
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true)
      setHighlightedIndex(0)
      return
    }

    if (!open) return

    if (e.key === "ArrowDown") {
      setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1))
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      const opt = filteredOptions[highlightedIndex]
      if (opt) selectOption(opt)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div
      id={id}
      ref={rootRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-expanded={open}
      aria-haspopup="listbox"
      className={className}
      style={{ position: "relative" }}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          buttonClassName ??
          "w-full rounded-md border border-gray-200 px-3 py-2 bg-white text-left"
        }
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 truncate">
            {renderValue
              ? renderValue(selectedOptions)
              : multi
              ? Array.isArray(selectedOptions) && selectedOptions.length
                ? selectedOptions.map((s) => s.label).join(", ")
                : placeholder
              : !Array.isArray(selectedOptions) && selectedOptions
              ? selectedOptions.label
              : placeholder}
          </div>

          {showChevron && (
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform ${
                open ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
            >
              <path
                d="M6 8l4 4 4-4"
                stroke="currentColor"
                strokeWidth={1.6}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </button>

      {/* Menu */}
      {open && (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 50,
            marginTop: 6,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            width: "100%",
            maxHeight: 280,
            overflow: "auto",
            boxShadow: "0 10px 30px rgba(0,0,0,.1)",
            ...listStyle,
          }}
        >
          {searchable && (
            <li className="p-2">
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </li>
          )}

          {filteredOptions.length === 0 ? (
            <li className="p-2">
              {emptyState ?? (
                <p className="text-sm text-gray-500">No results found</p>
              )}
            </li>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = multi
                ? Array.isArray(value) && value.includes(opt.value)
                : value === opt.value

              return (
                <li
                  key={String(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => selectOption(opt)}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md ${
                    highlightedIndex === idx
                      ? "bg-rose-50"
                      : "hover:bg-gray-50"
                  } ${opt.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {multi && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="pointer-events-none"
                    />
                  )}
                  {renderOption ? renderOption(opt, isSelected) : opt.label}
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
