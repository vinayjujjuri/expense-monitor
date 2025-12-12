import { NextResponse } from "next/server";
import { startOfYear, endOfYear } from "date-fns";
import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";

export async function GET(request: Request) {
  await connectDB();

  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year");
  const year = yearParam ? Number(yearParam) : new Date().getFullYear();

  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 11, 31));

  // Aggregate totals per category for the whole year
  const pipeline = [
    { $match: { type: "debit", createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
      },
    },
    { $sort: { totalAmount: -1 } },
    {
      $project: {
        _id: 0,
        category: "$_id",
        totalAmount: 1,
      },
    },
  ];

  const results = await (Transaction.aggregate(pipeline as any) as any).exec();

  return NextResponse.json({ year, categories: results });
}
