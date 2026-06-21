import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";

type AsyncHandler = (req: Request, res: Response, next: (err?: unknown) => void) => Promise<unknown>;
const wrap = (fn: AsyncHandler) => (req: Request, res: Response, next: (err?: unknown) => void) =>
  fn(req, res, next).catch(next);

const router = Router();
router.use(authenticate);

// GET /api/admin/activity — recent portal events for live dashboard feed
router.get("/activity", wrap(async (_req: Request, res: Response) => {
  const apps = await prisma.portalLoanApplication.findMany({
    orderBy: { updatedAt: "desc" },
    take: 30,
    include: {
      account: { select: { firstName: true, lastName: true, clientNumber: true } },
    },
  });

  const events = apps.map((a) => {
    const name = `${a.account.firstName} ${a.account.lastName}`;
    const product = a.productType.replace(/_/g, " ");
    const amount = a.amountRequested;

    let type: string;
    let description: string;
    switch (a.status) {
      case "SUBMITTED":
        type = "APPLICATION_SUBMITTED";
        description = `${name} submitted a new ${product} application for K${amount.toLocaleString()}`;
        break;
      case "UNDER_REVIEW":
        type = "APPLICATION_REVIEWING";
        description = `${name}'s ${product} application is now under review`;
        break;
      case "APPROVED":
        type = "APPLICATION_APPROVED";
        description = `${name}'s loan of K${amount.toLocaleString()} was APPROVED`;
        break;
      case "REJECTED":
        type = "APPLICATION_REJECTED";
        description = `${name}'s ${product} application was rejected`;
        break;
      case "DISBURSED":
        type = "LOAN_DISBURSED";
        description = `K${amount.toLocaleString()} disbursed to ${name} — ${product}`;
        break;
      default:
        type = "APPLICATION_UPDATED";
        description = `${name}'s application was updated`;
    }

    return {
      id: a.id,
      type,
      client: name,
      clientNo: a.account.clientNumber,
      ref: a.reference,
      amount,
      description,
      timestamp: a.updatedAt,
    };
  });

  res.json(events);
}));

// GET /api/admin/fraud-scan — detect duplicate NRC / phone across portal accounts
router.get("/fraud-scan", wrap(async (_req: Request, res: Response) => {
  const accounts = await prisma.clientPortalAccount.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      clientNumber: true,
      nrcNumber: true,
      phone: true,
      email: true,
      createdAt: true,
    },
  });

  type AccRecord = typeof accounts[number];
  const nrcMap = new Map<string, AccRecord[]>();
  const phoneMap = new Map<string, AccRecord[]>();

  for (const acc of accounts) {
    if (acc.nrcNumber) {
      const key = acc.nrcNumber.replace(/\s/g, "").toLowerCase();
      if (!nrcMap.has(key)) nrcMap.set(key, []);
      nrcMap.get(key)!.push(acc);
    }
    if (acc.phone) {
      const key = acc.phone.replace(/\s/g, "");
      if (!phoneMap.has(key)) phoneMap.set(key, []);
      phoneMap.get(key)!.push(acc);
    }
  }

  const alerts: object[] = [];

  for (const [nrc, accs] of nrcMap) {
    if (accs.length > 1) {
      alerts.push({
        id: `nrc-${nrc}`,
        type: "DUPLICATE_NRC",
        severity: "HIGH",
        value: nrc,
        description: `NRC ${nrc} is linked to ${accs.length} accounts`,
        accounts: accs.map((a) => ({
          id: a.id,
          name: `${a.firstName} ${a.lastName}`,
          clientNo: a.clientNumber,
          email: a.email,
        })),
        detectedAt: new Date().toISOString(),
      });
    }
  }

  for (const [phone, accs] of phoneMap) {
    if (accs.length > 1) {
      alerts.push({
        id: `phone-${phone}`,
        type: "DUPLICATE_PHONE",
        severity: "MEDIUM",
        value: phone,
        description: `Phone ${phone} is used by ${accs.length} accounts`,
        accounts: accs.map((a) => ({
          id: a.id,
          name: `${a.firstName} ${a.lastName}`,
          clientNo: a.clientNumber,
          email: a.email,
        })),
        detectedAt: new Date().toISOString(),
      });
    }
  }

  res.json({ alerts, scannedAt: new Date().toISOString(), totalAccounts: accounts.length });
}));

// GET /api/admin/summary — quick stats for CEO dashboard
router.get("/summary", wrap(async (_req: Request, res: Response) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Fallback rates keyed by product ID + term weeks (for loans without a stored interestRate)
  // prod-001..004 = 10/20/30/35%, prod-005 = 8/16/24/30%, prod-006 = 7/14/21/28%
  const PRODUCT_RATES: Record<string, Record<number, number>> = {
    "prod-001": { 1: 10, 2: 20, 3: 30, 4: 35 },
    "prod-002": { 1: 10, 2: 20, 3: 30, 4: 35 },
    "prod-003": { 1: 10, 2: 20, 3: 30, 4: 35 },
    "prod-004": { 1: 10, 2: 20, 3: 30, 4: 35 },
    "prod-005": { 1:  8, 2: 16, 3: 24, 4: 30 },
    "prod-006": { 1:  7, 2: 14, 3: 21, 4: 28 },
    "prod-007": { 4: 8, 8: 15, 12: 22, 16: 28, 20: 33, 24: 38 },
  };

  const [
    totalAccounts,
    pendingApplications,
    approvedToday,
    submittedToday,
    totalApplications,
    disbursedAgg,
    activeAgg,
    disbursedLoans,
  ] = await Promise.all([
    prisma.clientPortalAccount.count(),
    prisma.portalLoanApplication.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.portalLoanApplication.count({ where: { status: "APPROVED", reviewedAt: { gte: todayStart } } }),
    prisma.portalLoanApplication.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.portalLoanApplication.count(),
    prisma.portalLoanApplication.aggregate({ _sum: { amountRequested: true }, where: { status: "DISBURSED" } }),
    prisma.portalLoanApplication.aggregate({ _sum: { amountRequested: true }, where: { status: { in: ["APPROVED", "DISBURSED"] } } }),
    prisma.portalLoanApplication.findMany({
      where: { status: "DISBURSED" },
      select: { amountRequested: true, termMonths: true, interestRate: true, productType: true },
    }),
  ]);

  // Use the rate stored at application time; fall back to product+term table for legacy records
  const totalInterestEarned = disbursedLoans.reduce((sum: number, loan: {
    amountRequested: number; termMonths: number; interestRate: number; productType: string;
  }) => {
    const ratePct = loan.interestRate > 0
      ? loan.interestRate
      : (PRODUCT_RATES[loan.productType]?.[loan.termMonths] ?? 35);
    return sum + loan.amountRequested * (ratePct / 100);
  }, 0);

  const totalDisbursedAmount = disbursedAgg._sum.amountRequested ?? 0;

  res.json({
    totalPortalAccounts: totalAccounts,
    pendingApplications,
    approvedToday,
    submittedToday,
    totalApplications,
    totalDisbursedAmount,
    totalLoanedOut: activeAgg._sum.amountRequested ?? 0,
    totalInterestEarned,
    totalRepayable: totalDisbursedAmount + totalInterestEarned,
  });
}));

// GET /api/admin/portal-accounts — list all portal client accounts
router.get("/portal-accounts", wrap(async (_req: Request, res: Response) => {
  const accounts = await prisma.clientPortalAccount.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      clientNumber: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      address: true,
      city: true,
      occupation: true,
      employer: true,
      monthlyIncome: true,
      nrcNumber: true,
      kycStatus: true,
      status: true,
      emailVerified: true,
      lastLoginAt: true,
      failedLoginCount: true,
      lockedUntil: true,
      createdAt: true,
      _count: { select: { portalLoans: true } },
    },
  });
  // Normalize _count field name for frontend
  const normalized = (accounts as any[]).map(a => ({
    ...a,
    _count: { loanApplications: a._count.portalLoans },
  }));
  res.json(normalized);
}));

// GET /api/admin/portal-accounts/:id — full details for one portal account
router.get("/portal-accounts/:id", wrap(async (req: Request, res: Response) => {
  const account = await prisma.clientPortalAccount.findUnique({
    where: { id: req.params.id },
    include: {
      portalLoans: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true, reference: true, productType: true, amountRequested: true,
          status: true, createdAt: true, reviewedAt: true,
        },
      },
      kycDocuments: { select: { id: true, docType: true, uploadedAt: true } },
      notifications: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!account) return res.status(404).json({ error: "Account not found" });
  const { passwordHash, portalLoans, ...safe } = account as any;
  res.json({ ...safe, loanApplications: portalLoans, hasPassword: !!passwordHash });
}));

// POST /api/admin/portal-accounts/:id/reset-password — admin sets a new password
router.post("/portal-accounts/:id/reset-password", wrap(async (req: Request, res: Response) => {
  const { newPassword } = req.body as { newPassword: string };
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  const bcrypt = require("bcryptjs");
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.clientPortalAccount.update({
    where: { id: req.params.id },
    data: { passwordHash: hash, failedLoginCount: 0, lockedUntil: null },
  });
  res.json({ success: true, message: "Password reset successfully" });
}));

// PATCH /api/admin/portal-accounts/:id/status — suspend / activate account
router.patch("/portal-accounts/:id/status", wrap(async (req: Request, res: Response) => {
  const { status } = req.body as { status: string };
  const allowed = ["ACTIVE", "SUSPENDED", "BLACKLISTED", "PENDING_KYC"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const account = await prisma.clientPortalAccount.update({
    where: { id: req.params.id },
    data: { status },
    select: { id: true, status: true, clientNumber: true },
  });
  res.json(account);
}));

// POST /api/admin/portal-accounts/:id/unlock — clear failed logins and lock
router.post("/portal-accounts/:id/unlock", wrap(async (req: Request, res: Response) => {
  await prisma.clientPortalAccount.update({
    where: { id: req.params.id },
    data: { failedLoginCount: 0, lockedUntil: null },
  });
  res.json({ success: true });
}));

// POST /api/admin/portal-accounts/:id/notify — send in-app notification to client
router.post("/portal-accounts/:id/notify", wrap(async (req: Request, res: Response) => {
  const { subject, body, category } = req.body as { subject: string; body: string; category?: string };
  if (!subject || !body) return res.status(400).json({ error: "subject and body required" });
  const notification = await prisma.clientNotification.create({
    data: {
      accountId: req.params.id,
      subject,
      body,
      category: category ?? "GENERAL",
    },
  });
  res.status(201).json(notification);
}));

// PATCH /api/admin/portal-accounts/:id/kyc — manually set KYC status
router.patch("/portal-accounts/:id/kyc", wrap(async (req: Request, res: Response) => {
  const { kycStatus } = req.body as { kycStatus: string };
  const allowed = ["NOT_STARTED", "SUBMITTED", "IN_REVIEW", "VERIFIED", "REJECTED"];
  if (!allowed.includes(kycStatus)) return res.status(400).json({ error: "Invalid kycStatus" });
  const account = await prisma.clientPortalAccount.update({
    where: { id: req.params.id },
    data: { kycStatus },
    select: { id: true, kycStatus: true },
  });
  res.json(account);
}));

// DELETE /api/admin/portal-accounts/:id — permanently delete account + all linked data
router.delete("/portal-accounts/:id", wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Only SUPER_ADMIN can delete accounts." });
  }
  const id = req.params.id;
  // Delete in dependency order
  await prisma.clientNotification.deleteMany({ where: { accountId: id } });
  await prisma.kycDocument.deleteMany({ where: { accountId: id } });
  await prisma.portalLoanApplication.deleteMany({ where: { accountId: id } });
  await prisma.portalRefreshToken.deleteMany({ where: { accountId: id } });
  await prisma.clientPortalAccount.delete({ where: { id } });
  res.json({ success: true });
}));

// PATCH /api/admin/portal-accounts/:id/trust — grant or revoke trusted client status
router.patch("/portal-accounts/:id/trust", wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { isTrustedClient } = req.body as { isTrustedClient: boolean };

  const updated = await prisma.clientPortalAccount.update({
    where: { id: req.params.id },
    data: {
      isTrustedClient: !!isTrustedClient,
      trustGrantedAt: isTrustedClient ? new Date() : null,
      trustGrantedBy: isTrustedClient ? `${user.firstName} ${user.lastName}` : null,
    },
    select: { id: true, isTrustedClient: true, trustGrantedAt: true, trustGrantedBy: true },
  });

  // Send in-app notification to the client
  if (isTrustedClient) {
    await prisma.clientNotification.create({
      data: {
        accountId: req.params.id,
        subject: "🎉 You've been upgraded to Trusted Client status!",
        body: "Congratulations! You have been granted Trusted Client status by Philix Finance. You now have access to the Trusted Client Express Loan — financing without collateral, based on your outstanding repayment history. Log in to apply now!",
        category: "ACCOUNT",
      },
    }).catch(() => {});
  }

  res.json(updated);
}));

// GET /api/admin/portal-accounts/:id/trust-score — compute trust score for a client
router.get("/portal-accounts/:id/trust-score", wrap(async (req: Request, res: Response) => {
  const account = await prisma.clientPortalAccount.findUnique({
    where: { id: req.params.id },
    include: {
      portalLoans: {
        select: { status: true, amountRequested: true, createdAt: true, reviewedAt: true, termMonths: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!account) return res.status(404).json({ error: "Account not found" });

  const loans = (account as any).portalLoans ?? [];
  const disbursed = loans.filter((l: any) => l.status === "DISBURSED").length;
  const approved  = loans.filter((l: any) => l.status === "APPROVED" || l.status === "DISBURSED").length;
  const rejected  = loans.filter((l: any) => l.status === "REJECTED").length;
  const total     = loans.length;

  // Trust score out of 100
  let score = 0;

  // Repayment History (40 pts) — based on completed/disbursed loans
  score += Math.min(40, disbursed * 10);

  // Income Stability (25 pts) — based on having income on file
  if ((account as any).monthlyIncome && (account as any).monthlyIncome > 0) score += 15;
  if ((account as any).employer) score += 10;

  // Employment Duration (15 pts) — based on account age
  const accountAgeMonths = Math.floor((Date.now() - new Date((account as any).createdAt).getTime()) / (30 * 86400000));
  score += Math.min(15, accountAgeMonths);

  // Existing Relationship (10 pts) — total loans taken
  score += Math.min(10, total * 2);

  // Verification Success (10 pts) — KYC and profile completeness
  if ((account as any).kycStatus === "VERIFIED") score += 7;
  if ((account as any).nrcNumber) score += 3;

  // Deductions for bad behavior
  if (rejected > 0) score = Math.max(0, score - rejected * 5);

  score = Math.min(100, Math.max(0, score));

  // Approval band
  let recommendation: string;
  let grade: string;
  if (score >= 90)      { recommendation = "AUTOMATIC_APPROVAL"; grade = "A"; }
  else if (score >= 75) { recommendation = "MANAGER_REVIEW";     grade = "B"; }
  else if (score >= 60) { recommendation = "SENIOR_REVIEW";      grade = "C"; }
  else                  { recommendation = "DECLINE";             grade = "D"; }

  // Loan limit based on tier
  let maxLoanLimit: number;
  if (disbursed === 0)     maxLoanLimit = 0;
  else if (disbursed <= 1) maxLoanLimit = 5000;
  else if (disbursed <= 3) maxLoanLimit = 10000;
  else                     maxLoanLimit = 25000;

  // Update stored trust score
  await prisma.clientPortalAccount.update({
    where: { id: req.params.id },
    data: { trustScore: score },
  });

  res.json({
    score,
    grade,
    recommendation,
    maxLoanLimit,
    breakdown: {
      repaymentHistory: Math.min(40, disbursed * 10),
      incomeStability:  ((account as any).monthlyIncome ? 15 : 0) + ((account as any).employer ? 10 : 0),
      accountAge:       Math.min(15, accountAgeMonths),
      relationship:     Math.min(10, total * 2),
      verification:     ((account as any).kycStatus === "VERIFIED" ? 7 : 0) + ((account as any).nrcNumber ? 3 : 0),
    },
    stats: {
      totalLoans: total,
      disbursed,
      approved,
      rejected,
      accountAgeMonths,
      isTrustedClient: (account as any).isTrustedClient,
      trustGrantedAt: (account as any).trustGrantedAt,
      trustGrantedBy: (account as any).trustGrantedBy,
    },
  });
}));

// POST /api/admin/wipe-demo-data — clean-slate launch (SUPER_ADMIN only)
router.post("/wipe-demo-data", wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Only SUPER_ADMIN can wipe demo data." });
  }

  const confirm = (req.body as any).confirm;
  if (confirm !== "WIPE_ALL_DEMO_DATA") {
    return res.status(400).json({ error: "Must include confirm: 'WIPE_ALL_DEMO_DATA' in body." });
  }

  await prisma.clientNotification.deleteMany({});
  await prisma.kycDocument.deleteMany({});
  await prisma.portalLoanApplication.deleteMany({});
  await prisma.portalRefreshToken.deleteMany({});
  await prisma.clientPortalAccount.deleteMany({});

  res.json({
    success: true,
    message: "All portal demo data wiped. CEO account and system config preserved.",
    wipedAt: new Date().toISOString(),
  });
}));

// GET /api/admin/payment-submissions — list all payment proofs for staff review
router.get("/payment-submissions", wrap(async (_req: Request, res: Response) => {
  const submissions = await (prisma as any).loanPaymentSubmission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      application: {
        select: {
          reference: true, productType: true, amountRequested: true,
          account: { select: { firstName: true, lastName: true, clientNumber: true, email: true } },
        },
      },
    },
  });
  res.json(submissions);
}));

// PATCH /api/admin/payment-submissions/:id — approve or reject
router.patch("/payment-submissions/:id", wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { status, rejectedReason } = req.body as { status: string; rejectedReason?: string };
  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "status must be APPROVED or REJECTED" });
  }
  const updated = await (prisma as any).loanPaymentSubmission.update({
    where: { id: req.params.id },
    data: {
      status,
      reviewedBy: `${user.firstName} ${user.lastName}`,
      reviewedAt: new Date(),
      rejectedReason: rejectedReason || null,
    },
  });
  res.json(updated);
}));

// POST /api/admin/broadcast — send message to all clients or a specific client
router.post("/broadcast", wrap(async (req: Request, res: Response) => {
  const { subject, body, category = "ANNOUNCEMENT", targetAccountId } = req.body as {
    subject: string; body: string; category?: string; targetAccountId?: string;
  };
  if (!subject || !body) return res.status(400).json({ error: "subject and body are required" });

  let accounts: { id: string }[];
  if (targetAccountId) {
    accounts = [{ id: targetAccountId }];
  } else {
    accounts = await prisma.clientPortalAccount.findMany({ select: { id: true } });
  }

  await prisma.clientNotification.createMany({
    data: accounts.map(a => ({
      accountId: a.id,
      subject,
      body,
      category,
      sentViaEmail: false,
    })),
  });

  res.json({ sent: accounts.length });
}));

// GET /api/admin/broadcasts — history of announcement notifications
router.get("/broadcasts", wrap(async (_req: Request, res: Response) => {
  const rows = await prisma.clientNotification.findMany({
    where: { category: "ANNOUNCEMENT" },
    orderBy: { createdAt: "desc" },
    take: 50,
    distinct: ["subject", "body"],
    select: { id: true, subject: true, body: true, category: true, createdAt: true },
  });
  res.json(rows);
}));

export default router;
