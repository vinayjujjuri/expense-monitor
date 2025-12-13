"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-white/60 dark:bg-black/60 backdrop-blur sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-3">
              <img src="/icon_exp_trac.png" alt="Expense Monitor logo" width={35} height={35} className="rounded" />
              <span className="text-lg font-semibold tracking-tight">Expense Monitor</span>
            </Link>
            <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">Track credits & debits</span>
          </div>

          <nav className="hidden md:flex items-center gap-3">
            <Link href="/add-credit" className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Add credit</Link>
            <Link href="/add-debit" className="inline-flex items-center rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">Add debit</Link>
            <Link href="/yearly-analytics" className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">Yearly</Link>
            <a href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app" target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90">Deploy</a>
          </nav>

          <div className="md:hidden">
            <button onClick={() => setOpen(!open)} aria-label="Toggle menu" className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
              <svg className={`h-6 w-6 transition-transform ${open ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8 flex flex-col gap-2">
            <Link href="/add-credit" onClick={() => setOpen(false)} className="w-full rounded-md bg-emerald-600 px-4 py-2 text-center text-white">Add credit</Link>
            <Link href="/add-debit" onClick={() => setOpen(false)} className="w-full rounded-md bg-rose-600 px-4 py-2 text-center text-white">Add debit</Link>
            <Link href="/yearly-analytics" onClick={() => setOpen(false)} className="w-full rounded-md bg-sky-600 px-4 py-2 text-center text-white">Yearly analytics</Link>
            <a href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app" target="_blank" rel="noreferrer" className="w-full rounded-md bg-gray-900 px-4 py-2 text-center text-white">Deploy</a>
          </div>
        </div>
      )}
    </header>
  );
}
