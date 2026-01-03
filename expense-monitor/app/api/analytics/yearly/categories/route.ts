import { NextResponse } from "next/server";
import { startOfYear, endOfYear } from "date-fns";
import mongoose from "mongoose";
import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";
import { getServerSession } from "next-auth/next";
import authOptions from "@/libs/auth";

export async function GET(request: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(
      (session as any).user.id
    );

    const url = new URL(request.url);
    const yearParam = url.searchParams.get("year");
    const year = yearParam ? Number(yearParam) : new Date().getFullYear();

    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(new Date(year, 11, 31));

    const categories = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "debit",
          transactionDate: { $gte: start, $lte: end },
          categoryId: { $exists: true, $ne: null }, // 🔑 IMPORTANT
        },
      },
      {
        $lookup: {
          from: "debitcategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.name",
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { totalAmount: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalAmount: 1,
        },
      },
    ]);

    return NextResponse.json({ year, categories });
  } catch (error) {
    console.error("Yearly category analytics error:", error);
    return NextResponse.json(
      { message: "Failed to fetch yearly category analytics" },
      { status: 500 }
    );
  }
}
