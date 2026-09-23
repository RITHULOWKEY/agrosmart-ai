import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse } from "cookie";
import type { User } from "../../drizzle/schema";
import { getUserById } from "../db";
import { LOCAL_SESSION_COOKIE, readLocalSession } from "../auth";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    user = null;
  }

  if (!user) {
    const token = parse(opts.req.headers.cookie ?? "")[LOCAL_SESSION_COOKIE];
    const userId = await readLocalSession(token);
    if (userId) user = (await getUserById(userId)) ?? null;
  }

  return { req: opts.req, res: opts.res, user };
}
