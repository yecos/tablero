import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET /api/designs - List all designs
export async function GET() {
  try {
    const designs = await prisma.design.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return NextResponse.json({ designs })
  } catch (error) {
    console.error('Failed to fetch designs:', error)
    return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 })
  }
}

// POST /api/designs - Create a new design
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, elements, edges, brandKit } = body

    const design = await prisma.design.create({
      data: {
        name: name || 'Untitled Design',
        elements: JSON.stringify(elements || []),
        edges: JSON.stringify(edges || []),
        brandKit: brandKit ? JSON.stringify(brandKit) : null,
      },
    })

    return NextResponse.json({ design }, { status: 201 })
  } catch (error) {
    console.error('Failed to create design:', error)
    return NextResponse.json({ error: 'Failed to create design' }, { status: 500 })
  }
}
