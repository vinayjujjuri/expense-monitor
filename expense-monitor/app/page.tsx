import Image from "next/image";
import Link from "next/link";
import MonthlyPieChart from "@/components/analytics/monthly-chart";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-roboto">
  <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            href="/add-credit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 text-white px-5 transition-colors hover:bg-emerald-700 md:w-[158px]"
          >
            Add credit amount
          </Link>

          <Link
            href="/add-debit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-rose-600 text-white px-5 transition-colors hover:bg-rose-700 md:w-[158px]"
          >
            Add debit amount
          </Link>

          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now ( vercel )
          </a>
        </div>
        <div className="w-full max-w-3xl mt-8">
          <MonthlyPieChart />
        </div>
    </div>
  );
}
