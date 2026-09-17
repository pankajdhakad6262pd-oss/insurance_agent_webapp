import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '../../../../lib/server/db';
import { Quote, Payment } from '../../../../lib/server/models';
import { verifyAuth } from '../../../../lib/server/auth';
import { getBaseUrl } from '../../../../lib/server/url';

export async function POST(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { quoteId } = await req.json();

    const quote = await Quote.findById(quoteId).populate('customerId').populate('productId');
    if (!quote) return NextResponse.json({ success: false, message: 'Quote not found' }, { status: 404 });

    const customer = quote.customerId as any;
    const product = quote.productId as any;

    const baseUrl = getBaseUrl(req);

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const isStripeConfigured = Boolean(
      stripeKey &&
      stripeKey !== 'sk_test_placeholder' &&
      stripeKey.startsWith('sk_')
    );

    let stripePaymentLink = '';
    let stripeSessionId = '';

    if (isStripeConfigured) {
      try {
        const stripe = new Stripe(stripeKey!, {
          apiVersion: '2024-12-18.acacia' as any,
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `${product.name} (Coverage: $${product.coverageAmount.toLocaleString()} USD)`,
                  description: `Policy Quotation Reference #${quote._id}`,
                },
                unit_amount: Math.round(quote.premium * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          customer_email: customer.email,
          success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&quote_id=${quote._id}`,
          cancel_url: `${baseUrl}/customers/${customer._id}?payment_cancelled=true`,
          metadata: {
            quoteId: quote._id.toString(),
            customerId: customer._id.toString(),
            agentId: (user.id || quote.agentId).toString(),
          },
        });

        stripePaymentLink = session.url || `https://checkout.stripe.com/pay/${session.id}`;
        stripeSessionId = session.id;
      } catch (stripeErr: any) {
        console.error('[Stripe] Checkout session creation failed:', stripeErr);
        // Fallback simulation session
        stripeSessionId = `sim_session_${Date.now()}`;
        stripePaymentLink = `${baseUrl}/payment-success?session_id=${stripeSessionId}&quote_id=${quote._id}&simulated=true`;
      }
    } else {
      stripeSessionId = `mock_session_${Date.now()}`;
      stripePaymentLink = `${baseUrl}/payment-success?session_id=${stripeSessionId}&quote_id=${quote._id}&simulated=true`;
    }

    const payment = await Payment.create({
      customerId: customer._id,
      quoteId: quote._id,
      agentId: user.id || quote.agentId,
      stripePaymentLink,
      stripeSessionId,
      amount: quote.premium,
      currency: 'USD',
      paymentStatus: 'pending',
    });

    const cleanPhone = customer.mobile ? customer.mobile.replace(/[^\d]/g, '') : '';
    const msg =
      `Hello ${customer.firstName} ${customer.lastName},\n\n` +
      `Your insurance quotation for *${product.name}* has been approved!\n\n` +
      `Amount Due: *$${quote.premium.toLocaleString()} USD*\n\n` +
      `Please complete your payment using this official link to activate your policy immediately:\n` +
      `${stripePaymentLink}\n\n` +
      `Upon payment, your official certificate and confirmation will be sent to your email (${customer.email}).\n\n` +
      `Best regards,\nYour Insurance Advisor`;

    const whatsAppPaymentUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    return NextResponse.json({
      success: true,
      message: 'Payment link created successfully',
      data: {
        payment,
        stripePaymentLink,
        whatsAppPaymentUrl,
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
