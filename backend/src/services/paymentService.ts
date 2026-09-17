import Stripe from 'stripe';
import { config } from '../config/env';
import { paymentRepository, PaymentRepository } from '../repositories/paymentRepository';
import { quoteRepository, QuoteRepository } from '../repositories/quoteRepository';
import { customerRepository, CustomerRepository } from '../repositories/customerRepository';
import { productRepository, ProductRepository } from '../repositories/productRepository';
import { emailService, EmailService } from './emailService';
import { generateWhatsAppPaymentLink } from '../utils/whatsapp';
import { IPayment, IPolicyActivation } from '../types';
import { AppError } from '../middleware/errorMiddleware';

export class PaymentService {
  private stripe: Stripe | null = null;

  constructor(
    private paymentRepo: PaymentRepository = paymentRepository,
    private quoteRepo: QuoteRepository = quoteRepository,
    private customerRepo: CustomerRepository = customerRepository,
    private productRepo: ProductRepository = productRepository,
    private emailSvc: EmailService = emailService
  ) {
    if (config.stripe.isConfigured) {
      this.stripe = new Stripe(config.stripe.secretKey, {
        apiVersion: '2024-12-18.acacia' as any,
      });
      console.log('[PaymentService] Stripe client initialized.');
    } else {
      console.log('[PaymentService] Stripe secret key not configured. Mock payment link mode active.');
    }
  }

  /**
   * Create a Stripe Checkout Payment Link for a quotation
   */
  async createPaymentLink(quoteId: string, customerId?: string): Promise<{
    payment: IPayment;
    stripePaymentLink: string;
    whatsAppPaymentUrl: string;
  }> {
    const quote = await this.quoteRepo.findById(quoteId);
    if (!quote) {
      throw new AppError('Quote not found', 404);
    }

    const customer = quote.customerId as any;
    const product = quote.productId as any;

    if (!customer || !product) {
      throw new AppError('Customer or Product associated with quote could not be resolved', 400);
    }

    const amountInCents = Math.round(quote.premium * 100);
    let stripePaymentLink = '';
    let stripeSessionId = '';

    if (this.stripe) {
      try {
        // Create a Stripe Checkout Session
        const session = await this.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `${product.name} (Coverage: $${product.coverageAmount.toLocaleString()})`,
                  description: `Policy Quotation Reference #${quote._id}`,
                },
                unit_amount: amountInCents,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          customer_email: customer.email,
          success_url: `${config.clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&quote_id=${quote._id}`,
          cancel_url: `${config.clientUrl}/quotes?cancelled=true`,
          metadata: {
            quoteId: quote._id.toString(),
            customerId: customer._id.toString(),
          },
        });

        stripePaymentLink = session.url || `https://checkout.stripe.com/pay/${session.id}`;
        stripeSessionId = session.id;
      } catch (stripeError: any) {
        console.error('[PaymentService] Stripe API error:', stripeError);
        // Fallback to simulated payment link
        stripeSessionId = `sim_session_${Date.now()}`;
        stripePaymentLink = `${config.clientUrl}/payment-success?session_id=${stripeSessionId}&quote_id=${quote._id}&simulated=true`;
      }
    } else {
      // Mock payment link for development / testing
      stripeSessionId = `mock_session_${Date.now()}`;
      stripePaymentLink = `${config.clientUrl}/payment-success?session_id=${stripeSessionId}&quote_id=${quote._id}&simulated=true`;
    }

    // Persist Payment record
    const payment = await this.paymentRepo.create({
      customerId: customer._id,
      quoteId: quote._id,
      agentId: quote.agentId as any,
      stripePaymentLink,
      stripeSessionId,
      amount: quote.premium,
      currency: 'USD',
      paymentStatus: 'pending',
    });

    // Generate WhatsApp payment link
    const whatsAppPaymentUrl = generateWhatsAppPaymentLink(
      customer.mobile,
      `${customer.firstName} ${customer.lastName}`,
      product.name,
      stripePaymentLink,
      quote.premium
    );

    return {
      payment,
      stripePaymentLink,
      whatsAppPaymentUrl,
    };
  }

  /**
   * Process payment confirmation, activate policy, and dispatch Resend email
   */
  async activatePolicyAndNotify(paymentId: string, sessionId?: string): Promise<{
    payment: IPayment;
    policy: IPolicyActivation;
  }> {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment record not found', 404);
    }

    if (payment.paymentStatus === 'completed') {
      const existingPolicy = await this.paymentRepo.findPolicyByPaymentId(paymentId);
      if (existingPolicy) {
        return { payment, policy: existingPolicy };
      }
    }

    // Update payment status
    const updatedPayment = await this.paymentRepo.updateStatus(paymentId, 'completed', new Date());
    const quoteRef = payment.quoteId as any;
    const rawQuoteId = quoteRef && quoteRef._id ? quoteRef._id.toString() : quoteRef.toString();
    await this.quoteRepo.updateStatus(rawQuoteId, 'paid');

    const customer = payment.customerId as any;
    const quote = payment.quoteId as any;
    const product = quote.productId as any;

    const termYears = product?.termYears || 1;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + termYears);

    const policyNumber = `POL-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const policy = await this.paymentRepo.createPolicyActivation({
      policyNumber,
      customerId: customer._id,
      quoteId: quote._id,
      productId: product._id,
      paymentId: payment._id,
      startDate,
      endDate,
      status: 'active',
      certificatePdfUrl: quote.generatedPdfUrl,
    });

    // Send confirmation email via Resend
    await this.emailSvc.sendPolicyActivationEmail({
      customer,
      product,
      policy,
      premiumAmount: payment.amount,
    });

    return {
      payment: updatedPayment || payment,
      policy,
    };
  }

  /**
   * Handle incoming Stripe webhook
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<any> {
    if (!this.stripe) {
      return { received: true, note: 'Stripe webhook ignored (Stripe not configured)' };
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.stripe.webhookSecret
      );
    } catch (err: any) {
      throw new AppError(`Webhook Signature Verification Failed: ${err.message}`, 400);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const payment = await this.paymentRepo.findBySessionId(session.id);
      if (payment) {
        await this.activatePolicyAndNotify(payment._id.toString(), session.id);
      }
    }

    return { received: true };
  }

  /**
   * List all payments with pagination
   */
  async listPayments(skip = 0, limit = 50): Promise<{ items: IPayment[]; total: number }> {
    return this.paymentRepo.findAll({}, skip, limit);
  }

  /**
   * Get payment details including policy activation
   */
  async getPaymentDetails(id: string): Promise<{ payment: IPayment; policy: IPolicyActivation | null }> {
    const payment = await this.paymentRepo.findById(id);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }
    const policy = await this.paymentRepo.findPolicyByPaymentId(id);
    return { payment, policy };
  }
}

export const paymentService = new PaymentService();

