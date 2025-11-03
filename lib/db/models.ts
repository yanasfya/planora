import mongoose, { Schema, type Model } from "mongoose";
import type { TripDocument } from "@/lib/zod-schemas";

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  name?: string;
  image?: string;
}

const TripSchema = new Schema<TripDocument>(
  {
    id: { type: String, required: true, unique: true },
    title: String,
    destination: String,
    startDate: String,
    endDate: String,
    travelers: Number,
    preferences: [String],
    budget: {
      currency: String,
      total: Number,
      breakdown: [
        {
          category: String,
          amount: Number
        }
      ]
    },
    itinerary: [
      {
        day: Number,
        date: String,
        summary: String,
        items: [
          {
            id: String,
            time: String,
            title: String,
            location: String,
            category: String,
            cost: Number,
            notes: String
          }
        ]
      }
    ],
    lodging: [
      {
        id: String,
        name: String,
        address: String,
        pricePerNight: Number,
        rating: Number,
        url: String
      }
    ],
    weather: [
      {
        date: String,
        icon: String,
        description: String,
        temperature: {
          high: Number,
          low: Number
        }
      }
    ],
    notes: String,
    status: { type: String, enum: ["draft", "confirmed", "archived"], default: "draft" }
  },
  { timestamps: true }
);

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: String,
    image: String
  },
  { timestamps: true }
);

export const TripModel: Model<TripDocument> =
  mongoose.models.Trip || mongoose.model<TripDocument>("Trip", TripSchema);

export const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);
