import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}

const EmailOtpSchema = new Schema<IEmailOtp>({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// Auto-delete expired OTPs
EmailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailOtp: Model<IEmailOtp> =
  mongoose.models.EmailOtp ||
  mongoose.model<IEmailOtp>("EmailOtp", EmailOtpSchema);

export default EmailOtp;
