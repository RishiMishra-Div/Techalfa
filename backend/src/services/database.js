import mongoose from "mongoose";

let connectionPromise;

export async function connectToMongo() {
  if (!process.env.MONGODB_URI) throw new Error("MongoDB is not configured.");
  if (mongoose.connection.readyState === 1) return;
  connectionPromise ||= mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 }).catch((error) => {
    connectionPromise = undefined;
    throw error;
  });
  await connectionPromise;
}

export function databaseStatus() {
  return mongoose.connection.readyState === 1 ? "connected" : "not connected";
}
