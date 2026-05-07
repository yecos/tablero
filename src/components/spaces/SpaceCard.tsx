'use client';
import Link from 'next/link';

interface SpaceCardProps {
  id: string; name: string; description?: string;
  icon?: string; color?: string; designCount?: number;
}

export default function SpaceCard({ id, name, description, icon = '🎨', color = '#6366f1', designCount = 0 }: SpaceCardProps) {
  return (
    <Link href={`/spaces/${id}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04] hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${color}20` }}>{icon}</div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">{designCount} diseños</span>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">{name}</h3>
        {description && <p className="mt-1 text-sm text-white/50 line-clamp-2">{description}</p>}
        <div className="mt-4 flex items-center text-xs text-white/30 group-hover:text-white/50 transition-colors">
          <span>Abrir espacio</span>
          <svg className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>
    </Link>
  );
}
