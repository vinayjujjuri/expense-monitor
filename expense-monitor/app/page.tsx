import MonthlyPieChart from "@/components/analytics/monthly-chart";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-8 font-roboto">
      <section className="w-full rounded-lg bg-white shadow-sm dark:bg-slate-800 border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Quick overview of this month's expenses</p>
          </div>
        </div>

        <div className="mt-6 w-full">
          <div className="w-full rounded-md bg-white/50 p-4 dark:bg-transparent">
            <MonthlyPieChart />
          </div>
        </div>
      </section>
    </div>
  );
}
