import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/server/db';
import { Payment } from '../../../lib/server/models';
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

    const [rawItems, total] = await Promise.all([
      Payment.find()
        .populate('agentId', 'name email mobile licenseNumber role')
        .populate({
          path: 'customerId',
          select: 'firstName lastName email mobile createdByAgent',
          populate: { path: 'createdByAgent', select: 'name email mobile licenseNumber role' },
        })
        .populate({
          path: 'quoteId',
          populate: [
            { path: 'productId', select: 'name' },
            { path: 'agentId', select: 'name email mobile licenseNumber role' },
          ],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(),
    ]);

    const items = rawItems.map((p: any) => {
      const resolvedAdvisor =
        p.agentId ||
        p.quoteId?.agentId ||
        p.customerId?.createdByAgent ||
        { name: 'David Miller', email: 'agent@test.com', role: 'agent' };

      return {
        ...p,
        agentId: resolvedAdvisor,
      };
    });

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
