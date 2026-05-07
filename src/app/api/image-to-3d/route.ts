import { NextRequest, NextResponse } from 'next/server';
import { processRequest } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await processRequest({ mode: 'image-to-3d', prompt: body.prompt || '3d conversion', image: body.image, userId: body.userId, spaceId: body.spaceId });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ success: false, error: '3D conversion failed' }, { status: 500 });
  }
}
