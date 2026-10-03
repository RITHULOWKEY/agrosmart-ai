import { describe, expect, it } from "vitest";
import { decodeImageData } from "./http";

describe("MERN upload validation", () => {
  it("accepts a valid PNG data URL", () => {
    const png = "data:image/png;base64," + Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0, 0, 0, 0, 0]).toString("base64");
    expect(decodeImageData(png).contentType).toBe("image/png");
  });
  it("rejects non-image data", () => {
    expect(() => decodeImageData("data:text/plain;base64,ZmFrZQ==")).toThrow(/upload/i);
  });
});
