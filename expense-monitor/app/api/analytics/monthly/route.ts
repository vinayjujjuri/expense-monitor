import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import mongoose from "mongoose";

import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";
import { getServerSession } from "next-auth/next";
import authOptions from "@/libs/auth";

export async function GET(_req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(
      (session as any).user.id
    );

    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    /**
     * Aggregation:
     * 1. Match debit transactions for logged-in user
     * 2. Join debitcategories collection
     * 3. Group by category
     * 4. Calculate totals
     */
    const aggregation = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "debit",
          categoryId: { $ne: null },
          transactionDate: { $gte: start, $lte: end },
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
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: false, // important
        },
      },
      {
        $group: {
          _id: "$category._id",
          name: { $first: "$category.name" },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    /**
     * Normalize response for frontend
     */
    const categories = aggregation.map((item) => ({
      categoryId: item._id,
      name: item.name,
      amount: item.totalAmount,
    }));

    const totalSpent = categories.reduce(
      (sum, c) => sum + c.amount,
      0
    );

    return NextResponse.json({
      month: start.getMonth() + 1,
      year: start.getFullYear(),
      totalSpent,
      categories,
    });
  } catch (error) {
    console.error("monthly analytics error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
