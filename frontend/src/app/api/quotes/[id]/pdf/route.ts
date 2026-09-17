import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/server/db';
import { Quote } from '../../../../../lib/server/models';
import { generatePdfBuffer } from '../../../../../lib/server/pdf';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const quote = await Quote.findById(id)
      .populate('customerId')
      .populate('productId')
      .populate('agentId');

    if (!quote) {
      return new NextResponse('Quotation document not found', { status: 404 });
    }

    const customer = quote.customerId as any;
    const product = quote.productId as any;
    const agent = quote.agentId as any;

    const pdfBuffer = await generatePdfBuffer({
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Valued Client',
      customerEmail: customer?.email || 'client@example.com',
      customerMobile: customer?.mobile || 'N/A',
      customerAge: customer?.age || 30,
      customerGender: customer?.gender || 'N/A',
      customerOccupation: customer?.occupation || 'Professional',
      customerCity: customer ? `${customer.city}, ${customer.state}` : 'N/A',
      customerVehicle: customer?.vehicleType || 'None',
      productName: product?.name || 'Insurance Policy',
      productDescription: product?.description || 'Official Policy Underwriting',
      coverageAmount: quote.coverageAmount,
      premium: quote.premium,
      termYears: product?.termYears || 1,
      agentName: agent?.name || 'Authorized Platform Agent',
      quoteRef: `Q-${id.slice(-8).toUpperCase()}`,
    });

    const body = new Uint8Array(pdfBuffer);

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="quote-${id}.pdf"`,
      },
    });
  } catch (err: any) {
    return new NextResponse(`PDF Generation Error: ${err.message}`, { status: 500 });
  }
}

