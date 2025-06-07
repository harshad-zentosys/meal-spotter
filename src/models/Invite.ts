import mongoose, { Schema, Document } from "mongoose";

export interface IInvite extends Document {
  email: string;
  token: string;
  isUsed: boolean;
  expiresAt: Date;
  metadata?: {
    messName?: string;
    location?: string;
    requestDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema = new Schema<IInvite>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    metadata: {
      messName: { type: String },
      location: { type: String },
      requestDate: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Invite ||
  mongoose.model<IInvite>("Invite", InviteSchema);
