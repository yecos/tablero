import { NextRequest, NextResponse } from 'next/server';
import { processRequest } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await processRequest({ mode: 'video', prompt: body.prompt, model: body.model, image: body.image, userId: body.userId, spaceId: body.spaceId });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Video generation failed' }, { status: 500 });
  }
}
