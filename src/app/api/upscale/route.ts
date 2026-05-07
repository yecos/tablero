import { NextRequest, NextResponse } from 'next/server';
import { processRequest } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await processRequest({ mode: 'upscale', prompt: body.prompt || 'upscale', image: body.image, model: body.model, userId: body.userId, spaceId: body.spaceId });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Upscale failed' }, { status: 500 });
  }
}
