"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import YearMonthSelector from "../../year-month-selector";
import { useSession } from "next-auth/react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function WeeklyBarChart() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [weeklyDebit, setWeeklyDebit] = useState<number[]>([]);
  const [totalCredit, setTotalCredit] = useState(0);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);

      const res = await fetch(
        `/api/analytics/weekly?month=${month}&year=${year}`
      );
      const result = await res.json();

      // ✅ ALWAYS build a fresh 5-week array
      const weekData = [0, 0, 0, 0, 0];

      if (Array.isArray(result.weeklyDebit)) {
        result.weeklyDebit.forEach((item: any) => {
          const weekIndex = item._id - 1; // week 1 → index 0
          if (weekIndex >= 0 && weekIndex < 5) {
            weekData[weekIndex] = item.totalAmount;
          }
        });
      }

      setWeeklyDebit(weekData);
      setTotalCredit(result.totalCredit ?? 0);
      setLoading(false);
    };

    fetchData();
  }, [userId, month, year]);

  const hasAnyData = weeklyDebit.some((amt) => amt > 0);

  if (loading) {
    return <p className="text-center text-gray-500">Loading data...</p>;
  }

  const renderData = () => {
    if (!hasAnyData) {
    return (
      <div className="rounded-xl bg-white p-6 shadow text-center text-gray-500">
        No data available for the selected month.
      </div>
    );
  } else {
    return (
      <div className="rounded-xl bg-white p-4 shadow">
        <Bar
          data={{
            labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
            datasets: [
              {
                label: "Weekly Expenses",
                data: weeklyDebit,
                backgroundColor: [
                  "rgba(20, 184, 166, 0.7)",
                  "rgba(56, 189, 248, 0.7)",
                  "rgba(99, 102, 241, 0.7)",
                  "rgba(168, 85, 247, 0.7)",
                  "rgba(34, 197, 94, 0.7)",
                ],
                borderRadius: 6,
                barThickness: 40,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: (ctx) =>
                    `Debit: ₹${ctx.raw} | Monthly Credit: ₹${totalCredit}`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: totalCredit || undefined,
                title: {
                  display: true,
                  text: "Amount",
                },
              },
            },
          }}
        />
      </div>
    )
  }
  }

  return (
    <div className="space-y-6">
      <YearMonthSelector
        year={year}
        month={month}
        onChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
      />
      {renderData()}
    </div>
  );
}
