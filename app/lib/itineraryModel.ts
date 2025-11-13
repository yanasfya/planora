import mongoose from "mongoose";
import type { Itinerary } from "./types";

const ActivitySchema = new mongoose.Schema(
  {
    title: String,
    time: String,
    location: String,
    lat: Number,
    lng: Number,
    description: String,
    externalUrl: String,
  },
  { _id: false }
);

const DaySchema = new mongoose.Schema(
  {
    day: Number,
    summary: String,
    activities: [ActivitySchema],
  },
  { _id: false }
);

const ItinerarySchema = new mongoose.Schema(
  {
    prefs: {
      destination: String,
      startDate: String,
      endDate: String,
      budget: String,
      interests: [String],
    },
    days: [DaySchema],
  },
  { timestamps: true }
);

export default (mongoose.models.Itinerary as mongoose.Model<Itinerary>) ||
  mongoose.model<Itinerary>("Itinerary", ItinerarySchema);
