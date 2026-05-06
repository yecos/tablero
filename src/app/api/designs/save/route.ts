import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/designs/save - Save current design (upsert)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name, elements, edges, brandKit } = body

    if (!id) {
      return NextResponse.json({ error: 'Design ID is required' }, { status: 400 })
    }

    const design = await prisma.design.upsert({
      where: { id },
      update: {
        name: name || 'Untitled Design',
        elements: JSON.stringify(elements || []),
        edges: JSON.stringify(edges || []),
        brandKit: brandKit ? JSON.stringify(brandKit) : null,
      },
      create: {
        id,
        name: name || 'Untitled Design',
        elements: JSON.stringify(elements || []),
        edges: JSON.stringify(edges || []),
        brandKit: brandKit ? JSON.stringify(brandKit) : null,
      },
    })

    return NextResponse.json({ design })
  } catch (error) {
    console.error('Failed to save design:', error)
    return NextResponse.json({ error: 'Failed to save design' }, { status: 500 })
  }
}
