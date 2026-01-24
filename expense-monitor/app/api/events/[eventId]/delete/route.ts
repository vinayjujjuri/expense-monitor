import { NextResponse } from "next/server"
import { connectDB } from "@/libs/db"
import Event from "@/models/event"
import EventExpense from "@/models/expense-event"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import authOptions from "@/libs/auth"

export async function DELETE(
  _req: Request,
  context: { params: { eventId: string } }
) {
  let session: mongoose.ClientSession | null = null

  try {
    await connectDB()

    session = await mongoose.startSession()

    const authSession = await getServerSession(authOptions as any)
    if (!authSession || !(authSession as any).user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log('DELETE /api/events/[eventId]/delete - authSession:', !!authSession)
    console.log('auth user:', (authSession as any).user)

    const userId = new mongoose.Types.ObjectId(
      (authSession as any).user.id
    )

    const params = await (context as any).params
    const eventId = new mongoose.Types.ObjectId(params.eventId)

    session.startTransaction()

    /* Verify event ownership */
    const event = await Event.findOne({
      _id: eventId,
      userId,
    }).session(session)

    if (!event) {
      if (session) await session.abortTransaction()
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }

    /* Delete related expenses */
    await EventExpense.deleteMany({
      eventId,
      userId,
    }).session(session)

    /* Delete event */
    await Event.deleteOne({
      _id: eventId,
      userId,
    }).session(session)

    await session.commitTransaction()

    return NextResponse.json({
      success: true,
      message: "Event and all related expenses deleted",
    })
  } catch (error) {
    if (session) await session.abortTransaction()
    console.error("Delete event error:", error)
    return NextResponse.json(
      { message: "Failed to delete event" },
      { status: 500 }
    )
  } finally {
    if (session) session.endSession()
  }
}
