import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import EventExpense from "@/models/expense-event";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth";

/* ---------------- POST: Add Event Expense ---------------- */
export async function POST(
  req: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ MUST await params
    const { eventId } = await context.params;

    const { expenseName, amount, expenseDate } = await req.json();

    if (!expenseName || !amount || !expenseDate) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await EventExpense.create({
      eventId: new mongoose.Types.ObjectId(eventId),
      userId: new mongoose.Types.ObjectId((session as any).user.id),
      expenseName,
      amount: Number(amount),
      expenseDate: new Date(expenseDate),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Event Expense POST error:", err);
    return NextResponse.json(
      { message: "Failed to add expense" },
      { status: 500 }
    );
  }
}

/* ---------------- GET: Day-wise Event Expenses ---------------- */
export async function GET(
  _: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ MUST await params
    const { eventId } = await context.params;

    const data = await EventExpense.aggregate([
      {
        $match: {
          eventId: new mongoose.Types.ObjectId(eventId),
          userId: new mongoose.Types.ObjectId((session as any).user.id),
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$expenseDate",
            },
          },
          expenses: {
            $push: {
              expenseName: "$expenseName",
              amount: "$amount",
            },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Event Expense GET error:", err);
    return NextResponse.json(
      { message: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}
