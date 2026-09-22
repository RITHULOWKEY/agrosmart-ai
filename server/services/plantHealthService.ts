export type CropData = { crop: string; soilType: string; plantingDate: string };

export type PlantHealthResult = {
  crop: string;
  healthStatus: "Healthy" | "Needs attention";
  confidence: number;
  possibleIssue: string;
  wateringAdvice: string;
  recommendation: string;
  severity: "Low" | "Medium" | "High";
  mode: "demo" | "provider";
};

/**
 * Replace this function with a TensorFlow, Python, Gemini/OpenAI vision, or
 * custom disease-model adapter without changing the frontend contract.
 */
export async function analyzeCrop(_image: string | undefined, cropData: CropData): Promise<PlantHealthResult> {
  return {
    crop: cropData.crop,
    healthStatus: "Healthy",
    confidence: 86,
    possibleIssue: "Low fungal disease risk",
    wateringAdvice: "Continue regular irrigation",
    recommendation: "Continue regular irrigation and monitor the lower leaves for yellowing or spots over the next few days.",
    severity: "Low",
    mode: "demo",
  };
}
