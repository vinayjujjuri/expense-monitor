import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth";
import { getLocalSundayWeekRange } from "@/utils/get-week-range";

export async function GET(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const week = Number(searchParams.get("week"));
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    if (!week || !month || !year) {
      return NextResponse.json({ message: "Missing params" }, { status: 400 });
    }

    const { startDate, endDate } = getLocalSundayWeekRange(week, month, year);


    const entries = await Transaction.find({
      userId: new mongoose.Types.ObjectId((session as any).user.id),
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
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch weekly entries" },
      { status: 500 }
    );
  }
}
