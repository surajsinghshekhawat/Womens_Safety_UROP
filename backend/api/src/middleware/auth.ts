/**
 * Admin auth middleware: require valid JWT with role admin
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_SECRET || "change-me-in-production";

export interface AdminPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized", message: "Missing or invalid Authorization header" });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden", message: "Admin role required" });
    }
    (req as any).admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token" });
  }
}

export function signAdminToken(sub: string, role: string = "admin"): string {
  return jwt.sign(
    { sub, role } as AdminPayload,
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
