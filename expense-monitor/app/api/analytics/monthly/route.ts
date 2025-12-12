import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";

export async function GET(_req: NextRequest) {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  try {
    await connectDB();

    const aggregation = await Transaction.aggregate([
      {
        $match: {
          type: "debit",
          createdAt: { $gte: start, $lte: end },
          category: { $ne: null },
        },
      },
      {
        $facet: {
          categories: [
            { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
            { $sort: { totalAmount: -1 } },
          ],
          totalSpent: [{ $group: { _id: null, totalAmount: { $sum: "$amount" } } }],
        },
      },
    ]);

    const categories = aggregation?.[0]?.categories ?? [];
    const totalSpent = aggregation?.[0]?.totalSpent?.[0]?.totalAmount ?? 0;

  const payload = {
      month: start.getMonth() + 1,
      year: start.getFullYear(),
      totalSpent,
      categories,
    };

  // Log the payload for debugging/inspection
  // eslint-disable-next-line no-console
  console.log("monthly analytics payload:", JSON.stringify(payload));

  return NextResponse.json(payload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("monthly analytics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
