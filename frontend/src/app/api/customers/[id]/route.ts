import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/server/db';
import { Customer } from '../../../../lib/server/models';
import { verifyAuth } from '../../../../lib/server/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    const customer = await Customer.findById(id).populate('createdByAgent', 'name email').lean();
    if (!customer) return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: customer });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

