import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { DEBIT_CATEGORIES } from "@/utils/constants";

export interface ITransaction extends Document {
  userId?: string | Types.ObjectId;
  amount: number;
  type: "credit" | "debit";
  creditType?: "salary" | "other" | null;
  category?: string | null;      // Only for debit
  createdAt: Date;
  transactionDate: Date;         // The date of the transaction (defaults to now)
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    // Only for credits
    creditType: {
      type: String,
      enum: ["salary", "other", null],
      default: null,
    },

    // Only for debits
    category: {
      type: String,
      enum: DEBIT_CATEGORIES,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    // The actual date of the debit/credit (defaults to insertion time)
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

// Avoid model overwrite in dev
const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
