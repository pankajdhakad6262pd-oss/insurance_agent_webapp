import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/server/db';
import { Quote } from '../../../lib/server/models';
import { verifyAuth } from '../../../lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const filter = user.role === 'admin' ? {} : { agentId: user.id };

    const [items, total] = await Promise.all([
      Quote.find(filter)
        .populate('agentId', 'name email mobile licenseNumber role')
        .populate('customerId', 'firstName lastName email mobile')
        .populate({ path: 'productId', populate: { path: 'categoryId', select: 'name slug' } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Quote.countDocuments(filter),
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

