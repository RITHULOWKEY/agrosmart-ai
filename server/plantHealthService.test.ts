import { describe, expect, it } from "vitest";
import { analyzeCrop } from "./services/plantHealthService";

describe("plantHealthService", () => {
  it("returns structured demo analysis without pretending a live model is connected", async () => {
    const result = await analyzeCrop(undefined, { crop: "Tomato", soilType: "Clay", plantingDate: "2026-09-22" });
    expect(result).toMatchObject({
      crop: "Tomato",
      healthStatus: "Healthy",
      confidence: 86,
      possibleIssue: "Low fungal disease risk",
      mode: "demo",
    });
    expect(result.recommendation).toContain("regular irrigation");
  });
});
