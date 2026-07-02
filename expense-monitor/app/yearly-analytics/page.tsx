import React from "react";
import Link from "next/link";
import YearlyLineChart from "@/components/analytics/yearly";
import YearlyCategoryPieChart from "@/components/analytics/yearly/categories";
import { headers } from "next/headers";

type Monthly = { month: number; totalAmount: number };
type Category = { category: string | null; totalAmount: number };

async function fetchAnalytics<T>(
  path: string,
  year?: number,
  options: RequestInit = {}
): Promise<T> {
  const incoming = await headers();

  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  const forwardedProto = incoming.get("x-forwarded-proto");
  const hostHeader = incoming.get("x-forwarded-host") ?? incoming.get("host");
  const protocol = forwardedProto ?? "http";
  const origin =
    envBase ?? (hostHeader ? `${protocol}://${hostHeader}` : "http://localhost:3000");

  const url = new URL(path, origin);
  if (year) url.searchParams.set("year", String(year));

  const cookie = incoming.get("cookie");
  const authorization = incoming.get("authorization");

  const merged = new Headers(options.headers as HeadersInit | undefined);
  if (cookie) merged.set("cookie", cookie);
  if (authorization && !merged.has("authorization")) {
    merged.set("authorization", authorization);
  }

  const res = await fetch(url.toString(), {
    cache: "no-store",
    ...options,
    headers: merged,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url.toString()}: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

const fetchYearly = (year?: number) =>
  fetchAnalytics<{ monthlyTotals: Monthly[] }>("/api/analytics/yearly", year, {
    credentials: "include",
  });

const fetchCategories = (year?: number) =>
  fetchAnalytics<{ categories: Category[] }>("/api/analytics/yearly/categories", year, {
    credentials: "include",
  });

export default async function Page() {
  const year = new Date().getFullYear();

  const [yearly, categories] = await Promise.all([
    fetchYearly(year),
    fetchCategories(year),
  ]);

  const monthlyTotals = yearly?.monthlyTotals ?? [];
  const categoryTotals = categories?.categories ?? [];

  return (
    <div className="p-6">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-600">
              Yearly analytics
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Yearly Analytics — {year}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Explore your year-long spending trends and category breakdowns. Want a quick year-end financial summary? Open the yearly savings page.
            </p>
          </div>

          <Link
            href="/yearly-savings-summary"
            className="inline-flex w-full items-center justify-center rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 sm:w-auto"
          >
            View yearly savings summary
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white p-4 rounded-3xl shadow-sm">
          <h2 className="text-lg font-medium mb-4">Monthly Spending</h2>
          <YearlyLineChart monthlyTotals={monthlyTotals} />
        </section>

        <section className="bg-white p-4 rounded-3xl shadow-sm">
          <h2 className="text-lg font-medium mb-4">Category Breakdown</h2>
          {categoryTotals.length === 0 ? (
            <p className="text-sm text-gray-500">
              No categorized debit data available for this year.
            </p>
          ) : (
            <YearlyCategoryPieChart categories={categoryTotals} />
          )}
        </section>
      </div>
    </div>
  );
}
