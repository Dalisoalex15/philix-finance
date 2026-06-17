import app from "../backend/src/app";

// Temporary debug endpoint
(app as any).get("/api/debug-env", (_req: any, res: any) => {
  const dbUrl = process.env.DATABASE_URL;
  res.json({
    DATABASE_URL_SET: !!dbUrl,
    DATABASE_URL_PREFIX: dbUrl ? dbUrl.substring(0, 15) + "..." : "MISSING",
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });
});

export default app;
