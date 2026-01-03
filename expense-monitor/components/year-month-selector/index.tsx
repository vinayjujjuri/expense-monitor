"use client";

import Dropdown from "../dropdown";

interface YearMonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function YearMonthSelector({
  year,
  month,
  onChange,
}: YearMonthSelectorProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Last 3 years including current
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  // Disable future months when current year is selected
  const monthOptions = months.map((m, idx) => {
    const value = idx + 1;
    const isFuture =
      year === currentYear && value > currentMonth;

    return {
      label: m,
      value,
      disabled: isFuture,
    };
  });

  return (
    <div className="mx-auto my-6 w-full max-w-xl rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur-md sm:p-6">
      <h2 className="mb-4 text-center text-lg font-semibold text-gray-800 sm:text-xl">
        Select Period
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        {/* Year */}
        <div className="flex w-full flex-col">
          <label className="mb-1 text-sm font-medium text-gray-600">
            Year
          </label>
          <Dropdown
            options={years.map((y) => ({
              label: y.toString(),
              value: y,
            }))}
            value={year}
            onChange={(val) =>
              onChange(val as number, month)
            }
            placeholder="Select year"
            buttonClassName="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>

        {/* Month */}
        <div className="flex w-full flex-col">
          <label className="mb-1 text-sm font-medium text-gray-600">
            Month
          </label>
          <Dropdown
            options={monthOptions}
            value={month}
            onChange={(val) =>
              onChange(year, val as number)
            }
            placeholder="Select month"
            buttonClassName="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>
      </div>
    </div>
  );
}
