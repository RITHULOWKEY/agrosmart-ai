import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { alerts, blogPosts, cropAnalyses, feedback, fields, pilotApplications, recommendations } from "../drizzle/schema";
import { demoMarket, demoWeather, ensembleRecommendation } from "./services/ensemble";
import { analyzeCrop } from "./services/plantHealthService";

const demoFields = [
  { id: 1, name: "Tomato Plot", location: "Sriperumbudur, Chennai", soilType: "Clay", area: "1.2 acres", crop: "Tomato", plantingDate: "2026-08-29" },
  { id: 2, name: "Kitchen Garden", location: "Kanchipuram, Tamil Nadu", soilType: "Sandy loam", area: "0.4 acres", crop: "Chili", plantingDate: "2026-09-06" },
];
const demoAlerts = [
  { id: "heat", type: "weather", severity: "high", title: "High heat alert", message: "38°C expected tomorrow. Follow the recommended early-morning watering window.", read: 0 },
  { id: "disease", type: "health", severity: "medium", title: "Disease risk rising", message: "Warm, humid conditions mean the tomato crop is worth inspecting daily.", read: 0 },
  { id: "market", type: "market", severity: "low", title: "Market update", message: "Demo trend suggests a potential price peak around Day 24.", read: 0 },
];
const demoBlog = [
  { slug: "why-your-tomato-crop-yellows", title: "Why Your Tomato Crop Yellows", category: "Crop health", excerpt: "A field-friendly checklist for spotting water, nutrient and disease signals early." },
  { slug: "optimal-watering-times-chennai", title: "Optimal Watering Times for Chennai Climate", category: "Irrigation", excerpt: "Why the hour you water matters when the day is hot and humid." },
  { slug: "best-days-to-harvest", title: "Best Days to Harvest", category: "Market intelligence", excerpt: "Harvest timing is a crop decision and a selling decision." },
  { slug: "soil-types-water-retention", title: "Soil Types & Water Retention", category: "Soil", excerpt: "A practical guide to how soil changes the way water moves through a field." },
];

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  intake: router({
    submitPilot: publicProcedure.input(z.object({ name: z.string().min(2), phone: z.string().min(6), email: z.string().email(), location: z.string().min(2), farmSize: z.string().min(1), crop: z.string().min(1), language: z.string(), consent: z.boolean() })).mutation(async ({ input }) => {
      if (!input.consent) throw new TRPCError({ code: "BAD_REQUEST", message: "Consent is required" });
      const db = await getDb();
      if (db) {
        try { await db.insert(pilotApplications).values({ name: input.name, phone: input.phone, email: input.email, location: input.location, farmSize: input.farmSize, crop: input.crop, preferredLanguage: input.language, consent: 1 }); } catch (error) { console.warn("[Pilot] demo fallback", error); }
      }
      return { success: true, mode: db ? "database" : "demo" };
    }),
    submitContact: publicProcedure.input(z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), subject: z.string().min(2), category: z.string(), message: z.string().min(4) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        try { await db.insert(feedback).values(input); } catch (error) { console.warn("[Contact] demo fallback", error); }
      }
      return { success: true, mode: db ? "database" : "demo" };
    }),
  }),
  farm: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      const recommendation = ensembleRecommendation({ soilType: "Clay", crop: "Tomato" });
      return { mode: "demo", user: ctx.user, recommendation, fields: demoFields, alerts: demoAlerts, weather: demoWeather(), market: demoMarket() };
    }),
    fields: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (db) {
        try { return await db.select().from(fields).where(eq(fields.userId, ctx.user.id)).orderBy(desc(fields.createdAt)); } catch (error) { console.warn("[Fields] demo fallback", error); }
      }
      return demoFields;
    }),
    createField: protectedProcedure.input(z.object({ name: z.string().min(2), location: z.string().min(2), soilType: z.string().min(2), area: z.string().min(1), crop: z.string().min(2), plantingDate: z.string().min(4) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (db) {
        try { const result = await db.insert(fields).values({ ...input, userId: ctx.user.id }); return { success: true, id: result[0].insertId, mode: "database" }; } catch (error) { console.warn("[Fields] create demo fallback", error); }
      }
      return { success: true, id: Date.now(), mode: "demo" };
    }),
    recommendations: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (db) {
        try { return await db.select().from(recommendations).where(eq(recommendations.userId, ctx.user.id)).orderBy(desc(recommendations.createdAt)); } catch (error) { console.warn("[Recommendations] demo fallback", error); }
      }
      const recommendation = ensembleRecommendation({ soilType: "Clay", crop: "Tomato" });
      return [{ id: 1, fieldId: 1, waterMm: recommendation.waterMm, wateringTime: recommendation.recommendedTime, confidence: recommendation.confidence, harvestRecommendation: recommendation.harvestRecommendation, reasoning: JSON.stringify(recommendation.reasoning), createdAt: new Date() }];
    }),
    generateRecommendation: protectedProcedure.input(z.object({ fieldId: z.number().optional(), soilType: z.string().optional(), crop: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const recommendation = ensembleRecommendation(input);
      const db = await getDb();
      if (db && input.fieldId) {
        try { await db.insert(recommendations).values({ userId: ctx.user.id, fieldId: input.fieldId, waterMm: recommendation.waterMm, wateringTime: recommendation.recommendedTime, confidence: recommendation.confidence, harvestRecommendation: recommendation.harvestRecommendation, agentResults: JSON.stringify(recommendation.agentResults), reasoning: JSON.stringify(recommendation.reasoning) }); } catch (error) { console.warn("[Recommendations] generate demo fallback", error); }
      }
      return recommendation;
    }),
    weather: protectedProcedure.query(() => demoWeather()),
    market: protectedProcedure.input(z.object({ crop: z.string().optional() }).optional()).query(({ input }) => demoMarket(input?.crop)),
    alerts: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (db) {
        try { return await db.select().from(alerts).where(eq(alerts.userId, ctx.user.id)).orderBy(desc(alerts.createdAt)); } catch (error) { console.warn("[Alerts] demo fallback", error); }
      }
      return demoAlerts;
    }),
    markAlertRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (db) { try { await db.update(alerts).set({ read: 1 }).where(eq(alerts.id, input.id)); } catch (error) { console.warn("[Alerts] mark read demo fallback", error); } }
      return { success: true, id: input.id, userId: ctx.user.id };
    }),
  }),
  analysis: router({
    create: protectedProcedure.input(z.object({ crop: z.string().min(1), soilType: z.string().min(1), plantingDate: z.string().min(4), imageUrl: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const result = await analyzeCrop(input.imageUrl, { crop: input.crop, soilType: input.soilType, plantingDate: input.plantingDate });
      const db = await getDb();
      if (db) {
        try {
          const inserted = await db.insert(cropAnalyses).values({ userId: ctx.user.id, cropType: result.crop, soilType: input.soilType, plantingDate: input.plantingDate, imageUrl: input.imageUrl, healthStatus: result.healthStatus, confidence: result.confidence, possibleIssue: result.possibleIssue, severity: result.severity, wateringAdvice: result.wateringAdvice, recommendation: result.recommendation, mode: result.mode });
          return { id: Number(inserted[0].insertId), ...result, imageUrl: input.imageUrl, soilType: input.soilType, plantingDate: input.plantingDate };
        } catch (error) { console.warn("[Analysis] demo persistence fallback", error); }
      }
      return { id: Date.now(), ...result, imageUrl: input.imageUrl, soilType: input.soilType, plantingDate: input.plantingDate };
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (db) { try { return await db.select().from(cropAnalyses).where(eq(cropAnalyses.userId, ctx.user.id)).orderBy(desc(cropAnalyses.createdAt)); } catch (error) { console.warn("[Analysis] history demo fallback", error); } }
      return [{ id: 1, userId: ctx.user.id, cropType: "Tomato", soilType: "Clay", plantingDate: "2026-08-29", imageUrl: undefined, healthStatus: "Healthy", confidence: 86, possibleIssue: "Low fungal disease risk", severity: "Low", wateringAdvice: "Continue regular irrigation", recommendation: "Continue regular irrigation and monitor the lower leaves for yellowing or spots over the next few days.", mode: "demo", createdAt: new Date() }];
    }),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (db) { try { const result = await db.select().from(cropAnalyses).where(eq(cropAnalyses.id, input.id)).limit(1); if (result[0] && result[0].userId === ctx.user.id) return result[0]; } catch (error) { console.warn("[Analysis] detail demo fallback", error); } }
      return { id: input.id, userId: ctx.user.id, cropType: "Tomato", soilType: "Clay", plantingDate: "2026-08-29", imageUrl: undefined, healthStatus: "Healthy", confidence: 86, possibleIssue: "Low fungal disease risk", severity: "Low", wateringAdvice: "Continue regular irrigation", recommendation: "Continue regular irrigation and monitor the lower leaves for yellowing or spots over the next few days.", mode: "demo", createdAt: new Date() };
    }),
  }),
  content: router({
    blog: publicProcedure.query(async () => {
      const db = await getDb();
      if (db) { try { const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt)); if (posts.length) return posts; } catch (error) { console.warn("[Blog] demo fallback", error); } }
      return demoBlog;
    }),
    blogPost: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) => demoBlog.find((post) => post.slug === input.slug) ?? demoBlog[0]),
  }),
});

export type AppRouter = typeof appRouter;
