import { afterAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { connectMongo } from "./db";

describe("MongoDB configuration", () => {
  it("connects and responds to a ping using MONGODB_URI", async () => {
    expect(process.env.MONGODB_URI, "MONGODB_URI must be configured").toBeTruthy();
    await connectMongo();
    const result = await mongoose.connection.db?.command({ ping: 1 });
    expect(result?.ok).toBe(1);
  }, 15000);
  afterAll(async () => { if (mongoose.connection.readyState !== 0) await mongoose.disconnect(); });
});
