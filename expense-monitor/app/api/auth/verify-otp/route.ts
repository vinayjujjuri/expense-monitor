import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import EmailOtp from "@/models/emailOtp";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    const record = await EmailOtp.findOne({ email, otp });

    if (!record) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "OTP expired" },
        { status: 400 }
      );
    }

    // OTP verified → delete it
    await EmailOtp.deleteMany({ email });

    return NextResponse.json({ message: "Email verified" });
  } catch {
    return NextResponse.json(
      { message: "OTP verification failed" },
      { status: 500 }
    );
  }
}
