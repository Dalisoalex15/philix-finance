/**
 * Validates required environment variables at startup.
 * Exits the process if any critical variable is missing.
 */
export function validateEnv() {
  const required: Record<string, string> = {
    JWT_SECRET:         "Must be a random string of 32+ characters",
    JWT_REFRESH_SECRET: "Must be a different random string of 32+ characters",
  };

  const missing: string[] = [];
  const weak: string[] = [];

  for (const [key, hint] of Object.entries(required)) {
    const val = process.env[key];
    if (!val) {
      missing.push(`  ${key} — ${hint}`);
    } else if (val.length < 32) {
      weak.push(`  ${key} is too short (${val.length} chars). Use 32+ random characters.`);
    }
  }

  if (missing.length > 0) {
    console.error("\n🚨 FATAL: Missing required environment variables:");
    missing.forEach(m => console.error(m));
    console.error("\nSet these in your .env file or deployment environment.\n");
    process.exit(1);
  }

  if (weak.length > 0 && process.env.NODE_ENV === "production") {
    console.error("\n🚨 FATAL: Weak secrets detected in production:");
    weak.forEach(w => console.error(w));
    process.exit(1);
  }

  if (process.env.NODE_ENV === "production") {
    if (!process.env.DATABASE_URL) {
      console.error("\n🚨 FATAL: DATABASE_URL is required in production\n");
      process.exit(1);
    }
    if (!process.env.FRONTEND_URL) {
      console.warn("⚠️  FRONTEND_URL not set — CORS will block all browser requests in production");
    }
    if (!process.env.RESEND_API_KEY && !process.env.SMTP_USER) {
      console.warn("⚠️  No email provider configured — OTP emails will not be delivered");
    }
  }
}
