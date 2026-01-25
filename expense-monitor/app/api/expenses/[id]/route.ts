import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth";
import mongoose from "mongoose";

/* ================= DELETE EXPENSE ================= */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: expenseId } = await params;
    const userId = (session as any).user.id;

    const deleted = await Transaction.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(expenseId),
      userId: new mongoose.Types.ObjectId(userId),
      type: "debit",
    });

    if (!deleted) {
      return NextResponse.json(
        { message: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE expense error:", err);
    return NextResponse.json(
      { message: "Failed to delete expense" },
      { status: 500 }
    );
  }
}

/* ================= UPDATE AMOUNT ONLY ================= */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json();

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { message: "Invalid amount" },
        { status: 400 }
      );
    }

    const { id } = await params;

    const updated = await Transaction.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId((session as any).user.id),
        type: "debit",
      },
      {
        $set: { amount },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      amount: updated.amount,
    });
  } catch (err) {
    console.error("UPDATE amount error:", err);
    return NextResponse.json(
      { message: "Failed to update expense" },
      { status: 500 }
    );
  }
}

