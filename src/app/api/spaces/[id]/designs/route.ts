import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const designs = await prisma.design.findMany({ where: { spaceId: params.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(designs);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const design = await prisma.design.create({ data: { title: body.title, type: body.type, prompt: body.prompt, imageUrl: body.imageUrl, spaceId: params.id } });
  return NextResponse.json(design, { status: 201 });
}
