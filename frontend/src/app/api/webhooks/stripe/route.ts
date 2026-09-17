import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '../../../../lib/server/db';
import { Payment, Quote, PolicyActivation } from '../../../../lib/server/models';
import { sendActivationEmail } from '../../../../lib/server/email';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey || !signature) {
      return NextResponse.json({ received: true, note: 'Skipped - no stripe key or signature' });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' as any });
    let event: Stripe.Event;

    try {
      if (webhookSecret && webhookSecret !== 'whsec_placeholder') {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } else {
        event = JSON.parse(rawBody) as Stripe.Event;
      }
    } catch (err: any) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await connectToDatabase();

      const payment = await Payment.findOne({ stripeSessionId: session.id })
        .populate('customerId')
        .populate({ path: 'quoteId', populate: { path: 'productId' } });

      if (payment) {
        if (payment.paymentStatus !== 'completed') {
          payment.paymentStatus = 'completed';
          payment.paidAt = new Date();
          await payment.save();

          await Quote.findByIdAndUpdate(payment.quoteId, { status: 'paid' });
        }

        const quote = payment.quoteId as any;
        const customer = payment.customerId as any;
        const product = quote?.productId as any;

        let policy = await PolicyActivation.findOne({ paymentId: payment._id });
        if (!policy && customer && product) {
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
            certificatePdfUrl: quote?.generatedPdfUrl,
          });

          // Send confirmation email
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
          } catch (emailErr) {
            console.error('[Stripe Webhook] Failed to send email:', emailErr);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Stripe Webhook Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

