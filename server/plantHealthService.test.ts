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
    expect(result.detectedCondition).toContain("No live vision provider");
    expect(result.immediateAction).toContain("development fallback");
    expect(result.sustainableFarming).toContain("targeted watering");
  });
});
