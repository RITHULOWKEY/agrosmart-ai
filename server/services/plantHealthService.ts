import { invokeLLM } from "../_core/llm";
import { ENV } from "../_core/env";

export type CropData = {
  crop?: string;
  location?: string;
  soilType?: string;
  growthStage?: string;
  plantingDate?: string;
  currentSymptoms?: string;
  previousTreatment?: string;
};

export type PlantHealthResult = {
  crop: string;
  healthStatus: "Healthy" | "Needs attention" | "Possible disease";
  confidence: number | null;
  detectedCondition: string;
  possibleIssue: string;
  severity: "Low" | "Medium" | "High";
  immediateAction: string;
  wateringAdvice: string;
  soilGuidance: string;
  pestDiseaseManagement: string;
  preventiveMeasures: string;
  sustainableFarming: string;
  recommendation: string;
  mode: "demo" | "provider";
  providerModel?: string;
};

const UNKNOWN_CONDITION = "Unable to confidently identify a specific disease. Please upload a clearer image or consult an agricultural expert.";

const demoResult = (cropData: CropData): PlantHealthResult => ({
  crop: cropData.crop || "Unknown plant",
  healthStatus: "Needs attention",
  confidence: null,
  detectedCondition: "No live vision provider is configured",
  possibleIssue: "No live vision provider is configured",
  severity: "Medium",
  immediateAction: "This development fallback cannot assess the uploaded image. Upload a clearer image after configuring the vision provider.",
  wateringAdvice: "Use the crop's normal schedule and check soil moisture before watering.",
  soilGuidance: "Observe soil moisture and plant vigor; avoid adding nutrients without a soil or local agronomy recommendation.",
  pestDiseaseManagement: "No pest or disease can be identified in fallback mode. Inspect leaves and stems manually or consult an agricultural expert.",
  preventiveMeasures: "Use clean tools, monitor the crop regularly, and keep a record of visible changes.",
  sustainableFarming: "Prefer targeted watering, reuse healthy crop residues safely, and avoid unnecessary chemical inputs.",
  recommendation: "This development fallback cannot assess the uploaded image. Configure the built-in vision provider to generate an image-grounded result.",
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
        content: `You are a cautious agricultural vision assistant. Analyze the provided crop or plant image and return only the requested JSON. Identify the plant from visual evidence, but respect the farmer's supplied crop as a hint rather than a fact. Never invent a disease name. If a specific disease cannot be identified confidently, set detectedCondition exactly to: "${UNKNOWN_CONDITION}". Recommendations must be practical, general, and avoid dangerous chemical dosage instructions. Do not claim weather or location-specific facts unless supplied by the user.`,
      },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageData, detail: "auto" } },
          { type: "text", text: JSON.stringify({ task: "Identify crop or plant, assess visible health, and generate structured recommendations.", farmerContext: cropData }) },
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
            healthStatus: { type: "string", enum: ["Healthy", "Needs attention", "Possible disease"] },
            confidence: { type: "integer", minimum: 0, maximum: 100 },
            detectedCondition: { type: "string" },
            possibleIssue: { type: "string" },
            severity: { type: "string", enum: ["Low", "Medium", "High"] },
            immediateAction: { type: "string" },
            wateringAdvice: { type: "string" },
            soilGuidance: { type: "string" },
            pestDiseaseManagement: { type: "string" },
            preventiveMeasures: { type: "string" },
            sustainableFarming: { type: "string" },
            recommendation: { type: "string" },
          },
          required: ["crop", "healthStatus", "confidence", "detectedCondition", "possibleIssue", "severity", "immediateAction", "wateringAdvice", "soilGuidance", "pestDiseaseManagement", "preventiveMeasures", "sustainableFarming", "recommendation"],
        },
      },
    },
    max_tokens: 1200,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    const providerError = (response as unknown as { error?: { message?: string } }).error?.message;
    console.error("[Crop analysis] Vision provider returned no usable choices", { keys: Object.keys(response), providerError });
    throw new Error(providerError || "The vision provider returned an empty assessment");
  }
  const parsed = JSON.parse(getTextContent(content)) as Omit<PlantHealthResult, "mode" | "providerModel">;
  if (!parsed.crop || !parsed.healthStatus || !parsed.detectedCondition || typeof parsed.confidence !== "number" || parsed.confidence < 0 || parsed.confidence > 100) {
    throw new Error("The vision provider returned an incomplete assessment");
  }
  return { ...parsed, possibleIssue: parsed.possibleIssue || parsed.detectedCondition, mode: "provider", providerModel: response.model };
}

/** The live built-in provider is the default when credentials are available. Set CROP_ANALYSIS_PROVIDER=demo only for local fallback testing. */
export async function analyzeCrop(imageData: string | undefined, cropData: CropData): Promise<PlantHealthResult> {
  const providerMode = process.env.CROP_ANALYSIS_PROVIDER?.toLowerCase();
  if (providerMode === "demo" || !ENV.forgeApiKey || !imageData?.startsWith("data:image/")) return demoResult(cropData);
  return analyzeWithVisionProvider(imageData, cropData);
}
