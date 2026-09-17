import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/server/db';
import { Customer, InsuranceProduct, Agent, Quote } from '../../../../lib/server/models';
import { verifyAuth } from '../../../../lib/server/auth';
import { generatePdfBuffer } from '../../../../lib/server/pdf';
import { getBaseUrl } from '../../../../lib/server/url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { customerId, productId, notes } = await req.json();

    const [customer, product, agent] = await Promise.all([
      Customer.findById(customerId),
      InsuranceProduct.findById(productId).populate('categoryId'),
      Agent.findById(user.id),
    ]);

    if (!customer || !product || !agent) {
      return NextResponse.json({ success: false, message: 'Invalid customer, product, or agent' }, { status: 400 });
    }

    const tempQuote = new Quote({
      customerId: customer._id,
      productId: product._id,
      agentId: agent._id,
      generatedPdfUrl: 'pending',
      premium: product.premium,
      coverageAmount: product.coverageAmount,
      status: 'generated',
      notes,
    });

    const quoteId = tempQuote._id.toString();
    const pdfUrl = `/api/quotes/${quoteId}/pdf`;
    tempQuote.generatedPdfUrl = pdfUrl;
    await tempQuote.save();

    // Generate WhatsApp Share Link
    const cleanPhone = customer.mobile ? customer.mobile.replace(/[^\d]/g, '') : '';
    const baseUrl = getBaseUrl(req);
    const fullPdfUrl = `${baseUrl}${pdfUrl}`;

    const msg =
      `Hello ${customer.firstName} ${customer.lastName},\n\n` +
      `Here is your official insurance quotation for *${product.name}*.\n\n` +
      `Premium Amount: *$${product.premium.toLocaleString()} USD*\n` +
      `Sum Assured: *$${product.coverageAmount.toLocaleString()} USD*\n\n` +
      `You can view and download your full quotation breakdown PDF here:\n` +
      `${fullPdfUrl}\n\n` +
      `Please let me know if you would like to proceed with policy activation.\n\n` +
      `Best regards,\n${agent.name} (Your Insurance Advisor)`;

    const whatsAppShareUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    return NextResponse.json({
      success: true,
      message: 'Quotation PDF generated successfully',
      data: {
        quote: tempQuote,
        whatsAppShareUrl,
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

