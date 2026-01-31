import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";
import "@/models/debitCategory";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import authOptions from "@/libs/auth";
import { getLocalSundayWeekRange } from "@/utils/get-week-range";

export async function GET(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session as any).user.id;

    const { searchParams } = new URL(req.url);

    const now = new Date();

    // ✅ Safe defaults for first page load
    const week =
      Number(searchParams.get("week")) ||
      Math.ceil(now.getDate() / 7);

    const month =
      Number(searchParams.get("month")) ||
      now.getMonth() + 1;

    const year =
      Number(searchParams.get("year")) ||
      now.getFullYear();

    // ✅ Local Sunday-based range (UTC-safe)
    const { startDate, endDate } =
      getLocalSundayWeekRange(week, month, year);

    const entries = await Transaction.find({
      userId: new mongoose.Types.ObjectId(userId),
      type: "debit",
      transactionDate: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("categoryId", "name")
      .sort({ transactionDate: -1 })
      .lean();

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Weekly entries error:", error);
    return NextResponse.json(
      { message: "Failed to fetch weekly entries" },
      { status: 500 }
    );
  }
}
