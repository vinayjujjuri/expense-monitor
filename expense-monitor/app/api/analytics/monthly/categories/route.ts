import { NextResponse } from "next/server"
import { connectDB } from "@/libs/db"
import Transaction from "@/models/transaction"
import DebitCategory from "@/models/debitCategory"
import { getServerSession } from "next-auth"
import authOptions from "@/libs/auth"
import mongoose from "mongoose"

export async function GET() {
  try {
    await connectDB()
    const session = await getServerSession(authOptions as any)

    if (!session || !(session as any).user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = new mongoose.Types.ObjectId(
      (session as any).user.id
    )

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const data = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "debit",
          transactionDate: {
            $gte: startOfMonth,
            $lt: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "debitcategories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          categoryId: "$category._id",
          name: "$category.name",
          amount: "$totalAmount",
        },
      },
      { $sort: { amount: -1 } },
    ])

    const totalSpent = data.reduce(
      (sum, c) => sum + c.amount,
      0
    )

    return NextResponse.json({
      categories: data,
      totalSpent,
    })
  } catch (err) {
    console.error("Monthly category analytics error:", err)
    return NextResponse.json(
      { message: "Failed to fetch monthly debit categories" },
      { status: 500 }
    )
  }
}
