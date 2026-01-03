import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDebitCategory extends Document {
  userId: Types.ObjectId;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

const DebitCategorySchema = new Schema<IDebitCategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

// 🔐 Prevent duplicate category names per user
DebitCategorySchema.index(
  { userId: 1, name: 1 },
  { unique: true }
);

// Prevent model overwrite in dev
const DebitCategory: Model<IDebitCategory> =
  mongoose.models.DebitCategory ||
  mongoose.model<IDebitCategory>("DebitCategory", DebitCategorySchema);

export default DebitCategory;
