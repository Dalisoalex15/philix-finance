// @ts-nocheck
import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

const router = Router();
router.use(authenticate);

// GET /api/follow-ups
router.get("/", wrap(async (req: Request, res: Response) => {
  const { status, priority, assignedTo, type } = req.query as Record<string, string>;
  const where: any = {};
  if (status && status !== "ALL") where.status = status;
  if (priority && priority !== "ALL") where.priority = priority;
  if (assignedTo) where.assignedTo = { contains: assignedTo, mode: "insensitive" };
  if (type && type !== "ALL") where.followUpType = type;

  const items = await (prisma as any).loanFollowUp.findMany({
    where,
    orderBy: [
      { priority: "asc" },   // URGENT sorts before LOW in asc if we define custom order
      { scheduledAt: "asc" },
    ],
    take: 500,
  });

  // Sort priority: URGENT → HIGH → MEDIUM → LOW
  const PRIO = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  items.sort((a: any, b: any) =>
    (PRIO[a.priority] ?? 2) - (PRIO[b.priority] ?? 2) ||
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  res.json(items);
}));

// GET /api/follow-ups/my — follow-ups assigned to the current user
router.get("/my", wrap(async (req: any, res: Response) => {
  const { firstName, lastName, email } = req.user;
  const name = `${firstName} ${lastName}`;
  const items = await (prisma as any).loanFollowUp.findMany({
    where: {
      OR: [
        { assignedTo: { contains: email, mode: "insensitive" } },
        { assignedTo: { contains: name,  mode: "insensitive" } },
      ],
      status: { notIn: ["COMPLETED", "FAILED"] },
    },
    orderBy: { scheduledAt: "asc" },
  });
  res.json(items);
}));

// GET /api/follow-ups/stats
router.get("/stats", wrap(async (_req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [pending, overdue, todayCount, completedWeek, urgent] = await Promise.all([
    (prisma as any).loanFollowUp.count({ where: { status: "PENDING" } }),
    (prisma as any).loanFollowUp.count({ where: { status: "PENDING", scheduledAt: { lt: today } } }),
    (prisma as any).loanFollowUp.count({ where: { scheduledAt: { gte: today, lt: tomorrow }, status: { notIn: ["COMPLETED","FAILED"] } } }),
    (prisma as any).loanFollowUp.count({
      where: {
        status: "COMPLETED",
        completedAt: { gte: new Date(Date.now() - 7 * 86400000) },
      },
    }),
    (prisma as any).loanFollowUp.count({ where: { priority: "URGENT", status: "PENDING" } }),
  ]);
  res.json({ pending, overdue, todayCount, completedWeek, urgent });
}));

// POST /api/follow-ups
router.post("/", wrap(async (req: any, res: Response) => {
  const {
    portalClientId, applicationId, clientName, clientPhone,
    loanRef, amountDue, daysOverdue, assignedTo,
    followUpType, priority, notes, scheduledAt,
  } = req.body;

  if (!clientName || !assignedTo || !scheduledAt) {
    throw new AppError("clientName, assignedTo and scheduledAt are required", 400);
  }

  const fu = await (prisma as any).loanFollowUp.create({
    data: {
      portalClientId: portalClientId || null,
      applicationId: applicationId || null,
      clientName: String(clientName).trim(),
      clientPhone: clientPhone || null,
      loanRef: loanRef || null,
      amountDue: amountDue ? parseFloat(String(amountDue)) : null,
      daysOverdue: daysOverdue ? parseInt(String(daysOverdue)) : null,
      assignedTo: String(assignedTo).trim(),
      assignedBy: `${req.user.firstName} ${req.user.lastName}`,
      followUpType: followUpType || "CALL",
      priority: priority || "MEDIUM",
      notes: notes || null,
      scheduledAt: new Date(scheduledAt),
    },
  });
  res.status(201).json(fu);
}));

// PATCH /api/follow-ups/:id
router.patch("/:id", wrap(async (req: any, res: Response) => {
  const existing = await (prisma as any).loanFollowUp.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError("Follow-up not found", 404);

  const { status, outcome, notes, priority, scheduledAt, nextFollowUpAt } = req.body;
  const data: any = {};

  if (status) data.status = status;
  if (outcome !== undefined) data.outcome = outcome;
  if (notes !== undefined) data.notes = notes;
  if (priority) data.priority = priority;
  if (scheduledAt) data.scheduledAt = new Date(scheduledAt);
  if (nextFollowUpAt) data.nextFollowUpAt = new Date(nextFollowUpAt);
  if (status === "COMPLETED" || status === "FAILED") data.completedAt = new Date();

  const updated = await (prisma as any).loanFollowUp.update({
    where: { id: req.params.id },
    data,
  });
  res.json(updated);
}));

// DELETE /api/follow-ups/:id
router.delete("/:id", wrap(async (req: Request, res: Response) => {
  await (prisma as any).loanFollowUp.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

export default router;
