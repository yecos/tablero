import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET /api/designs/[id] - Load a specific design
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const design = await prisma.design.findUnique({
      where: { id },
    })

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 })
    }

    // Parse JSON fields back
    const parsed = {
      ...design,
      elements: JSON.parse(design.elements),
      edges: JSON.parse(design.edges),
      brandKit: design.brandKit ? JSON.parse(design.brandKit) : null,
    }

    return NextResponse.json({ design: parsed })
  } catch (error) {
    console.error('Failed to load design:', error)
    return NextResponse.json({ error: 'Failed to load design' }, { status: 500 })
  }
}

// DELETE /api/designs/[id] - Delete a design
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.design.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete design:', error)
    return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 })
  }
}
