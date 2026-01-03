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
  const [weeklyDebit, setWeeklyDebit] = useState<number[]>([0, 0, 0, 0, 0]);
  const [totalCredit, setTotalCredit] = useState(0);
  const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/analytics/weekly?month=${month}&year=${year}`);
      const result = await res.json();

      const debitData = [0, 0, 0, 0, 0];
      result.weeklyDebit.forEach((w: any) => {
        debitData[w._id - 1] = w.totalAmount;
      });

      setWeeklyDebit(debitData);
      setTotalCredit(result.totalCredit);
      setLoading(false);
    };

    fetchData();
  }, [userId, month, year]);


  const renderChartData = () => {
    if (loading) {
      return <p className="text-center text-gray-500">Loading chart...</p>;
    }

    if (weeklyDebit.every((amount) => amount === 0)) {
      return (
        <p className="text-center text-gray-500">
          No data available for the selected month and year.
        </p>
      );
    }

    return (
      <Bar
        data={{
          labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
          datasets: [
            {
              label: "Weekly Debit",
              data: weeklyDebit,
              backgroundColor: [
                "rgba(20, 184, 166, 0.7)", // teal
                "rgba(56, 189, 248, 0.7)", // sky
                "rgba(99, 102, 241, 0.7)", // indigo
                "rgba(168, 85, 247, 0.7)", // violet
                "rgba(34, 197, 94, 0.7)",  // green
              ],
              hoverBackgroundColor: [
                "rgba(20, 184, 166, 0.9)",
                "rgba(56, 189, 248, 0.9)",
                "rgba(99, 102, 241, 0.9)",
                "rgba(168, 85, 247, 0.9)",
                "rgba(34, 197, 94, 0.9)",
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
                text: "Credit Amount (Reference)",
              },
            },
             x: {
              title: {
                display: true,
                text: "Weekly Debit Amount",
              },
            },
          },
        }}
      />
    );
  };

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
      <div className="rounded-xl bg-white p-4 shadow">
        {renderChartData()}
      </div>
    </div>
  );
}
