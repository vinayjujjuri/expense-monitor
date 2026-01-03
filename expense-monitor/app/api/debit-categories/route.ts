import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth";
import { connectDB } from "@/libs/db";
import mongoose from "mongoose";
import DebitCategory from "@/models/debitCategory";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions as any);

    if (!session || !(session as any).user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(
      (session as any).user.id
    );

    const categories = await DebitCategory.find({
      userId,
      isActive: true,
    }).sort({ createdAt: -1 });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET debit-categories error:", error);
    return NextResponse.json(
      { message: "Failed to fetch debit categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions as any);

    if (!session || !(session as any).user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { message: "Debit category name is required" },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(
      (session as any).user.id
    );

    // Prevent duplicate category names per user
    const exists = await DebitCategory.findOne({
      userId,
      name: name.trim(),
      isActive: true,
    });

    if (exists) {
      return NextResponse.json(
        { message: "Debit category already exists" },
        { status: 409 }
      );
    }

    const category = await DebitCategory.create({
      userId,
      name: name.trim(),
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST debit-categories error:", error);
    return NextResponse.json(
      { message: "Failed to create debit category" },
      { status: 500 }
    );
  }
}
