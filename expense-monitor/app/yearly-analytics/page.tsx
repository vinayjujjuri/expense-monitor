
import YearlyLineChart from "@/components/analytics/yearly";
import YearlyCategoryPieChart from "@/components/analytics/yearly/categories";

type Monthly = { month: number; totalAmount: number };
type Category = { category: string | null; totalAmount: number };

async function fetchYearly(year?: number) {
  const url = new URL(process.env.MONGODB_URI ?? "http://localhost:3000");
  url.pathname = "/api/analytics/yearly";
  if (year) url.searchParams.set("year", String(year));
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch yearly data");
  return res.json();
}

async function fetchCategories(year?: number) {
  const url = new URL(process.env.MONGODB_URI ?? "http://localhost:3000");
  url.pathname = "/api/analytics/yearly/categories";
  if (year) url.searchParams.set("year", String(year));
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch category data");
  return res.json();
}

export default async function Page() {
  const year = new Date().getFullYear();

  const [yearly, categories] = await Promise.all([fetchYearly(year), fetchCategories(year)]);

  const monthlyTotals: Monthly[] = yearly.monthlyTotals ?? [];
  const categoryTotals: Category[] = categories.categories ?? [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Yearly Analytics — {year}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-medium mb-4">Monthly Spending</h2>
          <YearlyLineChart monthlyTotals={monthlyTotals} />
        </section>

        <section className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-medium mb-4">Category Breakdown</h2>
          <YearlyCategoryPieChart categories={categoryTotals} />
        </section>
      </div>
    </div>
  );
}
