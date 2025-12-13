import React, { useEffect, useRef, useState } from 'react'

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
}

/**
 * Reusable, accessible dropdown.
 * - single-select by default
 * - optional multi-select
 * - keyboard navigation (ArrowUp/Down, Enter, Space, Esc)
 */
export default function Dropdown<T = unknown>(props: DropdownProps<T>) {
  const {
    options,
    value,
    onChange,
    placeholder = 'Select...',
    multi = false,
    renderValue,
    renderOption,
    className,
    id,
    buttonClassName,
    listStyle,
  showChevron = true,
  } = props

  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // derive selected options
  const selectedOptions = React.useMemo<Option<T>[] | Option<T> | null>(() => {
    if (multi) {
      const vals = Array.isArray(value) ? ([...value] as T[]) : ([] as T[])
      return options.filter((o) => vals.includes(o.value))
    }
    return options.find((o) => o.value === value) ?? null
  }, [options, value, multi])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function toggleOpen() {
    setOpen((s) => !s)
  }

  function selectOption(option: Option<T>) {
    if (option.disabled) return
    if (multi) {
      const vals = Array.isArray(value) ? ([...value] as T[]) : ([] as T[])
      const exists = vals.includes(option.value)
      const next = exists ? vals.filter((v) => v !== option.value) : [...vals, option.value]
      onChange?.(next)
    } else {
      onChange?.(option.value)
      setOpen(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true)
      setHighlightedIndex(0)
      e.preventDefault()
      return
    }

    if (!open) return

    if (e.key === 'ArrowDown') {
      setHighlightedIndex((i) => Math.min(i + 1, options.length - 1))
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((i) => Math.max(i - 1, 0))
      e.preventDefault()
    } else if (e.key === 'Enter' || e.key === ' ') {
      const opt = options[highlightedIndex]
      if (opt) selectOption(opt)
      e.preventDefault()
    } else if (e.key === 'Escape') {
      setOpen(false)
      e.preventDefault()
    }
  }

  return (
    <div
      id={id}
      ref={rootRef}
      className={className}
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-expanded={open}
      aria-haspopup="listbox"
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggleOpen}
        className={buttonClassName ?? 'dropdown-trigger'}
        style={{ minWidth: 160, padding: '8px 12px' }}
      >
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1 text-left">
        {renderValue
      ? renderValue(selectedOptions)
      : multi
      ? (Array.isArray(selectedOptions) && selectedOptions.length
        ? selectedOptions.map((s) => s.label).join(', ')
        : placeholder)
      : (!Array.isArray(selectedOptions) && selectedOptions
        ? selectedOptions.label
        : placeholder)}
      </div>
      {showChevron && (
        <svg className={`h-4 w-4 text-gray-500 transform transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-labelledby={id}
          tabIndex={-1}
          style={{
            position: 'absolute',
            zIndex: 999,
            marginTop: 6,
            padding: 6,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: 6,
            listStyle: 'none',
            maxHeight: 260,
            overflow: 'auto',
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
            ...(listStyle || {})
          }}
        >
          {options.map((opt, idx) => {
            const isSelected = multi
              ? Array.isArray(value) && value.includes(opt.value)
              : (!Array.isArray(value) && value === opt.value)

            const highlighted = idx === highlightedIndex

            return (
              <li
                key={String(opt.value) + idx}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => selectOption(opt)}
                style={{
                  padding: '8px 10px',
                  background: highlighted ? '#f2f6ff' : 'transparent',
                  color: opt.disabled ? '#999' : '#111',
                  cursor: opt.disabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {renderOption ? (
                  renderOption(opt, !!isSelected)
                ) : (
                  <>
                    {multi && (
                      <input
                        type="checkbox"
                        readOnly
                        tabIndex={-1}
                        checked={!!isSelected}
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                    <span>{opt.label}</span>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
