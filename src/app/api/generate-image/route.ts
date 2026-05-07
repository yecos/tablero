import { NextRequest, NextResponse } from 'next/server';
import { processRequest } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await processRequest({ mode: 'image', prompt: body.prompt, negativePrompt: body.negativePrompt, model: body.model, width: body.width, height: body.height, steps: body.steps, cfgScale: body.cfgScale, seed: body.seed, batchSize: body.batchSize, userId: body.userId, spaceId: body.spaceId });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Image generation failed' }, { status: 500 });
  }
}
