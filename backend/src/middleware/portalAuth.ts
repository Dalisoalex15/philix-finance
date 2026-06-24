import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AppError } from "./errorHandler";

interface PortalTokenPayload {
  id: string;
  email: string;
  type: "client";
}

/**
 * Verifies the portal JWT and confirms the account is still active.
 * Suspended or blacklisted accounts are rejected even with a valid token.
 */
export async function authenticatePortal(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = auth.split(" ")[1];
  let payload: PortalTokenPayload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as PortalTokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token expired", 401, "TOKEN_EXPIRED"));
    }
    return next(new AppError("Invalid token", 401));
  }

  if (payload.type !== "client") {
    return next(new AppError("Invalid token type", 401));
  }

  // Confirm account still exists and is active on every request
  const account = await prisma.clientPortalAccount.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, status: true },
  });

  if (!account) {
    return next(new AppError("Account not found", 401));
  }
  if (account.status === "SUSPENDED") {
    return next(new AppError("Your account has been suspended. Contact support.", 403, "ACCOUNT_SUSPENDED"));
  }
  if (account.status === "BLACKLISTED") {
    return next(new AppError("Access denied.", 403, "ACCOUNT_BLACKLISTED"));
  }

  (req as Request & { portalAccountId: string; portalEmail: string }).portalAccountId = account.id;
  (req as Request & { portalAccountId: string; portalEmail: string }).portalEmail = account.email;
  next();
}
