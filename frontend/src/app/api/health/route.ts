import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/server/db';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({
      status: 'healthy',
      service: 'insurance-agent-platform-serverless',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'degraded',
      error: error.message,
    }, { status: 500 });
  }
}

