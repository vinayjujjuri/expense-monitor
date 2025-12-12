"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Monthly = { month: number; totalAmount: number };

export default function YearlyLineChart({ monthlyTotals }: { monthlyTotals: Monthly[] }) {
  // Ensure months 1..12 present
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const totalsMap = new Map<number, number>(monthlyTotals.map((m) => [m.month, m.totalAmount]));
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Monthly Spending",
        data: months.map((m) => totalsMap.get(m) ?? 0),
        fill: false,
        borderColor: "rgba(220, 38, 38, 0.8)",
        backgroundColor: "rgba(220, 38, 38, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return <Line data={data} options={options as any} />;
}
