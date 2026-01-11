import mongoose, { Schema, Types } from "mongoose";

export interface IExpenseEvent {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;          // set only when event is closed
  status: "active" | "closed";
  createdAt: Date;
}

const EventExpenseSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,          // ✅ REQUIRED
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expenseName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    expenseDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.EventExpense ||
  mongoose.model("EventExpense", EventExpenseSchema);
