import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/server/db';
import { InsuranceCategory } from '../../../../lib/server/models';
import { verifyAuth } from '../../../../lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const categories = await InsuranceCategory.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

