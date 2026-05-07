import { NextRequest, NextResponse } from 'next/server';
import { processRequest } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await processRequest({ mode: 'audio', prompt: body.prompt, userId: body.userId, spaceId: body.spaceId });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Audio generation failed' }, { status: 500 });
  }
}
