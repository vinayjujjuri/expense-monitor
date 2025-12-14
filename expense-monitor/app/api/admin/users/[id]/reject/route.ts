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

    user.status = "rejected";
    await user.save();

    return NextResponse.json(
      { message: "User rejected successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reject error:", error);
    return NextResponse.json(
      { message: "Failed to reject user" },
      { status: 500 }
    );
  }
}
