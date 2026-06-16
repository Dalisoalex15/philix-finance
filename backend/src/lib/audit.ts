import { prisma } from "./prisma";
import { AuditAction } from "@prisma/client";
import { Request } from "express";

interface AuditParams {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  oldValue?: object;
  newValue?: object;
  description: string;
  req?: Request;
}

export async function createAuditLog(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldValue: params.oldValue as any,
        newValue: params.newValue as any,
        description: params.description,
        ipAddress: params.req?.ip,
        userAgent: params.req?.headers["user-agent"],
      },
    });
  } catch (err) {
    // Audit failures should not break business logic
    console.error("Audit log failed:", err);
  }
}
