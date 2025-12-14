import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import User from "@/models/User";

export async function POST(req: Request) {
  await connectDB();

  const { name, email, password, secret } = await req.json();

  // 🔐 Simple protection (env-based)
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    return NextResponse.json(
      { message: "Admin already exists" },
      { status: 400 }
    );
  }

  await User.create({
    name,
    email,
    password,
    role: "admin",
    status: "approved",
  });

  return NextResponse.json(
    { message: "Admin user created successfully" },
    { status: 201 }
  );
}
