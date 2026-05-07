import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const designs = await prisma.design.findMany({
      where: { spaceId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(designs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const design = await prisma.design.create({
      data: {
        title: body.title,
        type: body.type,
        prompt: body.prompt,
        imageUrl: body.imageUrl,
        spaceId: id,
      },
    });
    return NextResponse.json(design, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create design' }, { status: 500 });
  }
}
