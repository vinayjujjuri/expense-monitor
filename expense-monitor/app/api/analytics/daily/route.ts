import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function getISTRange(offsetDays = 0) {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;

  const ist = new Date(now.getTime() + istOffset);
  ist.setDate(ist.getDate() + offsetDays);
  ist.setHours(0, 0, 0, 0);

  const start = new Date(ist.getTime() - istOffset);
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

    const today = getISTRange(0);
    const yesterday = getISTRange(-1);

    const baseMatch = {
      userId,
      type: "debit",
    };

    const [todayData, yesterdayData] = await Promise.all([
      Transaction.find({
        ...baseMatch,
        transactionDate: {
          $gte: today.start,
          $lt: today.end,
        },
      })
        .populate("categoryId", "name")
        .sort({ transactionDate: -1 })
        .lean(),

      Transaction.find({
        ...baseMatch,
        transactionDate: {
          $gte: yesterday.start,
          $lt: yesterday.end,
        },
      })
        .populate("categoryId", "name")
        .sort({ transactionDate: -1 })
        .lean(),
    ]);

    return NextResponse.json({
      today: todayData,
      yesterday: yesterdayData,
    });
  } catch (err) {
    console.error("Daily analytics error:", err);
    return NextResponse.json(
      { message: "Failed to fetch daily expenses" },
      { status: 500 }
    );
  }
}
