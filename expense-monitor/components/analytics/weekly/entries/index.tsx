"use client";

import { useState } from "react";
import DayGroup from "../day-group";

interface Expense {
  _id: string;
  amount: number;
  transactionDate: string;
  categoryId?: { name: string };
}

interface WeeklyEntriesProps {
  week: number;
  month: number;
  year: number;
}

export default function WeeklyEntries({
  week,
  month,
  year,
}: WeeklyEntriesProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<Expense[]>([]);

 function getLocalSundayWeekRange(
  week: number,
  month: number,
  year: number
) {
  const monthIndex = month - 1;

  // 1️⃣ First day of the month
  const firstOfMonth = new Date(year, monthIndex, 1);

  // 2️⃣ Find Sunday on or before the 1st
  const firstSunday = new Date(firstOfMonth);
  firstSunday.setDate(
    firstOfMonth.getDate() - firstOfMonth.getDay()
  );

  // 3️⃣ Calculate week start & end
  const startDate = new Date(firstSunday);
  startDate.setDate(firstSunday.getDate() + (week - 1) * 7);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
    label: `${startDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })} – ${endDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })}`,
  };
}


  function getWeekRange(week: number, month: number, year: number) {
  const start = new Date(year, month - 1, (week - 1) * 7 + 1);
  const end = new Date(year, month - 1, week * 7);

  const today = new Date();
  if (end > new Date(year, month, 0)) {
    end.setDate(new Date(year, month, 0).getDate());
  }

  return {
    startLabel: start.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    endLabel: end.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
  };
}

const range = getLocalSundayWeekRange(week, month, year);


  async function toggle() {
    if (!open && entries.length === 0) {
      setLoading(true);
      const res = await fetch(
        `/api/analytics/weekly/entries?week=${week}&month=${month}&year=${year}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setEntries(data);
      setLoading(false);
    }
    setOpen(!open);
  }

  return (
    <div className="rounded-xl bg-white shadow border border-gray-100">
      {/* Header */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >

        <div>
    <p className="font-semibold text-gray-800">
      Week {week}
    </p>
    <p className="text-xs text-gray-500">
      {range.label}
    </p>
  </div>
        <svg
          className={`h-5 w-5 text-gray-500 transition ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Content */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          {loading && (
            <p className="text-sm text-gray-500">
              Loading weekly entries…
            </p>
          )}

          {!loading && entries.length === 0 && (
            <p className="text-sm text-gray-500">
              No expenses recorded this week.
            </p>
          )}

          {!loading &&
            entries.length > 0 && (
              <DayGroup entries={entries} />
            )}
        </div>
      )}
    </div>
  );
}
