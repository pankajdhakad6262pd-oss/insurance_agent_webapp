import { Resend } from 'resend';
import { config } from '../config/env';
import { ICustomer, IInsuranceProduct, IPolicyActivation } from '../types';

export interface PolicyEmailData {
  customer: ICustomer;
  product: IInsuranceProduct;
  policy: IPolicyActivation;
  premiumAmount: number;
}

export class EmailService {
  private resendClient: Resend | null = null;

  constructor() {
    if (config.resend.isConfigured) {
      this.resendClient = new Resend(config.resend.apiKey);
      console.log('[EmailService] Resend email client initialized.');
    } else {
      console.log('[EmailService] Resend API key not configured. Mock email logger active.');
    }
  }

  async sendPolicyActivationEmail(data: PolicyEmailData): Promise<void> {
    const { customer, product, policy, premiumAmount } = data;
    const recipientEmail = customer.email;
    const subject = 'Your Insurance Policy Is Active';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
          .badge { display: inline-block; background: #10b981; color: #ffffff; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 13px; margin-top: 12px; }
          .content { padding: 32px 24px; }
          .table-box { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table-box td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .table-box td:first-child { font-weight: 600; color: #64748b; width: 40%; }
          .table-box td:last-child { color: #0f172a; font-weight: 500; }
          .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;font-size:24px;letter-spacing:-0.5px;">InsureShield Platform</h1>
            <div class="badge">&#10003; POLICY ISSUED &amp; ACTIVE</div>
          </div>
          <div class="content">
            <h2 style="font-size:18px;color:#0f172a;margin-top:0;">Congratulations, ${customer.firstName}!</h2>
            <p style="font-size:14px;line-height:1.6;color:#475569;">
              We are pleased to confirm that your payment has been processed successfully and your insurance policy certificate is now officially active.
            </p>
            <table class="table-box">
              <tr>
                <td>Policy Number</td>
                <td><strong style="color:#1e3a8a;">${policy.policyNumber}</strong></td>
              </tr>
              <tr>
                <td>Plan Name</td>
                <td>${product.name}</td>
              </tr>
              <tr>
                <td>Sum Assured</td>
                <td>$${product.coverageAmount.toLocaleString()} USD</td>
              </tr>
              <tr>
                <td>Annual Premium Paid</td>
                <td>$${premiumAmount.toLocaleString()} USD</td>
              </tr>
              <tr>
                <td>Coverage Effective Date</td>
                <td>${new Date(policy.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
              </tr>
              <tr>
                <td>Policy Expiry Date</td>
                <td>${new Date(policy.endDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
              </tr>
              <tr>
                <td>Insured Member</td>
                <td>${customer.firstName} ${customer.lastName} (${customer.age} yrs)</td>
              </tr>
            </table>
            <p style="font-size:13px;line-height:1.6;color:#64748b;background:#f1f5f9;padding:12px 16px;border-radius:8px;">
              &#128222; <strong>24/7 Priority Emergency Assistance:</strong> In case of an urgent hospital admission, roadside breakdown, or travel emergency, contact claims support at <strong>1-800-INSUR-SHIELD</strong>.
            </p>
          </div>
          <div class="footer">
            &copy; 2026 InsureShield Agent Platform. All rights reserved.<br>
            This is an automated policy confirmation email sent on behalf of your certified agent.
          </div>
        </div>
      </body>
      </html>
    `;

    if (this.resendClient) {
      try {
        const result = await this.resendClient.emails.send({
          from: config.resend.emailFrom,
          to: recipientEmail,
          subject,
          html: htmlContent,
        });
        console.log(`[EmailService] Resend email dispatched to ${recipientEmail}. ID:`, result.data?.id);
      } catch (error) {
        console.error('[EmailService] Failed to send email via Resend:', error);
      }
    } else {
      console.log(`\n================== [MOCK RESEND EMAIL DISPATCH] ==================`);
      console.log(`To: ${recipientEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Policy Number: ${policy.policyNumber}`);
      console.log(`Product: ${product.name}`);
      console.log(`Premium: $${premiumAmount} USD`);
      console.log(`Status: ACTIVE`);
      console.log(`===================================================================\n`);
    }
  }
}

export const emailService = new EmailService();

