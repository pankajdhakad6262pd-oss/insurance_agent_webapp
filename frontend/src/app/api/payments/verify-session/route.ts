import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '../../../../lib/server/db';
import { Payment, Quote, PolicyActivation, Customer, InsuranceProduct, Agent } from '../../../../lib/server/models';
import { sendActivationEmail } from '../../../../lib/server/email';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    const quoteId = searchParams.get('quote_id');

    if (!sessionId && !quoteId) {
      return NextResponse.json({ success: false, message: 'Missing session_id or quote_id' }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Locate Payment record
    let payment = sessionId
      ? await Payment.findOne({ stripeSessionId: sessionId })
      : null;

    if (!payment && quoteId) {
      payment = await Payment.findOne({ quoteId }).sort({ createdAt: -1 });
    }

    if (!payment) {
      return NextResponse.json({ success: false, message: 'Payment record not found' }, { status: 404 });
    }

    // 2. Fetch related entities
    const quote = await Quote.findById(payment.quoteId).populate('customerId').populate('productId').populate('agentId');
    if (!quote) {
      return NextResponse.json({ success: false, message: 'Associated quote not found' }, { status: 404 });
    }

    const customer = quote.customerId as any;
    const product = quote.productId as any;
    const agent = quote.agentId as any;

    // 3. Verify with Stripe if real Stripe session
    let isPaymentValid = false;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const isStripeConfigured = Boolean(stripeKey && stripeKey !== 'sk_test_placeholder' && stripeKey.startsWith('sk_'));

    if (sessionId && sessionId.startsWith('cs_') && isStripeConfigured) {
      try {
        const stripe = new Stripe(stripeKey!, { apiVersion: '2024-12-18.acacia' as any });
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid' || session.status === 'complete') {
          isPaymentValid = true;
        }
      } catch (stripeErr: any) {
        console.error('[VerifySession] Stripe retrieve error:', stripeErr);
      }
    } else {
      // Simulated or mock session
      isPaymentValid = true;
    }

    if (!isPaymentValid) {
      return NextResponse.json({
        success: false,
        message: 'Payment has not been completed on Stripe',
        data: { paymentStatus: payment.paymentStatus },
      }, { status: 400 });
    }

    // 4. Mark Payment as completed if not already
    if (payment.paymentStatus !== 'completed') {
      payment.paymentStatus = 'completed';
      payment.paidAt = new Date();
      await payment.save();

      await Quote.findByIdAndUpdate(quote._id, { status: 'paid' });
    }

    // 5. Activate Policy if not already activated
    let policy = await PolicyActivation.findOne({ paymentId: payment._id });
    if (!policy) {
      const termYears = product?.termYears || 1;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(startDate.getFullYear() + termYears);

      const policyNumber = `POL-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      policy = await PolicyActivation.create({
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

      // Send transactional confirmation email via Resend
      try {
        await sendActivationEmail({
          to: customer.email,
          customerName: `${customer.firstName} ${customer.lastName}`,
          policyNumber,
          productName: product?.name || 'Insurance Plan',
          coverageAmount: product?.coverageAmount || 500000,
          premium: payment.amount,
          startDate: startDate.toLocaleDateString(),
          endDate: endDate.toLocaleDateString(),
        });
        console.log(`[VerifySession] Confirmation email dispatched to ${customer.email} for policy ${policyNumber}`);
      } catch (emailErr) {
        console.error('[VerifySession] Failed to send activation email:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and policy active',
      data: {
        payment,
        policy,
        customer,
        product,
        quote,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

