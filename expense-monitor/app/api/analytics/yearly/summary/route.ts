import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import authOptions from "@/libs/auth";

export async function GET(request: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId((session as any).user.id);
    const url = new URL(request.url);
    const yearParam = url.searchParams.get("year");
    const year = yearParam ? Number(yearParam) : new Date().getFullYear();

    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const [credit, debit] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId,
            type: "credit",
            transactionDate: { $gte: start, $lt: end },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId,
            type: "debit",
            transactionDate: { $gte: start, $lt: end },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    return NextResponse.json({
      year,
      totalCredit: credit[0]?.total ?? 0,
      totalDebit: debit[0]?.total ?? 0,
    });
  } catch (error) {
    console.error("Yearly savings summary error:", error);
    return NextResponse.json(
      { message: "Failed to fetch yearly savings summary" },
      { status: 500 }
    );
  }
}
