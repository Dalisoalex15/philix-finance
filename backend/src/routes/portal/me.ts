import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { authenticatePortal } from "../../middleware/portalAuth";

const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

const router = Router();
router.use(authenticatePortal);

// GET /api/portal/me
router.get("/", wrap(async (req: Request, res: Response) => {
  const account = await prisma.clientPortalAccount.findUnique({
    where: { id: (req as Request & { portalAccountId: string }).portalAccountId },
    include: {
      kycDocuments: { select: { id: true, docType: true, uploadedAt: true } },
      notifications: { where: { isRead: false }, select: { id: true } },
      portalLoans: {
        select: { id: true, reference: true, status: true, amountRequested: true, productType: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
  if (!account) throw new AppError("Account not found", 404);
  const { passwordHash, failedLoginCount, lockedUntil, ...safe } = account as Record<string, unknown>;
  res.json(safe);
}));

// PATCH /api/portal/me — update profile
router.patch("/", wrap(async (req: Request, res: Response) => {
  const id = (req as Request & { portalAccountId: string }).portalAccountId;
  const { phone, address, city, occupation, employer, monthlyIncome } = req.body;
  const account = await prisma.clientPortalAccount.update({
    where: { id },
    data: {
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(occupation !== undefined && { occupation }),
      ...(employer !== undefined && { employer }),
      ...(monthlyIncome !== undefined && { monthlyIncome: parseFloat(monthlyIncome) || null }),
    },
  });
  const { passwordHash, ...safe } = account as Record<string, unknown>;
  res.json(safe);
}));

// PATCH /api/portal/me/nok — update next-of-kin contact
router.patch("/nok", wrap(async (req: Request, res: Response) => {
  const id = (req as Request & { portalAccountId: string }).portalAccountId;
  const { nextOfKinName, nextOfKinPhone, nextOfKinRelation } = req.body;
  if (!nextOfKinName || !nextOfKinPhone) throw new AppError("Name and phone are required", 400);
  const account = await prisma.clientPortalAccount.update({
    where: { id },
    data: { nextOfKinName, nextOfKinPhone, nextOfKinRelation },
    select: { id: true, nextOfKinName: true, nextOfKinPhone: true, nextOfKinRelation: true },
  });
  res.json(account);
}));

// POST /api/portal/me/change-password
router.post("/change-password", wrap(async (req: Request, res: Response) => {
  const id = (req as Request & { portalAccountId: string }).portalAccountId;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new AppError("Both passwords required", 400);
  if (newPassword.length < 8) throw new AppError("New password too short", 400);

  const account = await prisma.clientPortalAccount.findUnique({ where: { id } });
  if (!account) throw new AppError("Not found", 404);

  const valid = await bcrypt.compare(currentPassword, account.passwordHash);
  if (!valid) throw new AppError("Current password is incorrect", 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.clientPortalAccount.update({ where: { id }, data: { passwordHash } });
  res.json({ message: "Password updated" });
}));

// GET /api/portal/me/referral — referral programme stats
router.get("/referral", wrap(async (req: Request, res: Response) => {
  const id = (req as Request & { portalAccountId: string }).portalAccountId;
  const account = await prisma.clientPortalAccount.findUnique({
    where: { id },
    select: { clientNumber: true, referredByCode: true },
  });
  if (!account) throw new AppError("Account not found", 404);

  // Derive referral code from client number (same formula as frontend)
  const suffix = account.clientNumber.replace(/\D/g, "").slice(-5);
  const myCode = `PHX-${suffix || account.clientNumber.slice(-5).toUpperCase()}`;

  // Count how many accounts used this code
  const referralCount = await prisma.clientPortalAccount.count({
    where: { referredByCode: myCode },
  });

  // Fetch brief info on referred accounts (name + join date only)
  const referred = await prisma.clientPortalAccount.findMany({
    where: { referredByCode: myCode },
    select: { firstName: true, lastName: true, createdAt: true, status: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  res.json({
    myCode,
    referralCount,
    wasReferred: !!account.referredByCode,
    referredByCode: account.referredByCode,
    referred: referred.map(r => ({
      name: `${r.firstName} ${r.lastName[0]}.`,
      joinedAt: r.createdAt,
      status: r.status,
    })),
  });
}));

export default router;
