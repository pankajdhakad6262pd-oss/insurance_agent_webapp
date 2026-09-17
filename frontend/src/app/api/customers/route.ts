import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/server/db';
import { Customer } from '../../../lib/server/models';
import { verifyAuth } from '../../../lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { createdByAgent: user.id };
    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ firstName: reg }, { lastName: reg }, { email: reg }, { mobile: reg }, { city: reg }];
    }

    const [items, total] = await Promise.all([
      Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Customer.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const body = await req.json();

    const cleanEmail = (body.email || '').toLowerCase().trim();
    if (!cleanEmail) {
      return NextResponse.json(
        { success: false, message: 'Customer email address is required.' },
        { status: 400 }
      );
    }

    // Check for existing customer by email
    const existingCustomer = await Customer.findOne({ email: cleanEmail });
    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: `A customer with email '${cleanEmail}' already exists. Please use a unique email address.` },
        { status: 409 }
      );
    }

    const customer = await Customer.create({
      ...body,
      email: cleanEmail,
      createdByAgent: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Customer profile created successfully',
      data: customer,
    }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'A customer with this email address already exists. Please use a unique email address.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
