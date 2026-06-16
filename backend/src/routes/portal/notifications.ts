import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { authenticatePortal } from "../../middleware/portalAuth";

const router = Router();
router.use(authenticatePortal);

// GET /api/portal/notifications
router.get("/", async (req: Request, res: Response) => {
  const id = (req as Request & { portalAccountId: string }).portalAccountId;
  const { page = "1", limit = "20" } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const [notifications, total] = await Promise.all([
    prisma.clientNotification.findMany({
      where: { accountId: id },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit as string),
    }),
    prisma.clientNotification.count({ where: { accountId: id } }),
  ]);

  const unread = await prisma.clientNotification.count({ where: { accountId: id, isRead: false } });
  res.json({ notifications, total, unread, page: parseInt(page as string) });
});

// POST /api/portal/notifications/mark-read
router.post("/mark-read", async (req: Request, res: Response) => {
  const id = (req as Request & { portalAccountId: string }).portalAccountId;
  const { ids } = req.body; // array of notification ids, or "all"
  if (ids === "all") {
    await prisma.clientNotification.updateMany({ where: { accountId: id }, data: { isRead: true } });
  } else if (Array.isArray(ids)) {
    await prisma.clientNotification.updateMany({ where: { accountId: id, id: { in: ids } }, data: { isRead: true } });
  }
  res.json({ message: "Marked as read" });
});

// DELETE /api/portal/notifications/:notifId
router.delete("/:notifId", async (req: Request, res: Response) => {
  const id = (req as Request & { portalAccountId: string }).portalAccountId;
  await prisma.clientNotification.deleteMany({ where: { id: req.params.notifId, accountId: id } });
  res.json({ message: "Deleted" });
});

export default router;
