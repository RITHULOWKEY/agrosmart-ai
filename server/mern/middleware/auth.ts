import type { NextFunction, Request, Response } from "express";
import { User } from "../models";
import { connectMongo } from "../config/db";
import { getTokenFromRequest, verifyToken } from "../utils/auth";

export type AuthRequest = Request & { user?: any };

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const token = getTokenFromRequest(req);
    if (token) {
      const id = verifyToken(token);
      if (id) { await connectMongo(); req.user = await User.findById(id).select("-passwordHash"); }
    }
  } catch {}
  next();
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: "Authentication required." });
    const id = verifyToken(token);
    if (!id) return res.status(401).json({ message: "Your session has expired. Please sign in again." });
    await connectMongo();
    const user = await User.findById(id).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "User account not found." });
    req.user = user;
    next();
  } catch (error) { next(error); }
}
