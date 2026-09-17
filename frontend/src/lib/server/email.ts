import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

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
  const subject = 'Your Insurance Policy Is Active';
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
        <tr><td style="padding:8px 0;color:#64748b;font-weight:bold;">Annual Premium:</td><td>$${options.premium.toLocaleString()} USD</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-weight:bold;">Start Date:</td><td>${options.startDate}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-weight:bold;">Expiry Date:</td><td>${options.endDate}</td></tr>
      </table>
      <p style="font-size:12px;color:#64748b;background:#f8fafc;padding:12px;border-radius:8px;">
        For priority claims or 24/7 assistance, call 1-800-INSUR-SHIELD.
      </p>
    </div>
  `;

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
    } catch (e) {
      console.error('[Resend] Email dispatch error:', e);
    }
  } else {
    console.log(`[Mock Email] To: ${options.to} | Subject: ${subject} | Policy: ${options.policyNumber}`);
  }
}

