import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/server/db';
import { Payment, Quote, PolicyActivation } from '../../../../../lib/server/models';
import { verifyAuth } from '../../../../../lib/server/auth';
import { sendActivationEmail } from '../../../../../lib/server/email';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();

    const payment = await Payment.findById(id).populate('customerId').populate({
      path: 'quoteId',
      populate: { path: 'productId' },
    });

    if (!payment) return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 });

    payment.paymentStatus = 'completed';
    payment.paidAt = new Date();
    await payment.save();

    const quote = payment.quoteId as any;
    const customer = payment.customerId as any;
    const product = quote?.productId as any;

    if (quote) {
      await Quote.findByIdAndUpdate(quote._id, { status: 'paid' });
    }

    const termYears = product?.termYears || 1;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + termYears);

    const policyNumber = `POL-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const policy = await PolicyActivation.create({
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

    // Send confirmation email via Resend
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

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully. Policy activated and confirmation email sent!',
      data: {
        payment,
        policy,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

