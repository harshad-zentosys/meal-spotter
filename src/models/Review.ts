import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  messId: mongoose.Types.ObjectId;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messId: {
      type: Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Ensure a user can only review a mess once
ReviewSchema.index({ userId: 1, messId: 1 }, { unique: true });

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);
