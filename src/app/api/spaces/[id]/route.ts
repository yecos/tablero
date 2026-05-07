import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const space = await prisma.space.findUnique({
      where: { id },
      include: { designs: { orderBy: { createdAt: 'desc' } } },
    });
    if (!space) return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    return NextResponse.json(space);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch space' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const space = await prisma.space.update({
      where: { id },
      data: { name: body.name, description: body.description, icon: body.icon, color: body.color },
    });
    return NextResponse.json(space);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update space' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.space.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete space' }, { status: 500 });
  }
}
