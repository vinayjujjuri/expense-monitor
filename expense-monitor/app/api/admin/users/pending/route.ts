import { NextResponse } from "next/server";
import {connectDB} from "@/libs/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const pendingUsers = await User.find({ status: "pending" })
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json(pendingUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending users:", error);
    return NextResponse.json(
      { message: "Failed to fetch pending users" },
      { status: 500 }
    );
  }
}
