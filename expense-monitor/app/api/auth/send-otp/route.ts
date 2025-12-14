import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import EmailOtp from "@/models/emailOtp";
import User from "@/models/User";
import { sendOtpEmail } from "@/libs/mail";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Prevent OTP for already registered email
    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🟢 STEP 1: Send email FIRST
    await sendOtpEmail(email, otp);

    // 🟢 STEP 2: Save OTP ONLY if email succeeds
    await EmailOtp.deleteMany({ email });

    await EmailOtp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
    });

    return NextResponse.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Send OTP Error:", error);

    // ❌ Ensure no OTP exists if email failed
    if ((error as any)?.email) {
      await EmailOtp.deleteMany({ email: (error as any).email });
    }

    return NextResponse.json(
      { message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
