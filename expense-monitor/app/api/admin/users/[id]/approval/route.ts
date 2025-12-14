import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import User from "@/models/User";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    user.status = "approved";
    await user.save();

    return NextResponse.json(
      { message: "User approved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json(
      { message: "Failed to approve user" },
      { status: 500 }
    );
  }
}
