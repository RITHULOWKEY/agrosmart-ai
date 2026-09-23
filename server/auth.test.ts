import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./auth";

describe("password authentication", () => {
  it("hashes passwords and rejects the wrong password", async () => {
    const hash = await hashPassword("field-notebook-2026");
    expect(hash).toMatch(/^scrypt:/);
    expect(await verifyPassword("field-notebook-2026", hash)).toBe(true);
    expect(await verifyPassword("incorrect-password", hash)).toBe(false);
  });

  it("does not accept malformed stored hashes", async () => {
    expect(await verifyPassword("anything", "not-a-password-hash")).toBe(false);
  });
});
