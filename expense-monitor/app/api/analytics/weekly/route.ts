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
    const month = Number(searchParams.get("month")); // 1–12
    const year = Number(searchParams.get("year"));
    const userId = (session as any).user.id;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    /**
     * ✅ Calendar-correct weekly aggregation
     */
    const weeklyDebit = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "debit",
          transactionDate: { $gte: startDate, $lt: endDate },
        },
      },

      // Get first day of month
      {
        $addFields: {
          firstDayOfMonth: {
            $dateFromParts: {
              year: { $year: "$transactionDate" },
              month: { $month: "$transactionDate" },
              day: 1,
            },
          },
        },
      },

      // Calculate weekday offset
      {
        $addFields: {
          firstDayWeekday: { $dayOfWeek: "$firstDayOfMonth" }, // 1=Sun
        },
      },

      // Calculate week number (calendar-aware)
      {
        $addFields: {
          weekOfMonth: {
            $ceil: {
              $divide: [
                {
                  $add: [
                    { $dayOfMonth: "$transactionDate" },
                    { $subtract: ["$firstDayWeekday", 1] },
                  ],
                },
                7,
              ],
            },
          },
        },
      },

      {
        $group: {
          _id: "$weekOfMonth",
          totalAmount: { $sum: "$amount" },
        },
      },

      { $sort: { _id: 1 } },
    ]);

    // Monthly credit
    const monthlyCredit = await Transaction.aggregate([
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
    ]);

    return NextResponse.json({
      weeklyDebit,
      totalCredit: monthlyCredit[0]?.totalCredit ?? 0,
    });
  } catch (err) {
    console.error("Weekly analytics error:", err);
    return NextResponse.json(
      { message: "Failed to fetch weekly analytics" },
      { status: 500 }
    );
  }
}
