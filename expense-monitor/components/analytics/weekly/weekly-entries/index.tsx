"use client";

import { useEffect, useState } from "react";
import DayGroup from "../day-group";
import { getLocalSundayWeekRange } from "@/utils/get-week-range";

function getWeekLabel(week: number, month: number, year: number) {
  const { startDate, endDate } = getLocalSundayWeekRange(week, month, year);

  return `${startDate.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  })} – ${endDate.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  })}`;
}

export default function WeekRow({
  week,
  month,
  year,
}: {
  week: number;
  month: number;
  year: number;
}) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(
      `/api/analytics/weekly/entries?week=${week}&month=${month}&year=${year}`,
      { cache: "no-store" }
    );
    setEntries(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [week, month, year]);

  const total = entries.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  return (
    <div className="rounded-xl bg-white shadow">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-4"
      >
        <div>
          <p className="font-medium text-gray-800">
            Week {week}
          </p>
          <p className="text-xs text-gray-500">
            {getWeekLabel(week, month, year)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-teal-700">
            ₹{total}
          </span>
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
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="border-t p-4">
          {loading ? (
            <p className="text-sm text-gray-500">
              Loading entries…
            </p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-gray-400">
              No expenses this week
            </p>
          ) : (
            <DayGroup entries={entries} />
          )}
        </div>
      )}
    </div>
  );
}
