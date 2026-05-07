import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const spaces = await prisma.space.findMany({ include: { designs: true }, orderBy: { updatedAt: 'desc' } });
  return NextResponse.json(spaces);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const space = await prisma.space.create({ data: { name: body.name, description: body.description, icon: body.icon || '🎨', color: body.color || '#6366f1', userId: body.userId || 'default' } });
  return NextResponse.json(space, { status: 201 });
}
