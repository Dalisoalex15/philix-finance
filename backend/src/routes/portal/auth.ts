import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { Mailer } from "../../lib/mailer";

const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

const router = Router();

function genClientNumber(): string {
  const n = Math.floor(Math.random() * 90000) + 10000;
  return `PHX-C-${n}`;
}

function genAccessToken(id: string, email: string) {
  return jwt.sign({ id, email, type: "client" }, process.env.JWT_SECRET!, { expiresIn: "4h" });
}

function genRefreshToken(id: string) {
  return jwt.sign({ id, type: "client_refresh" }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "30d" });
}

// POST /api/portal/auth/register
router.post("/register", wrap(async (req: Request, res: Response) => {
  const {
    firstName, lastName, email, phone, password,
    dateOfBirth, gender, address, city,
    occupation, employer, monthlyIncome, nrcNumber,
    referralCode,
  } = req.body as {
    firstName: string; lastName: string; email: string; phone: string; password: string;
    dateOfBirth?: string; gender?: string; address?: string; city?: string;
    occupation?: string; employer?: string; monthlyIncome?: string; nrcNumber?: string;
    referralCode?: string;
  };

  if (!firstName || !lastName || !email || !phone || !password) {
    throw new AppError("Required fields missing", 400);
  }
  if (password.length < 8) throw new AppError("Password must be at least 8 characters", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError("Invalid email", 400);

  const existing = await prisma.clientPortalAccount.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) throw new AppError("An account with this email already exists", 409);

  const passwordHash = await bcrypt.hash(password, 12);
  let clientNumber = genClientNumber();
  // Ensure unique
  while (await prisma.clientPortalAccount.findUnique({ where: { clientNumber } })) {
    clientNumber = genClientNumber();
  }

  const account = await prisma.clientPortalAccount.create({
    data: {
      clientNumber,
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
      address,
      city,
      occupation,
      employer,
      monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : null,
      nrcNumber,
      status: "PENDING_KYC",
      kycStatus: "NOT_STARTED",
      referredByCode: referralCode ? referralCode.trim().toUpperCase() : null,
    },
  });

  // Send welcome email (non-blocking)
  Mailer.welcome({ email: account.email, firstName: account.firstName, lastName: account.lastName, clientNumber: account.clientNumber, id: account.id }).catch(() => {});

  const accessToken = genAccessToken(account.id, account.email);
  const refreshTokenStr = genRefreshToken(account.id);

  await prisma.portalRefreshToken.create({
    data: {
      token: refreshTokenStr,
      accountId: account.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  res.status(201).json({
    accessToken,
    refreshToken: refreshTokenStr,
    account: sanitize(account),
  });
}));

// POST /api/portal/auth/login
router.post("/login", wrap(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("Email and password required", 400);

  const account = await prisma.clientPortalAccount.findUnique({ where: { email: email.toLowerCase() } });
  if (!account) {
    await new Promise(r => setTimeout(r, 300));
    throw new AppError("Invalid email or password", 401);
  }

  if (account.lockedUntil && account.lockedUntil > new Date()) {
    throw new AppError("Account temporarily locked. Try again later.", 423);
  }
  if (account.status === "SUSPENDED") throw new AppError("Account is suspended", 403);
  if (account.status === "BLACKLISTED") throw new AppError("Account is blacklisted", 403);

  const valid = await bcrypt.compare(password, account.passwordHash);
  if (!valid) {
    const fails = account.failedLoginCount + 1;
    await prisma.clientPortalAccount.update({
      where: { id: account.id },
      data: {
        failedLoginCount: fails,
        lockedUntil: fails >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null,
      },
    });
    throw new AppError("Invalid email or password", 401);
  }

  await prisma.clientPortalAccount.update({
    where: { id: account.id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const accessToken = genAccessToken(account.id, account.email);
  const refreshTokenStr = genRefreshToken(account.id);

  await prisma.portalRefreshToken.create({
    data: {
      token: refreshTokenStr,
      accountId: account.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  res.json({ accessToken, refreshToken: refreshTokenStr, account: sanitize(account) });
}));

// POST /api/portal/auth/refresh
router.post("/refresh", wrap(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError("Refresh token required", 400);

  const stored = await prisma.portalRefreshToken.findUnique({
    where: { token: refreshToken },
    include: { account: true },
  });
  if (!stored || stored.expiresAt < new Date()) throw new AppError("Invalid or expired refresh token", 401);

  const accessToken = genAccessToken(stored.account.id, stored.account.email);
  res.json({ accessToken, account: sanitize(stored.account) });
}));

// POST /api/portal/auth/logout
router.post("/logout", wrap(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.portalRefreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {});
  }
  res.json({ message: "Logged out" });
}));

function sanitize(a: Record<string, unknown>) {
  const { passwordHash, failedLoginCount, lockedUntil, ...safe } = a;
  return safe;
}

export default router;
