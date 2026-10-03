import mongoose, { Schema, model, type Types } from "mongoose";

const timestamps = true;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 320 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  preferredLanguage: { type: String, enum: ["English", "Tamil"], default: "English" },
  loginMethod: { type: String, default: "password" },
  lastSignedIn: { type: Date, default: Date.now },
}, { timestamps });

const analysisFields = {
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  cropType: { type: String, required: true }, location: String, soilType: { type: String, default: "Not provided" },
  growthStage: String, plantingDate: { type: String, default: "Not provided" }, currentSymptoms: String, previousTreatment: String,
  imageUrl: String, imageKey: String, healthStatus: { type: String, required: true }, confidence: { type: Number, default: null },
  detectedCondition: { type: String, required: true }, possibleIssue: { type: String, required: true }, severity: { type: String, required: true },
  immediateAction: { type: String, required: true }, wateringAdvice: { type: String, required: true }, soilGuidance: { type: String, required: true },
  pestDiseaseManagement: { type: String, required: true }, preventiveMeasures: { type: String, required: true }, sustainableFarming: { type: String, required: true },
  recommendation: { type: String, required: true }, providerModel: String, mode: { type: String, enum: ["provider", "fallback", "demo"], default: "fallback" },
};
const analysisSchema = new Schema(analysisFields, { timestamps });

const recommendationSchema = new Schema({ ...analysisFields, analysis: { type: Schema.Types.ObjectId, ref: "CropAnalysis", required: true, index: true } }, { timestamps });
const gallerySchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, analysis: { type: Schema.Types.ObjectId, ref: "CropAnalysis" }, imageUrl: { type: String, required: true }, imageKey: String, cropName: { type: String, required: true }, category: { type: String, required: true }, description: String }, { timestamps });
const fieldSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, name: { type: String, required: true }, location: String, soilType: String, area: String, crop: String, plantingDate: String, imageUrl: String }, { timestamps });
const alertSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, field: { type: Schema.Types.ObjectId, ref: "Field" }, type: String, severity: { type: String, enum: ["high", "medium", "low"] }, title: String, message: String, read: { type: Boolean, default: false } }, { timestamps });
const contactSchema = new Schema({ name: String, email: String, phone: String, subject: String, category: String, message: String }, { timestamps });
const pilotSchema = new Schema({ name: String, phone: String, email: String, location: String, farmSize: String, crop: String, experience: String, soilType: String, preferredLanguage: String, consent: Boolean }, { timestamps });

export const User = mongoose.models.User || model("User", userSchema);
export const CropAnalysis = mongoose.models.CropAnalysis || model("CropAnalysis", analysisSchema);
export const Recommendation = mongoose.models.Recommendation || model("Recommendation", recommendationSchema);
export const GalleryItem = mongoose.models.GalleryItem || model("GalleryItem", gallerySchema);
export const Field = mongoose.models.Field || model("Field", fieldSchema);
export const Alert = mongoose.models.Alert || model("Alert", alertSchema);
export const ContactMessage = mongoose.models.ContactMessage || model("ContactMessage", contactSchema);
export const PilotApplication = mongoose.models.PilotApplication || model("PilotApplication", pilotSchema);

export type MernUser = { _id: Types.ObjectId; name: string; email: string; role: string; preferredLanguage: string; loginMethod: string; createdAt: Date; updatedAt: Date; lastSignedIn: Date };
