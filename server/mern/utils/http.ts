import type { NextFunction, Request, Response } from "express";
import { storagePut } from "../../storage";

export function asyncRoute(handler: (req: Request, res: Response, next: NextFunction) => unknown) { return (req: Request, res: Response, next: NextFunction) => Promise.resolve(handler(req, res, next)).catch(next); }
export function errorMessage(error: unknown) { return error instanceof Error ? error.message : "Request failed."; }

export function decodeImageData(data: string) {
  const match = data.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw Object.assign(new Error("Please upload a JPG, JPEG, or WEBP image."), { status: 400 });
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length < 16 || buffer.length > 6 * 1024 * 1024) throw Object.assign(new Error("Image must be valid and smaller than 6 MB."), { status: 400 });
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png = buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp = buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (!jpeg && !png && !webp) throw Object.assign(new Error("This image appears to be corrupted."), { status: 400 });
  return { buffer, contentType: match[1] };
}

export async function saveImage(userId: string, folder: string, data: string) { const { buffer, contentType } = decodeImageData(data); return storagePut(`${userId}/${folder}`, buffer, contentType); }
export function serialize(doc: any): any { if (!doc) return doc; const value = typeof doc.toObject === "function" ? doc.toObject() : { ...doc }; value.id = String(value._id); delete value._id; delete value.__v; delete value.passwordHash; if (value.user) value.user = String(value.user); if (value.analysis) value.analysis = String(value.analysis); if (value.field) value.field = String(value.field); return value; }
