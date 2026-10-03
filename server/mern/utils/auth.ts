import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "agrosmart_token";
const maxAge = 1000 * 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.JWT_SECRET?.trim();
  if (!value) throw new Error("JWT_SECRET is not configured.");
  return value;
}

export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }
export function signToken(userId: string) { return jwt.sign({ sub: userId }, secret(), { expiresIn: "30d" }); }
export function verifyToken(token: string) { const payload = jwt.verify(token, secret()); return typeof payload === "object" && typeof payload.sub === "string" ? payload.sub : null; }
export function setTokenCookie(res: { cookie: Function }, token: string) { res.cookie(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", maxAge, path: "/" }); }
export function clearTokenCookie(res: { clearCookie: Function }) { res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/" }); }
export function getTokenFromRequest(req: { headers: { authorization?: string }; cookies?: Record<string, string> }) { const bearer = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : undefined; return bearer || req.cookies?.[COOKIE_NAME]; }
export { COOKIE_NAME };
