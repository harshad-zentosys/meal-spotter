import mongoose, { Schema } from "mongoose";

export interface IInvitationRequest extends mongoose.Document {
  name: string;
  email: string;
  phone: string;
  messName: string;
  address?: string;
  status: "pending" | "approved" | "rejected";
  token?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const InvitationRequestSchema = new Schema<IInvitationRequest>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  messName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  token: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

export default mongoose.models.InvitationRequest ||
  mongoose.model<IInvitationRequest>(
    "InvitationRequest",
    InvitationRequestSchema
  );
