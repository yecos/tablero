import { NextRequest, NextResponse } from 'next/server';
import { processRequest } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await processRequest({ mode: 'brand-kit', prompt: body.prompt, userId: body.userId, spaceId: body.spaceId, metadata: { brandName: body.brandName, colors: body.colors, style: body.style } });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Brand kit generation failed' }, { status: 500 });
  }
}
