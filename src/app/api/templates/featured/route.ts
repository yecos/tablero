import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/templates/featured - Get featured templates grouped by mode
export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      where: { featured: true },
      orderBy: { createdAt: 'desc' },
    })

    // Group by mode
    const grouped: Record<string, typeof templates> = {}
    for (const t of templates) {
      if (!grouped[t.mode]) grouped[t.mode] = []
      grouped[t.mode].push(t)
    }

    return NextResponse.json({ templates, grouped })
  } catch (error) {
    console.error('[templates/featured] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch featured templates' }, { status: 500 })
  }
}
