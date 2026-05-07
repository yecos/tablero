'use client'

import { useState, useEffect } from 'react'
import { AICanvas } from '@/components/canvas/AICanvas'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SpaceDetail({ spaceId }: { spaceId: string }) {
  const [space, setSpace] = useState<{ id: string; name: string; icon: string; description?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/spaces/${spaceId}`)
        if (res.ok) {
          const data = await res.json()
          setSpace({ id: data.id, name: data.name, icon: data.icon || '🎨', description: data.description })
        }
      } catch (e) {
        console.error('Failed to load space:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [spaceId])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  )

  if (!space) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] text-white/50">
      <p className="text-4xl mb-4">🚫</p>
      <h3 className="text-lg font-semibold text-white">Espacio no encontrado</h3>
      <Link href="/spaces" className="mt-4 text-purple-400 hover:text-purple-300 text-sm">← Volver a Espacios</Link>
    </div>
  )

  return <AICanvas spaceId={spaceId} spaceName={space.name} />
}
