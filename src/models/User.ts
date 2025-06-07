import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "student" | "mess-owner" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "mess-owner", "admin"],
      default: "student",
    },
  },
  { timestamps: true }
);

// Check if the model already exists to prevent overwriting during hot reload
const User = (models.User ||
  mongoose.model<IUser>("User", UserSchema)) as Model<IUser>;

export default User;
