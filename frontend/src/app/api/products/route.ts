import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/server/db';
import { InsuranceProduct } from '../../../lib/server/models';
import { verifyAuth } from '../../../lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    const query: Record<string, any> = {};
    if (categoryId && categoryId !== 'all') query.categoryId = categoryId;

    const products = await InsuranceProduct.find(query)
      .populate('categoryId', 'name slug description icon')
      .sort({ premium: 1 })
      .lean();

    return NextResponse.json({ success: true, data: products });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

