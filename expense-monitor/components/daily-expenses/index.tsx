"use client";

import { useEffect, useState } from "react";
import DaySectionTemplate from "./daily-expenses-template";

interface Expense {
  _id: string;
  amount: number;
  transactionDate: string;
  categoryId?: { name: string };
}

export default function DailyExpensesComponent() {
  const [today, setToday] = useState<Expense[]>([]);
  const [yesterday, setYesterday] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/analytics/daily", {
        credentials: "include",
      });
      const data = await res.json();
      setToday(data.today ?? []);
      setYesterday(data.yesterday ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-500">Loading daily expenses...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Daily Expenses
      </h1>

      <DaySectionTemplate title="Today" expenses={today} />
      <DaySectionTemplate title="Yesterday" expenses={yesterday} />
    </div>
  );
}


