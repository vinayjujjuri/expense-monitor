"use client";

import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { toTitleCase } from "@/utils/format";

ChartJS.register(ArcElement, Tooltip, Legend);

type Category = { category: string | null; totalAmount: number };

function randomPastelColor(seed: number) {
  // deterministic-ish pastel generator
  const hue = (seed * 57) % 360;
  return `hsl(${hue} 70% 85%)`;
}

export default function YearlyCategoryPieChart({ categories }: { categories: Category[] }) {
  const labels = categories.map((c) => toTitleCase(c.category ?? "") ?? "Uncategorized");
  const dataValues = categories.map((c) => c.totalAmount);
  const backgroundColor = categories.map((_, i) => randomPastelColor(i + 1));

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor,
      },
    ],
  };

  return <Pie data={data as any} />;
}
