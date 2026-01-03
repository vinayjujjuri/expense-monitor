import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import DebitCategory from "@/models/debitCategory";
import Transaction from "@/models/transaction";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth";
import mongoose from "mongoose";

export async function PATCH(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: categoryId } = await context.params;

    const session = await getServerSession(authOptions as any);
    if (!session || !(session as any).user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { message: "Invalid category id" },
        { status: 400 }
      );
    }

    const userId = (session as any).user.id;

    // prevent disabling if used
    const usedCount = await Transaction.countDocuments({
      userId,
      type: "debit",
      categoryId,
    });

    if (usedCount > 0) {
      return NextResponse.json(
        { message: "Category is already used in transactions" },
        { status: 400 }
      );
    }

    const updated = await DebitCategory.findOneAndUpdate(
      { _id: categoryId, userId },
      { isActive: false },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Debit category disabled successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
