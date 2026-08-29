import mongoose from "mongoose";

export async function connectDatabase(): Promise<void> {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  await mongoose.connect(mongodbUri);
}