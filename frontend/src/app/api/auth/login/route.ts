import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../../lib/server/db';
import { Agent } from '../../../../lib/server/models';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_insurance_agent_platform_2026';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 });
    }

    const agent = await Agent.findOne({ email: email.toLowerCase() }).select('+password');
    if (!agent) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await agent.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: agent._id.toString(), email: agent.email, name: agent.name, role: agent.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeAgent = {
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      mobile: agent.mobile,
      role: agent.role,
      createdAt: agent.createdAt,
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: { agent: safeAgent, token },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

