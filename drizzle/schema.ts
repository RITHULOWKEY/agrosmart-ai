import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  preferredLanguage: varchar("preferredLanguage", { length: 32 }).default("English").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const fields = mysqlTable("fields", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  location: varchar("location", { length: 240 }).notNull(),
  soilType: varchar("soilType", { length: 80 }).notNull(),
  area: varchar("area", { length: 80 }).notNull(),
  crop: varchar("crop", { length: 80 }).notNull(),
  plantingDate: varchar("plantingDate", { length: 32 }).notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fieldId: int("fieldId").notNull(),
  waterMm: int("waterMm").notNull(),
  wateringTime: varchar("wateringTime", { length: 64 }).notNull(),
  confidence: int("confidence").notNull(),
  harvestRecommendation: varchar("harvestRecommendation", { length: 160 }).notNull(),
  agentResults: text("agentResults").notNull(),
  reasoning: text("reasoning").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fieldId: int("fieldId"),
  type: varchar("type", { length: 48 }).notNull(),
  severity: mysqlEnum("severity", ["high", "medium", "low"]).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  message: text("message").notNull(),
  read: int("read").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const pilotApplications = mysqlTable("pilotApplications", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 48 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  location: varchar("location", { length: 240 }).notNull(),
  farmSize: varchar("farmSize", { length: 80 }).notNull(),
  crop: varchar("crop", { length: 80 }).notNull(),
  experience: varchar("experience", { length: 80 }),
  soilType: varchar("soilType", { length: 80 }),
  preferredLanguage: varchar("preferredLanguage", { length: 32 }).default("English").notNull(),
  consent: int("consent").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 48 }),
  subject: varchar("subject", { length: 160 }).notNull(),
  category: varchar("category", { length: 48 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const blogPosts = mysqlTable("blogPosts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  title: varchar("title", { length: 240 }).notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
});

export const cropAnalyses = mysqlTable("cropAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cropType: varchar("cropType", { length: 80 }).notNull(),
  soilType: varchar("soilType", { length: 80 }).notNull(),
  plantingDate: varchar("plantingDate", { length: 32 }).notNull(),
  imageUrl: text("imageUrl"),
  healthStatus: varchar("healthStatus", { length: 80 }).notNull(),
  confidence: int("confidence"),
  possibleIssue: varchar("possibleIssue", { length: 160 }).notNull(),
  severity: varchar("severity", { length: 32 }).notNull(),
  wateringAdvice: varchar("wateringAdvice", { length: 240 }).notNull(),
  recommendation: text("recommendation").notNull(),
  mode: varchar("mode", { length: 32 }).default("demo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const galleryItems = mysqlTable("galleryItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  cropName: varchar("cropName", { length: 120 }).notNull(),
  category: varchar("category", { length: 48 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Field = typeof fields.$inferSelect;
export type Recommendation = typeof recommendations.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type CropAnalysis = typeof cropAnalyses.$inferSelect;
export type GalleryItem = typeof galleryItems.$inferSelect;
