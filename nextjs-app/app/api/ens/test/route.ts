import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'ENS API is working',
    timestamp: new Date().toISOString(),
    env: {
      hasApiKey: !!process.env.NEXT_PUBLIC_ENS_API_KEY,
      apiKeyPreview: process.env.NEXT_PUBLIC_ENS_API_KEY?.slice(0, 8) + '...'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Test endpoint received:', body);
    
    return NextResponse.json({
      received: body,
      message: 'Test endpoint working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to parse request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}
