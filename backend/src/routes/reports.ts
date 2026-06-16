import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, isManagerOrAbove } from "../middleware/auth";

const router = Router();
router.use(authenticate, isManagerOrAbove);

router.get("/loans-issued", async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const where: any = {};
  if (from) where.disbursementDate = { gte: new Date(from as string) };
  if (to) where.disbursementDate = { ...where.disbursementDate, lte: new Date(to as string) };

  const loans = await prisma.loan.findMany({
    where,
    include: {
      client: { select: { firstName: true, lastName: true, clientNumber: true } },
      loanOfficer: { select: { firstName: true, lastName: true } },
    },
    orderBy: { disbursementDate: "desc" },
  });

  const summary = {
    count: loans.length,
    totalPrincipal: loans.reduce((s, l) => s + l.principal, 0),
    totalDue: loans.reduce((s, l) => s + l.totalDue, 0),
  };

  res.json({ loans, summary });
});

router.get("/collections", async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const where: any = {};
  if (from) where.paymentDate = { gte: new Date(from as string) };
  if (to) where.paymentDate = { ...where.paymentDate, lte: new Date(to as string) };

  const [payments, totals] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        loan: { include: { client: { select: { firstName: true, lastName: true } } } },
        recordedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { paymentDate: "desc" },
    }),
    prisma.payment.aggregate({ where, _sum: { amount: true, interestAmount: true, penaltyAmount: true } }),
  ]);

  res.json({ payments, totals });
});

router.get("/outstanding", async (_req: Request, res: Response) => {
  const loans = await prisma.loan.findMany({
    where: { status: { in: ["ACTIVE", "OVERDUE", "DEFAULTED"] } },
    include: {
      client: { select: { firstName: true, lastName: true, phone: true } },
      collateral: { select: { vaultId: true, type: true, brand: true, model: true } },
    },
    orderBy: { outstandingBalance: "desc" },
  });

  const total = loans.reduce((s, l) => s + l.outstandingBalance, 0);
  res.json({ loans, total });
});

router.get("/portfolio-at-risk", async (_req: Request, res: Response) => {
  const now = new Date();
  const totalResult = await prisma.loan.aggregate({
    where: { status: { in: ["ACTIVE", "OVERDUE", "DEFAULTED"] } },
    _sum: { outstandingBalance: true },
  });
  const total = totalResult._sum.outstandingBalance || 1;

  const parLevels = [1, 7, 30, 60, 90];
  const par = await Promise.all(parLevels.map(async (days) => {
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const result = await prisma.loan.findMany({
      where: { status: { in: ["OVERDUE", "DEFAULTED"] }, lastPaymentDate: { lt: cutoff } },
      select: { outstandingBalance: true, loanNumber: true, daysLate: true },
    });
    const amount = result.reduce((s, l) => s + l.outstandingBalance, 0);
    return { days, count: result.length, amount, percentage: parseFloat(((amount / total) * 100).toFixed(2)) };
  }));

  res.json(par);
});

router.get("/collateral-inventory", async (_req: Request, res: Response) => {
  const items = await prisma.collateral.findMany({
    where: { status: "HELD" },
    include: {
      client: { select: { firstName: true, lastName: true } },
      loans: { where: { status: "ACTIVE" }, select: { loanNumber: true } },
    },
    orderBy: { receivedAt: "desc" },
  });

  const summary = {
    count: items.length,
    totalMarketValue: items.reduce((s, i) => s + i.marketValue, 0),
    totalForcedSale: items.reduce((s, i) => s + i.forcedSaleValue, 0),
  };

  res.json({ items, summary });
});

router.get("/interest-revenue", async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const where: any = {};
  if (from) where.paymentDate = { gte: new Date(from as string) };
  if (to) where.paymentDate = { ...where.paymentDate, lte: new Date(to as string) };

  const revenue = await prisma.payment.aggregate({
    where,
    _sum: { interestAmount: true, penaltyAmount: true, amount: true },
  });

  const processingFees = await prisma.loan.aggregate({
    where: { disbursementDate: where.paymentDate, status: { notIn: ["DRAFT", "CANCELLED"] } },
    _sum: { processingFeeAmount: true },
  });

  res.json({
    interestCollected: revenue._sum.interestAmount || 0,
    penaltiesCollected: revenue._sum.penaltyAmount || 0,
    processingFeesCollected: processingFees._sum.processingFeeAmount || 0,
    totalRevenue: (revenue._sum.interestAmount || 0) + (revenue._sum.penaltyAmount || 0) + (processingFees._sum.processingFeeAmount || 0),
  });
});

export default router;
