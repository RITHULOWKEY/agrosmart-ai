import { beforeEach, describe, expect, it } from "vitest";
import { hashPassword, signToken, verifyPassword, verifyToken } from "./auth";

describe("MERN authentication utilities", () => {
  beforeEach(() => { process.env.JWT_SECRET = "test-secret-that-is-long-enough"; });
  it("hashes passwords and rejects the wrong password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(hash).not.toContain("correct-horse");
    expect(await verifyPassword("correct-horse-battery-staple", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
  it("signs and verifies a persistent user token", () => {
    const token = signToken("507f1f77bcf86cd799439011");
    expect(verifyToken(token)).toBe("507f1f77bcf86cd799439011");
  });
});
