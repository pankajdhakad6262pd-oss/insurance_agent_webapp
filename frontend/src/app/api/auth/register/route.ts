import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../../lib/server/db';
import { Agent } from '../../../../lib/server/models';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_insurance_agent_platform_2026';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { name, email, mobile, password } = await req.json();

    if (!name || !email || !mobile || !password) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    const cleanEmail = (email || '').toLowerCase().trim();

    const existing = await Agent.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `An agent account with email '${cleanEmail}' already exists. Please sign in or use another email.` },
        { status: 409 }
      );
    }

    const agent = await Agent.create({
      name: name.trim(),
      email: cleanEmail,
      mobile: mobile.trim(),
      password,
      role: 'agent',
    });

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
      message: 'Agent registered successfully',
      data: { agent: safeAgent, token },
    }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'An agent account with this email address already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
