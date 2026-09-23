import { describe, expect, it } from "vitest";
import { demoMarket, demoWeather, ensembleRecommendation } from "./services/ensemble";

describe("ensembleRecommendation", () => {
  it("returns an explainable demo recommendation with all four agents", () => {
    const result = ensembleRecommendation({ soilType: "Clay", crop: "Tomato" });
    expect(result.mode).toBe("demo");
    expect(result.waterMm).toBe(28);
    expect(result.recommendedTime).toBe("06:00");
    expect(result.confidence).toBeNull();
    expect(result.agentResults).toHaveLength(4);
    expect(result.reasoning).toEqual([
      "Clay soil baseline: 25mm",
      "Healthy plant adjustment: -15%",
      "Hot weather adjustment: +30%",
    ]);
  });
});

describe("demo provider contracts", () => {
  it("labels weather and market data as demo mode", () => {
    expect(demoWeather().mode).toBe("demo");
    expect(demoWeather().forecast).toHaveLength(7);
    expect(demoMarket("Tomato").mode).toBe("demo");
    expect(demoMarket("Tomato").history).toHaveLength(12);
  });
});
