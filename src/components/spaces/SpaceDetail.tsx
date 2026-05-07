'use client';
import { useState, useEffect } from 'react';

interface Design { id: string; title: string; type: string; imageUrl?: string; prompt?: string; createdAt: string }
interface Space { id: string; name: string; description?: string; icon?: string; designs: Design[] }

export default function SpaceDetail({ spaceId }: { spaceId: string }) {
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/spaces/${spaceId}/designs`).then(r => r.json()).then(designs => {
      setSpace({ id: spaceId, name: 'Espacio', designs });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [spaceId]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" /></div>;
  if (!space) return <div className="text-center py-20 text-white/50">Espacio no encontrado</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">{space.icon} {space.name}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {space.designs.map(design => (
            <div key={design.id} className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-white/20">
              {design.imageUrl ? <div className="aspect-square bg-white/5"><img src={design.imageUrl} alt={design.title} className="h-full w-full object-cover" /></div>
                : <div className="flex aspect-square items-center justify-center bg-white/5 text-4xl">🎨</div>}
              <div className="p-4"><h3 className="font-medium truncate">{design.title}</h3><p className="text-xs text-white/40 mt-1">{design.type}</p></div>
            </div>
          ))}
        </div>
        {space.designs.length === 0 && <div className="text-center py-20"><p className="text-4xl mb-4">✨</p><h3 className="text-lg font-semibold">Sin diseños aún</h3><p className="text-white/50 mt-1">Usa las herramientas de IA para crear tu primer diseño</p></div>}
      </div>
    </div>
  );
}
