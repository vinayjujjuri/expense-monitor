import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import authOptions from "@/libs/auth";

export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = (session as any).user.id;
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const [weeklyDebit, monthlyCredit] = await Promise.all([
      // 🟥 Weekly debit
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: "debit",
            transactionDate: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $addFields: {
            week: {
              $ceil: { $divide: [{ $dayOfMonth: "$transactionDate" }, 7] },
            },
          },
        },
        {
          $group: {
            _id: "$week",
            totalAmount: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 🟩 Monthly credit
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: "credit",
            transactionDate: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalCredit: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      weeklyDebit,
      totalCredit: monthlyCredit[0]?.totalCredit ?? 0,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to fetch weekly analytics" },
      { status: 500 }
    );
  }
}

