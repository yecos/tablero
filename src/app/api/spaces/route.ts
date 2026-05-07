import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const spaces = await prisma.space.findMany({ include: { designs: true }, orderBy: { updatedAt: 'desc' } });
    return NextResponse.json(spaces);
  } catch (error) {
    console.error('[spaces] GET error:', error);
    return NextResponse.json(
      { error: 'Database error. Make sure DATABASE_URL is configured with a PostgreSQL connection string.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const space = await prisma.space.create({
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon || '🎨',
        color: body.color || '#6366f1',
        userId: body.userId || 'default',
      },
    });
    return NextResponse.json(space, { status: 201 });
  } catch (error) {
    console.error('[spaces] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create space. Check database connection.' },
      { status: 500 }
    );
  }
}
