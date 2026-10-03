import mongoose from "mongoose";

let connection: Promise<typeof mongoose> | null = null;

export async function connectMongo() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!connection) {
    connection = mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 }).catch((error) => {
      connection = null;
      throw error;
    });
  }
  await connection;
  return mongoose;
}
