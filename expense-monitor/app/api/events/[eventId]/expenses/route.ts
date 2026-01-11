import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import EventExpense from "@/models/expense-event";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth";

/* ---------------- POST: Add Event Expense ---------------- */
export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    await connectDB();

     const session = await getServerSession(authOptions as any);
      if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { expenseName, amount, expenseDate, eventId } = await req.json();

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
    console.error("POST Event Expense error:", err);
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
      if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { eventId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { message: "Invalid eventId" },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(
      (session as any).user.id
    );
    const eventObjectId = new mongoose.Types.ObjectId(eventId);

    console.log("MATCHING eventId:", eventObjectId.toString());
    console.log("MATCHING userId:", userObjectId.toString());

    const data = await EventExpense.aggregate([
      {
        $match: {
          eventId: eventObjectId,
          userId: userObjectId,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$expenseDate",
              timezone: "Asia/Kolkata", // ✅ IMPORTANT
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

    console.log("AGG RESULT:", data);

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET Event Expenses error:", err);
    return NextResponse.json(
      { message: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}


