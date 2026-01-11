import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, enum: ["active", "closed"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Event ||
  mongoose.model("Event", EventSchema);
