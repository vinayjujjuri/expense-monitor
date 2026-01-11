import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";
import DebitCategory from "@/models/debitCategory";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth";
import mongoose from "mongoose";
import {
  startOfToday,
  endOfToday,
  startOfYesterday,
  endOfYesterday,
} from "date-fns";

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

    const baseMatch = {
      userId,
      type: "debit",
    };

    const [today, yesterday] = await Promise.all([
      Transaction.find({
        ...baseMatch,
        transactionDate: {
          $gte: startOfToday(),
          $lte: endOfToday(),
        },
      })
        .populate("categoryId", "name")
        .sort({ transactionDate: -1 })
        .lean(),

      Transaction.find({
        ...baseMatch,
        transactionDate: {
          $gte: startOfYesterday(),
          $lte: endOfYesterday(),
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
