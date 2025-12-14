import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "user" | "admin";

export type UserStatus = "pending" | "approved" | "rejected";


export interface IUser {
  name?: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}


const UserSchema = new Schema<IUser, Model<IUser, {}, IUserMethods>, IUserMethods>(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);


UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});



UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};


const User =
  (mongoose.models.User as Model<IUser, {}, IUserMethods>) ||
  mongoose.model<IUser, Model<IUser, {}, IUserMethods>>("User", UserSchema);

export default User;
