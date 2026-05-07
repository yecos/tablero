import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/templates - List all templates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    const where: any = {}
    if (mode) where.mode = mode
    if (category) where.category = category
    if (featured === 'true') where.featured = true

    const templates = await prisma.template.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('[templates] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST /api/templates - Create a template
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, icon, category, prompt, mode, featured } = body

    if (!name || !prompt || !mode) {
      return NextResponse.json({ error: 'name, prompt, and mode are required' }, { status: 400 })
    }

    const template = await prisma.template.create({
      data: {
        name,
        description: description || '',
        icon: icon || '✨',
        category: category || 'general',
        prompt,
        mode,
        featured: featured || false,
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('[templates] POST error:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
