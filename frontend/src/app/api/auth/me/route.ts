import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/server/db';
import { Agent } from '../../../../lib/server/models';
import { verifyAuth } from '../../../../lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const agent = await Agent.findById(user.id);
    if (!agent) return NextResponse.json({ success: false, message: 'Agent not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        mobile: agent.mobile,
        role: agent.role,
        createdAt: agent.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

