import { NextResponse } from "next/server";
import { connectDB } from "@/libs/db";
import Event from "@/models/event";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth";

export async function POST(req: Request) {
  await connectDB();
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { name, startDate } = await req.json();

  const event = await Event.create({
    userId: (session as any).user.id,
    name,
    startDate,
  });

  return NextResponse.json(event);
}

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json([], { status: 401 });

  const events = await Event.find({
    userId: (session as any).user.id,
  }).sort({ createdAt: -1 });

  return NextResponse.json(events);
}
