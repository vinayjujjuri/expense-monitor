import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import User from "@/models/User";

export async function POST(req: Request) {
  await connectDB();

  const { name, email, password } = await req.json();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

  await User.create({
    name,
    email,
    password,
    role: "user",
    status: "pending",
  });

  return NextResponse.json(
    { message: "Registration submitted. Await admin approval." },
    { status: 201 }
  );
}
