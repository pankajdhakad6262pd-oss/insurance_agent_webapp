import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/server/db';
import { Quote } from '../../../../lib/server/models';
import { verifyAuth } from '../../../../lib/server/auth';
import { getBaseUrl, cleanUrl } from '../../../../lib/server/url';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    const quote = await Quote.findById(id).populate('customerId').populate('productId').populate('agentId').lean();
    if (!quote) return NextResponse.json({ success: false, message: 'Quote not found' }, { status: 404 });

    const customer = quote.customerId as any;
    const product = quote.productId as any;
    const cleanPhone = customer?.mobile ? customer.mobile.replace(/[^\d]/g, '') : '';
    const name = customer ? `${customer.firstName} ${customer.lastName}` : 'Customer';
    const prodName = product?.name || 'Insurance Plan';

    const baseUrl = getBaseUrl(req);
    const pdfUrl = quote.generatedPdfUrl?.startsWith('http')
      ? cleanUrl(quote.generatedPdfUrl)
      : `${baseUrl}${quote.generatedPdfUrl}`;

    const msg =
      `Hello ${name},\n\n` +
      `Here is your official insurance quotation for *${prodName}*.\n\n` +
      `Premium Amount: *$${quote.premium.toLocaleString()} USD*\n\n` +
      `You can view and download your PDF quotation here:\n` +
      `${pdfUrl}\n\n` +
      `Best regards,\nYour Insurance Advisor`;

    const whatsAppShareUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    return NextResponse.json({
      success: true,
      data: { quote, whatsAppShareUrl },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

