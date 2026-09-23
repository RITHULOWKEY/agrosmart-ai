import { beforeEach, describe, expect, it, vi } from "vitest";

const { invokeLLM } = vi.hoisted(() => ({ invokeLLM: vi.fn() }));
vi.mock("./_core/llm", () => ({ invokeLLM }));
vi.mock("./_core/env", () => ({ ENV: { forgeApiKey: "test-key" } }));

import { analyzeCrop } from "./services/plantHealthService";

describe("plantHealthService provider contract", () => {
  beforeEach(() => {
    process.env.CROP_ANALYSIS_PROVIDER = "llm";
    invokeLLM.mockReset();
    invokeLLM.mockResolvedValue({
      model: "test-vision-model",
      choices: [{ message: { content: JSON.stringify({
        crop: "Tomato",
        healthStatus: "Possible disease",
        confidence: 82,
        detectedCondition: "Possible early blight symptoms detected.",
        possibleIssue: "Leaf spotting",
        severity: "Medium",
        immediateAction: "Isolate the affected plant and inspect nearby leaves.",
        wateringAdvice: "Water at the soil line and avoid wetting foliage.",
        soilGuidance: "Keep soil well-drained and observe plant vigor.",
        pestDiseaseManagement: "Remove visibly affected leaves and seek local guidance before treatment.",
        preventiveMeasures: "Improve airflow and monitor new growth.",
        sustainableFarming: "Use targeted watering and avoid unnecessary inputs.",
        recommendation: "Inspect the crop again in 48 hours and consult an agricultural expert if symptoms spread.",
      }) } }],
    });
  });

  it("maps the model response into the stored analysis contract", async () => {
    const result = await analyzeCrop("data:image/jpeg;base64,abc", { crop: "", soilType: "Loamy" });
    expect(result).toMatchObject({ crop: "Tomato", healthStatus: "Possible disease", confidence: 82, mode: "provider", providerModel: "test-vision-model" });
    expect(result.detectedCondition).toContain("early blight");
    expect(invokeLLM).toHaveBeenCalledOnce();
  });
});
