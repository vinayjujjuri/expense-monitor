import mongoose, { Schema, Model } from "mongoose"

export interface INotification {
  title: string
  message?: string
  type?: "approval" | "request" | "event" | "info"
  userId?: mongoose.Types.ObjectId
  payload?: Record<string, any>
  forAdmin?: boolean
  isRead?: boolean
  createdAt?: Date
  updatedAt?: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: String,
    type: { type: String, enum: ["approval", "request", "event", "info"], default: "info" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    payload: { type: Schema.Types.Mixed },
    forAdmin: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const Notification =
  (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>("Notification", NotificationSchema)

export default Notification
