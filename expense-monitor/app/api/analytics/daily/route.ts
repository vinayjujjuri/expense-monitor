import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth";
import mongoose from "mongoose";

/**
 * Returns IST start & end converted to UTC
 */
function getISTRange(offsetDays = 0) {
  const now = new Date();

  // IST offset = +5:30
  const istOffsetMs = 5.5 * 60 * 60 * 1000;

  const ist = new Date(now.getTime() + istOffsetMs);
  ist.setDate(ist.getDate() + offsetDays);
  ist.setHours(0, 0, 0, 0);

  const start = new Date(ist.getTime() - istOffsetMs);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
}

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(
      (session as any).user.id
    );

    const todayRange = getISTRange(0);
    const yesterdayRange = getISTRange(-1);

    const baseMatch = {
      userId,
      type: "debit",
    };

    const [today, yesterday] = await Promise.all([
      Transaction.find({
        ...baseMatch,
        transactionDate: {
          $gte: todayRange.start,
          $lt: todayRange.end,
        },
      })
        .populate("categoryId", "name")
        .sort({ transactionDate: -1 })
        .lean(),

      Transaction.find({
        ...baseMatch,
        transactionDate: {
          $gte: yesterdayRange.start,
          $lt: yesterdayRange.end,
        },
      })
        .populate("categoryId", "name")
        .sort({ transactionDate: -1 })
        .lean(),
    ]);

    return NextResponse.json({
      today,
      yesterday,
    });
  } catch (error) {
    console.error("Daily analytics error:", error);
    return NextResponse.json(
      { message: "Failed to fetch daily expenses" },
      { status: 500 }
    );
  }
}
