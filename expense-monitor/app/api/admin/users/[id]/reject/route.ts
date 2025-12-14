import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import User from "@/models/User";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = context.params;

    const user = await User.findById(id);

    await User.findByIdAndUpdate(id, { status: "rejected" });
if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    user.status = "rejected";
    await user.save();

    return NextResponse.json({ message: "User rejected" },
        { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
