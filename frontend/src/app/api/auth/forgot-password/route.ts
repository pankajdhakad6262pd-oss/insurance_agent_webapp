import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  console.log(`[Forgot Password] Reset instructions simulated for ${email}`);
  return NextResponse.json({
    success: true,
    message: 'If an account exists with this email, password reset instructions have been sent.',
  });
}

