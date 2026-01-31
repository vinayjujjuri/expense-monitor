"use client";

import { useEffect, useState } from "react";
import WeekRow from "../weekly-entries";

export default function WeeklyAccordion({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [month, year]);

  if (loading) {
    return (
      <div className="text-center text-gray-500 p-6">
        Loading weekly entries…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((week) => (
        <WeekRow
          key={week}
          week={week}
          month={month}
          year={year}
        />
      ))}
    </div>
  );
}
