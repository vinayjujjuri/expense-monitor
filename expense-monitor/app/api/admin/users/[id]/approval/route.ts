import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import User from "@/models/User";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const user = await User.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    user.status = "approved";
    await user.save();
    return NextResponse.json({ message: "User approved" },{ status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
