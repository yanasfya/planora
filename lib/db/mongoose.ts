import mongoose from "mongoose";

declare global {
  var __mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const globalCache = global.__mongoose ?? { conn: null, promise: null };
global.__mongoose = globalCache;

export async function connectMongo() {
  if (globalCache.conn) return globalCache.conn;

  if (!globalCache.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set");
    globalCache.promise = mongoose.connect(uri, {
      dbName: "planora",
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
    });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
