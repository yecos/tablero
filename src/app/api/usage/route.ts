import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/usage - Get API usage stats
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const days = parseInt(searchParams.get('days') || '7')

    const since = new Date()
    since.setDate(since.getDate() - days)

    const where: any = { createdAt: { gte: since } }
    if (userId) where.userId = userId

    // Total usage
    const totalUsage = await prisma.apiUsage.count({ where })

    // Success rate
    const successCount = await prisma.apiUsage.count({ where: { ...where, success: true } })

    // Usage by mode
    const usageByMode = await prisma.apiUsage.groupBy({
      by: ['mode'],
      where,
      _count: { id: true },
      _avg: { duration: true },
    })

    // Usage by provider
    const usageByProvider = await prisma.apiUsage.groupBy({
      by: ['provider'],
      where,
      _count: { id: true },
      _avg: { duration: true },
    })

    // Daily usage (last N days)
    const dailyUsage = await prisma.apiUsage.findMany({
      where,
      select: { createdAt: true, mode: true, success: true, duration: true, provider: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({
      totalUsage,
      successRate: totalUsage > 0 ? successCount / totalUsage : 0,
      usageByMode: usageByMode.map(m => ({ mode: m.mode, count: m._count.id, avgDuration: m._avg.duration })),
      usageByProvider: usageByProvider.map(p => ({ provider: p.provider, count: p._count.id, avgDuration: p._avg.duration })),
      recentUsage: dailyUsage,
      period: { days, since },
    })
  } catch (error) {
    console.error('[usage] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage stats' }, { status: 500 })
  }
}
