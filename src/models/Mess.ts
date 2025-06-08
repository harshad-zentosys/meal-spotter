import mongoose, { Schema, Document } from "mongoose";

interface MenuItem {
  name: string;
  description?: string;
  type: "veg" | "non-veg";
  image?: string;
  price?: number;
}

interface IndexItem {
  name: string;
  description?: string;
  type: "veg" | "non-veg";
  image?: string;
  price?: number;
}

interface MenuForDate {
  date: Date;
  items: MenuItem[];
}

interface SubscriptionPlan {
  name: string;
  description: string;
  price: number;
  duration: number; // in days
}

export interface IMess extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  type: "veg" | "non-veg" | "both";
  cuisine: string[];
  lat: number;
  lng: number;
  address: string;
  contactNumber: string;
  image?: string;
  description?: string;
  plans: SubscriptionPlan[];
  menu: MenuForDate[];
  itemsIndex?: IndexItem[];
  createdAt: Date;
  updatedAt: Date;
  location: any;
}

const MessSchema = new Schema<IMess>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["veg", "non-veg", "both"],
      default: "both",
    },
    cuisine: [
      {
        type: String,
      },
    ],
    lat: {
      type: Number,
      required: false,
    },
    lng: {
      type: Number,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    contactNumber: {
      type: String,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    plans: [
      {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        duration: { type: Number, required: true },
      },
    ],
    menu: [
      {
        date: { type: Date, required: true },
        items: [
          {
            name: { type: String, required: true },
            description: { type: String },
            type: { type: String, enum: ["veg", "non-veg"], default: "veg" },
            image: { type: String },
            price: { type: Number, default: 0 },
          },
        ],
      },
    ],
    itemsIndex: [
      {
        name: { type: String, required: true },
        description: { type: String },
        type: { type: String, enum: ["veg", "non-veg"], default: "veg" },
        image: { type: String },
        price: { type: Number, default: 0 },
      },
    ],
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    }
  },
  { timestamps: true }
);

MessSchema.index({ location: "2dsphere" });

export default mongoose.models.Mess || mongoose.model<IMess>("Mess", MessSchema);
