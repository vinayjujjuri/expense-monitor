import { NextResponse, NextRequest } from "next/server"
import { connectDB } from "../../../libs/db"
import mongoose from "mongoose"
import Notification from "../../../models/notification"
import User from "../../../models/User"

/**
 * GET: ?forAdmin=true will return notifications intended for admins only.
 * POST: create a new notification. JSON body: { title, message, type, userId, payload, forAdmin }
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const forAdmin = (url.searchParams.get("forAdmin") || "").toLowerCase() === "true"
    const userEmail = url.searchParams.get("userEmail") || null

    const filter: Record<string, any> = {}
    if (forAdmin) {
      filter.forAdmin = true
    } else if (userEmail) {
      // For non-admin users, return notifications addressed to this user or general notifications (forAdmin: false)
      const orConditions: any[] = [
        { forAdmin: false },
        { "payload.email": userEmail },
        { "payload.userId": userEmail },
      ]

      // Only include userId match if the value is a valid ObjectId to avoid CastErrors
      if (mongoose.Types.ObjectId.isValid(userEmail)) {
        orConditions.push({ userId: new mongoose.Types.ObjectId(userEmail) })
      }

      filter.$or = orConditions
    }

    const docs = await Notification.find(filter).sort({ createdAt: -1 }).limit(50).lean()

    const notifications = docs.map((d: any) => ({
      id: d._id?.toString(),
      title: d.title,
      message: d.message,
      payload: d.payload ?? null,
      forAdmin: !!d.forAdmin,
      isRead: !!d.isRead,
      createdAt: d.createdAt ? d.createdAt.toISOString() : null,
    }))

    // If admin view, also include pending user-approval requests as notifications
    if (forAdmin) {
      try {
        const pendingUsers = await User.find({ status: "pending" }).sort({ createdAt: -1 }).limit(50).lean()
        const userNotifs = pendingUsers.map((u: any) => ({
          id: `user-pending-${u._id}`,
          title: "Approval pending",
          message: `User ${u.name ?? u.email} requires approval.`,
          payload: { type: "user-approval", userId: u._id?.toString(), email: u.email, name: u.name },
          forAdmin: true,
          isRead: false,
          createdAt: u.createdAt ? u.createdAt.toISOString() : null,
        }))

        // Prepend userNotifs so recent pending users appear first
        notifications.unshift(...userNotifs)
      } catch (e) {
        // ignore user fetch errors but log
        // eslint-disable-next-line no-console
        console.error("Failed to include pending user approvals", e)
      }
    }

    return NextResponse.json({ notifications })
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Failed to load notifications", err)
    const message = err?.message || String(err)
    return NextResponse.json({ error: message, notifications: [] }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { title, message, type, userId, payload, forAdmin } = body

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 })
    }

    const created = await Notification.create({
      title,
      message,
      type,
      userId: userId || undefined,
      payload: payload || undefined,
      forAdmin: !!forAdmin,
    })

    return NextResponse.json({ notification: {
      id: created._id.toString(),
      title: created.title,
      message: created.message,
      payload: created.payload ?? null,
      forAdmin: !!created.forAdmin,
      isRead: !!created.isRead,
      createdAt: created.createdAt ? created.createdAt.toISOString() : null,
    } })
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Failed to create notification", err)
    return NextResponse.json({ error: err?.message || "Failed to create" }, { status: 500 })
  }
}
