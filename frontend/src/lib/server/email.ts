import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const SMTP_USER = process.env.SMTP_USER || process.env.SMPT_USER || process.env.GMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.SMPT_PASS || process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM =
  process.env.EMAIL_FROM || (SMTP_USER ? `"InsureShield Platform" <${SMTP_USER}>` : 'onboarding@resend.dev');

export async function sendActivationEmail(options: {
  to: string;
  customerName: string;
  policyNumber: string;
  productName: string;
  coverageAmount: number;
  premium: number;
  startDate: string;
  endDate: string;
}) {
  const subject = `Policy Confirmation: ${options.productName} [#${options.policyNumber}]`;
  const text = `
InsureShield Platform - Official Policy Confirmation

Dear ${options.customerName},

Congratulations! Your insurance policy is active and officially registered.

Policy Details:
- Policy Number: ${options.policyNumber}
- Plan Name: ${options.productName}
- Sum Assured: $${options.coverageAmount.toLocaleString()} USD
- Premium Amount Paid: $${options.premium.toLocaleString()} USD
- Effective Start Date: ${options.startDate}
- Expiration Date: ${options.endDate}

For priority claims or 24/7 assistance, call 1-800-INSUR-SHIELD.

Best regards,
InsureShield Underwriting Team
  `.trim();

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
      <h1 style="color:#1e3a8a;margin-top:0;">InsureShield Platform</h1>
      <p style="background:#10b981;color:white;display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:bold;">
        ✓ POLICY ISSUED &amp; ACTIVE
      </p>
      <h2>Congratulations, ${options.customerName}!</h2>
      <p>Your insurance policy has started and is now officially active.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#64748b;font-weight:bold;">Policy Number:</td><td><strong>${options.policyNumber}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-weight:bold;">Plan Name:</td><td>${options.productName}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-weight:bold;">Sum Assured:</td><td>$${options.coverageAmount.toLocaleString()} USD</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-weight:bold;">Premium Amount:</td><td>$${options.premium.toLocaleString()} USD</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-weight:bold;">Start Date:</td><td>${options.startDate}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-weight:bold;">Expiry Date:</td><td>${options.endDate}</td></tr>
      </table>
      <p style="font-size:12px;color:#64748b;background:#f8fafc;padding:12px;border-radius:8px;">
        For priority claims or 24/7 assistance, call 1-800-INSUR-SHIELD.
      </p>
    </div>
  `;

  // Priority 1: Gmail SMTP (Sends to ANY customer email with 0 domain restrictions)
  if (SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS.replace(/\s+/g, ''), // Strip whitespace from 16-character Google App Password
        },
      });

      await transporter.sendMail({
        from: EMAIL_FROM,
        replyTo: SMTP_USER,
        to: options.to,
        subject,
        text,
        html,
      });

      console.log(`[Gmail SMTP] Dispatched policy confirmation email to ${options.to}`);
      return { success: true, provider: 'gmail_smtp' };
    } catch (smtpErr) {
      console.error('[Gmail SMTP] Email dispatch error:', smtpErr);
    }
  }

  // Priority 2: Resend API
  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: EMAIL_FROM,
        to: options.to,
        subject,
        html,
      });
      console.log(`[Resend] Dispatched policy confirmation email to ${options.to}`);
      return { success: true, provider: 'resend' };
    } catch (e) {
      console.error('[Resend] Email dispatch error:', e);
    }
  }

  // Fallback: Console logger
  console.log(`[Mock Email] To: ${options.to} | Subject: ${subject} | Policy: ${options.policyNumber}`);
  return { success: true, provider: 'mock' };
}
