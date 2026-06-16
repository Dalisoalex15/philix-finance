import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { authenticatePortal } from "../../middleware/portalAuth";
import { Mailer } from "../../lib/mailer";

const router = Router();
router.use(authenticatePortal);

// POST /api/portal/kyc — submit KYC documents
router.post("/", async (req: Request, res: Response) => {
  const id = (req as Request & { portalAccountId: string }).portalAccountId;
  const { nrcNumber, documents } = req.body;
  // documents: Array<{ docType, fileUrl, fileName, mimeType }>

  if (!nrcNumber) throw new AppError("NRC number required", 400);
  if (!documents || documents.length === 0) throw new AppError("At least one document required", 400);

  const account = await prisma.clientPortalAccount.findUnique({ where: { id } });
  if (!account) throw new AppError("Account not found", 404);

  // Delete old docs
  await prisma.kycDocument.deleteMany({ where: { accountId: id } });

  // Create new docs
  await prisma.kycDocument.createMany({
    data: documents.map((d: { docType: string; fileUrl: string; fileName: string; mimeType: string }) => ({
      accountId: id,
      docType: d.docType,
      fileUrl: d.fileUrl || `/uploads/kyc/${id}/${d.fileName}`,
      fileName: d.fileName,
      mimeType: d.mimeType || "image/jpeg",
    })),
  });

  const updated = await prisma.clientPortalAccount.update({
    where: { id },
    data: { nrcNumber, kycStatus: "SUBMITTED", kycSubmittedAt: new Date() },
  });

  // Notify client
  Mailer.kycSubmitted({ email: account.email, firstName: account.firstName, id }).catch(() => {});

  // Create in-app notification for staff (internal)
  await prisma.clientNotification.create({
    data: {
      accountId: id,
      subject: "KYC Documents Submitted",
      body: `Your identity documents have been submitted and are under review. We will notify you within 1-2 business days.`,
      category: "KYC",
      sentViaEmail: true,
    },
  });

  const { passwordHash, ...safe } = updated as Record<string, unknown>;
  res.json({ ...safe, message: "KYC documents submitted successfully" });
});

// GET /api/portal/kyc — get current KYC status
router.get("/", async (req: Request, res: Response) => {
  const id = (req as Request & { portalAccountId: string }).portalAccountId;
  const account = await prisma.clientPortalAccount.findUnique({
    where: { id },
    include: { kycDocuments: true },
  });
  if (!account) throw new AppError("Not found", 404);
  res.json({
    kycStatus: account.kycStatus,
    kycSubmittedAt: account.kycSubmittedAt,
    kycVerifiedAt: account.kycVerifiedAt,
    kycRejectedReason: account.kycRejectedReason,
    nrcNumber: account.nrcNumber,
    documents: account.kycDocuments,
  });
});

export default router;
