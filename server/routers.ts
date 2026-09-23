import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb, getUserByEmail, getUserById } from "./db";
import { alerts, cropAnalyses, feedback, galleryItems, pilotApplications, users } from "../drizzle/schema";
import { analyzeCrop } from "./services/plantHealthService";
import { createLocalSession, hashPassword, LOCAL_SESSION_COOKIE, verifyPassword } from "./auth";
import { storagePut } from "./storage";

const emailSchema = z.string().trim().toLowerCase().email().max(320);
const cropSchema = z.string().trim().min(1).max(80);
const imageDataSchema = z.string().regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/, "Upload a JPG, PNG, or WEBP image.").max(9_000_000);

function publicUser(user: NonNullable<Awaited<ReturnType<typeof getUserById>>>) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

function requireDb(db: Awaited<ReturnType<typeof getDb>>): NonNullable<typeof db> {
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not configured. Please contact the project owner." });
  return db;
}

function setLocalSession(ctx: { req: Parameters<typeof getSessionCookieOptions>[0]; res: { cookie: (name: string, value: string, options: Record<string, unknown>) => void } }, token: string) {
  const options = getSessionCookieOptions(ctx.req);
  ctx.res.cookie(LOCAL_SESSION_COOKIE, token, { ...options, sameSite: options.secure ? "none" : "lax", maxAge: 1000 * 60 * 60 * 24 * 30 });
}

function decodeImageData(data: string) {
  const match = data.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Please upload a JPG, PNG, or WEBP image." });
  return { contentType: match[1], buffer: Buffer.from(match[2], "base64") };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => (ctx.user ? publicUser(ctx.user) : null)),
    register: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), email: emailSchema, password: z.string().min(8).max(128), confirmPassword: z.string() })).mutation(async ({ ctx, input }) => {
      if (input.password !== input.confirmPassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Passwords do not match." });
      const db = requireDb(await getDb());
      if (await getUserByEmail(input.email)) throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
      const passwordHash = await hashPassword(input.password);
      const result = await db.insert(users).values({ openId: `local:${crypto.randomUUID()}`, name: input.name, email: input.email, passwordHash, loginMethod: "password", lastSignedIn: new Date() });
      const user = await getUserById(Number(result[0].insertId));
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Account creation failed. Please try again." });
      setLocalSession(ctx, await createLocalSession(user.id));
      return publicUser(user);
    }),
    login: publicProcedure.input(z.object({ email: emailSchema, password: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
      const user = await getUserByEmail(input.email);
      if (!user || !(await verifyPassword(input.password, user.passwordHash))) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect." });
      const db = requireDb(await getDb());
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
      setLocalSession(ctx, await createLocalSession(user.id));
      return publicUser({ ...user, lastSignedIn: new Date() });
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(LOCAL_SESSION_COOKIE, { ...cookieOptions, sameSite: cookieOptions.secure ? "none" : "lax", maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: router({
    update: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(160), preferredLanguage: z.enum(["English", "Tamil"]), })).mutation(async ({ ctx, input }) => {
      const db = requireDb(await getDb());
      await db.update(users).set(input).where(eq(users.id, ctx.user.id));
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found." });
      return publicUser(user);
    }),
  }),
  intake: router({
    submitPilot: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), phone: z.string().trim().min(6).max(48), email: emailSchema, location: z.string().trim().min(2).max(240), farmSize: z.string().trim().min(1).max(80), crop: cropSchema, language: z.string().trim().min(1).max(32), consent: z.boolean() })).mutation(async ({ input }) => {
      if (!input.consent) throw new TRPCError({ code: "BAD_REQUEST", message: "Consent is required." });
      const db = requireDb(await getDb());
      await db.insert(pilotApplications).values({ ...input, preferredLanguage: input.language, consent: 1 });
      return { success: true } as const;
    }),
    submitContact: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), email: emailSchema, phone: z.string().trim().max(48).optional(), subject: z.string().trim().min(2).max(160), category: z.string().trim().min(1).max(48), message: z.string().trim().min(20).max(5000) })).mutation(async ({ input }) => {
      const db = requireDb(await getDb());
      await db.insert(feedback).values(input);
      return { success: true } as const;
    }),
  }),
  analysis: router({
    create: protectedProcedure.input(z.object({ crop: cropSchema, soilType: z.string().trim().min(1).max(80), plantingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), imageData: imageDataSchema })).mutation(async ({ ctx, input }) => {
      const { contentType, buffer } = decodeImageData(input.imageData);
      if (buffer.length > 6 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "Image size must be less than 6 MB." });
      const uploaded = await storagePut(`${ctx.user.id}/analyses/crop`, buffer, contentType);
      const result = await analyzeCrop(input.imageData, { crop: input.crop, soilType: input.soilType, plantingDate: input.plantingDate });
      const db = requireDb(await getDb());
      const inserted = await db.insert(cropAnalyses).values({ userId: ctx.user.id, cropType: result.crop, soilType: input.soilType, plantingDate: input.plantingDate, imageUrl: uploaded.url, healthStatus: result.healthStatus, confidence: result.confidence, possibleIssue: result.possibleIssue, severity: result.severity, wateringAdvice: result.wateringAdvice, recommendation: result.recommendation, mode: result.mode });
      return { id: Number(inserted[0].insertId), ...result, imageUrl: uploaded.url, soilType: input.soilType, plantingDate: input.plantingDate };
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = requireDb(await getDb());
      return db.select().from(cropAnalyses).where(eq(cropAnalyses.userId, ctx.user.id)).orderBy(desc(cropAnalyses.createdAt));
    }),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const db = requireDb(await getDb());
      const result = await db.select().from(cropAnalyses).where(and(eq(cropAnalyses.id, input.id), eq(cropAnalyses.userId, ctx.user.id))).limit(1);
      if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "This analysis could not be found." });
      return result[0];
    }),
  }),
  gallery: router({
    list: protectedProcedure.input(z.object({ search: z.string().trim().max(120).optional(), category: z.string().trim().max(48).optional() }).optional()).query(async ({ ctx, input }) => {
      const db = requireDb(await getDb());
      const rows = await db.select().from(galleryItems).where(eq(galleryItems.userId, ctx.user.id)).orderBy(desc(galleryItems.createdAt));
      const search = input?.search?.toLowerCase();
      return rows.filter((row) => (!input?.category || input.category === "all" || row.category === input.category) && (!search || `${row.cropName} ${row.description ?? ""}`.toLowerCase().includes(search)));
    }),
    create: protectedProcedure.input(z.object({ cropName: cropSchema, category: z.enum(["Vegetables", "Fruits", "Cereals", "Flowers", "Other"]), description: z.string().trim().max(500).optional(), imageData: imageDataSchema })).mutation(async ({ ctx, input }) => {
      const { contentType, buffer } = decodeImageData(input.imageData);
      if (buffer.length > 6 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "Image size must be less than 6 MB." });
      const uploaded = await storagePut(`${ctx.user.id}/gallery/item`, buffer, contentType);
      const db = requireDb(await getDb());
      const inserted = await db.insert(galleryItems).values({ userId: ctx.user.id, imageUrl: uploaded.url, cropName: input.cropName, category: input.category, description: input.description || null });
      return { id: Number(inserted[0].insertId), imageUrl: uploaded.url, cropName: input.cropName, category: input.category, description: input.description || null };
    }),
    remove: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const db = requireDb(await getDb());
      const result = await db.delete(galleryItems).where(and(eq(galleryItems.id, input.id), eq(galleryItems.userId, ctx.user.id)));
      if (!result[0].affectedRows) throw new TRPCError({ code: "NOT_FOUND", message: "Gallery item not found or not owned by you." });
      return { success: true } as const;
    }),
  }),
  alerts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = requireDb(await getDb());
      return db.select().from(alerts).where(eq(alerts.userId, ctx.user.id)).orderBy(desc(alerts.createdAt));
    }),
  }),
});

export type AppRouter = typeof appRouter;
