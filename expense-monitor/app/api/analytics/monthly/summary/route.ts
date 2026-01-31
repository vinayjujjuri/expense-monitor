import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import authOptions from "@/libs/auth";

export async function GET(req: Request) {
  await connectDB();

  const session = await getServerSession(authOptions as any);
  if (!session || !(session as any).user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const userId = new mongoose.Types.ObjectId(
    (session as any).user.id
  );

  const [credit, debit] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          userId,
          type: "credit",
          transactionDate: { $gte: startDate, $lt: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          userId,
          type: "debit",
          transactionDate: { $gte: startDate, $lt: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  return NextResponse.json({
    totalCredit: credit[0]?.total ?? 0,
    totalDebit: debit[0]?.total ?? 0,
  });
}
