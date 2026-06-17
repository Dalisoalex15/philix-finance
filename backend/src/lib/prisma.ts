import { PrismaClient } from "../../generated/prisma";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  if (process.env.DATABASE_URL?.startsWith("postgres")) {
    const { PrismaNeonHTTP } = require("@prisma/adapter-neon");
    const adapter = new PrismaNeonHTTP(process.env.DATABASE_URL, {
      arrayMode: false,
      fullResults: true,
    });
    return new PrismaClient({ adapter } as any);
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalThis.__prisma ?? createClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
