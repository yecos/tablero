import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Gracefully handle missing DATABASE_URL (e.g., Vercel preview without DB configured)
function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.warn('[db] No DATABASE_URL configured — database features will be unavailable')
    process.env.DATABASE_URL = 'file:./fallback.db'
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
