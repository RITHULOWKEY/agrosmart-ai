import { invokeLLM } from "../_core/llm";

export type CropData = { crop: string; soilType: string; plantingDate: string };

export type PlantHealthResult = {
  crop: string;
  healthStatus: "Healthy" | "Needs attention" | "Diseased";
  confidence: number | null;
  possibleIssue: string;
  wateringAdvice: string;
  recommendation: string;
  severity: "Low" | "Medium" | "High";
  mode: "demo" | "provider";
};

const demoResult = (cropData: CropData): PlantHealthResult => ({
  crop: cropData.crop,
  healthStatus: "Needs attention",
  confidence: null,
  possibleIssue: "No live vision provider is configured",
  wateringAdvice: "Use the crop's normal schedule and check soil moisture before watering.",
  recommendation: "This development fallback cannot assess the uploaded image. Configure CROP_ANALYSIS_PROVIDER=llm for a real vision analysis, or connect a validated crop-health model.",
  severity: "Medium",
  mode: "demo",
});

function getTextContent(content: string | Array<{ type: string; text?: string }>) {
  if (typeof content === "string") return content;
  return content.map((part) => part.text ?? "").join("\n");
}

async function analyzeWithVisionProvider(imageData: string, cropData: CropData): Promise<PlantHealthResult> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a cautious agricultural vision assistant. Analyze the provided plant photo and return only the requested JSON. Never claim certainty. If the image is unclear, say Needs attention and explain that the photo needs a clearer follow-up. Recommendations must be practical, general, and avoid dangerous chemical dosage instructions.",
      },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageData, detail: "low" } },
          { type: "text", text: `Crop supplied by the farmer: ${cropData.crop}. Soil: ${cropData.soilType}. Planting date: ${cropData.plantingDate}. Return a concise assessment.` },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "crop_health_assessment",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            crop: { type: "string" },
            healthStatus: { type: "string", enum: ["Healthy", "Needs attention", "Diseased"] },
            confidence: { type: "integer", minimum: 0, maximum: 100 },
            possibleIssue: { type: "string" },
            wateringAdvice: { type: "string" },
            recommendation: { type: "string" },
            severity: { type: "string", enum: ["Low", "Medium", "High"] },
          },
          required: ["crop", "healthStatus", "confidence", "possibleIssue", "wateringAdvice", "recommendation", "severity"],
        },
      },
    },
    max_tokens: 600,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("The vision provider returned an empty assessment");
  const parsed = JSON.parse(getTextContent(content)) as PlantHealthResult;
  if (typeof parsed.confidence !== "number" || parsed.confidence < 0 || parsed.confidence > 100) {
    throw new Error("The vision provider returned an invalid confidence value");
  }
  return { ...parsed, mode: "provider" };
}

/**
 * Set CROP_ANALYSIS_PROVIDER=llm to use the built-in vision-capable model.
 * The default development fallback is intentionally marked and never invents confidence.
 */
export async function analyzeCrop(imageData: string | undefined, cropData: CropData): Promise<PlantHealthResult> {
  if (process.env.CROP_ANALYSIS_PROVIDER?.toLowerCase() === "llm" && imageData?.startsWith("data:image/")) {
    return analyzeWithVisionProvider(imageData, cropData);
  }
  return demoResult(cropData);
}
