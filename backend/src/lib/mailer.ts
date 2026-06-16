import nodemailer from "nodemailer";
import { logger } from "./logger";
import { prisma } from "./prisma";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface MailOptions {
  to: string;
  toName?: string;
  subject: string;
  body: string;
  category?: string;
  clientId?: string;
  loanId?: string;
  portalAccountId?: string;
}

export async function sendEmail(opts: MailOptions): Promise<boolean> {
  const fromName = process.env.COMPANY_NAME || "Philix Finance";
  const fromEmail = process.env.SMTP_FROM || "noreply@philixfinance.com";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <div style="display:inline-block;width:48px;height:48px;background:#F5A623;border-radius:50%;line-height:48px;text-align:center;margin-bottom:12px;">
                    <span style="font-size:24px;">●</span>
                  </div>
                  <h1 style="color:#fff;font-size:22px;font-weight:800;margin:8px 0 4px;">Philix Finance</h1>
                  <p style="color:#a5b4fc;font-size:12px;margin:0;">Creating a Future Together</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#1e293b;padding:40px;">
            <pre style="font-family:'Segoe UI',Arial,sans-serif;font-size:14px;line-height:1.8;color:#cbd5e1;white-space:pre-wrap;word-break:break-word;margin:0;">${opts.body}</pre>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0f172a;border-radius:0 0 16px 16px;padding:24px 40px;border-top:1px solid #334155;">
            <p style="color:#475569;font-size:11px;margin:0;text-align:center;">
              © ${new Date().getFullYear()} Philix Finance Ltd · Lusaka, Zambia · Bank of Zambia Licensed<br>
              This email was sent to ${opts.to}. This is a confidential communication.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: opts.toName ? `"${opts.toName}" <${opts.to}>` : opts.to,
      subject: opts.subject,
      text: opts.body,
      html,
    });

    // Log in DB
    await prisma.emailLog.create({
      data: {
        to: opts.to,
        toName: opts.toName,
        subject: opts.subject,
        template: opts.category,
        body: opts.body,
        status: "SENT",
        clientId: opts.clientId,
        loanId: opts.loanId,
        triggeredBy: "SYSTEM",
      },
    });

    // Save in-app notification if portal account
    if (opts.portalAccountId) {
      await prisma.clientNotification.create({
        data: {
          accountId: opts.portalAccountId,
          subject: opts.subject,
          body: opts.body,
          category: opts.category || "GENERAL",
          sentViaEmail: true,
        },
      });
    }

    logger.info(`Email sent to ${opts.to}: ${opts.subject}`);
    return true;
  } catch (err) {
    logger.error(`Email send failed to ${opts.to}: ${err}`);
    await prisma.emailLog.create({
      data: {
        to: opts.to,
        toName: opts.toName,
        subject: opts.subject,
        status: "FAILED",
        error: String(err),
        triggeredBy: "SYSTEM",
      },
    }).catch(() => {});
    return false;
  }
}

// Pre-built email senders
export const Mailer = {
  async welcome(account: { email: string; firstName: string; lastName: string; clientNumber: string; id: string }) {
    return sendEmail({
      to: account.email,
      toName: `${account.firstName} ${account.lastName}`,
      subject: "Welcome to Philix Finance! 🎉",
      category: "ACCOUNT",
      portalAccountId: account.id,
      body: `Dear ${account.firstName},

Welcome to Philix Finance! We're excited to have you join us.

YOUR ACCOUNT DETAILS
─────────────────────────────
Client Number:  ${account.clientNumber}
Email:          ${account.email}
Portal:         ${process.env.FRONTEND_URL}/portal
─────────────────────────────

GETTING STARTED
1. Log in to your Client Portal
2. Complete your KYC identity verification
3. Apply for your first loan

We are here to help you achieve your financial goals.

Philix Finance Ltd
Tel: +260 211 XXX XXX
Email: info@philixfinance.com`,
    });
  },

  async kycSubmitted(account: { email: string; firstName: string; id: string }) {
    return sendEmail({
      to: account.email,
      toName: account.firstName,
      subject: "KYC Documents Received — Under Review",
      category: "KYC",
      portalAccountId: account.id,
      body: `Dear ${account.firstName},

We have received your KYC identity verification documents.

STATUS: Under Review

Our compliance team will verify your documents within 1-2 business days. You will receive an email notification once the review is complete.

If you have any questions, please contact us.

Philix Finance Ltd`,
    });
  },

  async loanApplicationReceived(opts: { email: string; firstName: string; reference: string; amount: number; product: string; id: string }) {
    return sendEmail({
      to: opts.email,
      toName: opts.firstName,
      subject: `Loan Application Received — Ref: ${opts.reference}`,
      category: "LOAN",
      portalAccountId: opts.id,
      body: `Dear ${opts.firstName},

Your loan application has been received and is under review.

APPLICATION DETAILS
─────────────────────────────
Reference:   ${opts.reference}
Product:     ${opts.product}
Amount:      K${opts.amount.toLocaleString()}
Status:      Under Review
─────────────────────────────

A Philix Finance Loan Officer will contact you within 24-48 hours.

Philix Finance Ltd`,
    });
  },

  async passwordReset(email: string, firstName: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/portal/reset-password?token=${token}`;
    return sendEmail({
      to: email,
      toName: firstName,
      subject: "Password Reset — Philix Finance",
      category: "ACCOUNT",
      body: `Dear ${firstName},

You requested a password reset for your Philix Finance Client Portal account.

Click the link below to reset your password (valid for 1 hour):
${link}

If you did not request this, please ignore this email.

Philix Finance Ltd`,
    });
  },
};
