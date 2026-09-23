import { describe, expect, it } from "vitest";
import { analyzeCrop } from "./services/plantHealthService";

describe("plantHealthService", () => {
  it("returns a clearly labeled fallback without inventing confidence", async () => {
    const result = await analyzeCrop(undefined, { crop: "Tomato", soilType: "Clay", plantingDate: "2026-09-22" });
    expect(result).toMatchObject({
      crop: "Tomato",
      healthStatus: "Needs attention",
      confidence: null,
      mode: "demo",
    });
    expect(result.possibleIssue).toContain("No live vision provider");
    expect(result.recommendation).toContain("CROP_ANALYSIS_PROVIDER=llm");
  });
});
