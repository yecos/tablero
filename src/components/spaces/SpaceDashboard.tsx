'use client';
import { useState, useEffect } from 'react';
import SpaceCard from './SpaceCard';

interface Space { id: string; name: string; description?: string; icon?: string; color?: string; designs?: any[] }

export default function SpaceDashboard() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    fetch('/api/spaces').then(r => r.json()).then(data => { setSpaces(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const createSpace = async () => {
    if (!newName.trim()) return;
    const res = await fetch('/api/spaces', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, description: newDesc }) });
    const space = await res.json();
    setSpaces([space, ...spaces]);
    setShowNew(false); setNewName(''); setNewDesc('');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mis Espacios</h1>
            <p className="text-white/50 mt-1">Gestiona tus proyectos creativos con IA</p>
          </div>
          <button onClick={() => setShowNew(true)} className="rounded-xl bg-purple-600 px-6 py-3 font-medium hover:bg-purple-500 transition-colors">+ Nuevo Espacio</button>
        </div>
        {showNew && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <input type="text" placeholder="Nombre del espacio" value={newName} onChange={e => setNewName(e.target.value)} className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-purple-500 mb-3" />
            <textarea placeholder="Descripción (opcional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-purple-500 mb-3 resize-none" rows={2} />
            <div className="flex gap-3">
              <button onClick={createSpace} className="rounded-lg bg-purple-600 px-4 py-2 text-sm hover:bg-purple-500">Crear</button>
              <button onClick={() => setShowNew(false)} className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20">Cancelar</button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map(space => <SpaceCard key={space.id} id={space.id} name={space.name} description={space.description} icon={space.icon} color={space.color} designCount={space.designs?.length || 0} />)}
        </div>
        {spaces.length === 0 && !showNew && (
          <div className="text-center py-20"><p className="text-6xl mb-4">🎨</p><h3 className="text-xl font-semibold mb-2">Crea tu primer espacio</h3><p className="text-white/50 mb-6">Los espacios organizan tus proyectos creativos</p><button onClick={() => setShowNew(true)} className="rounded-xl bg-purple-600 px-6 py-3 font-medium hover:bg-purple-500">Crear Espacio</button></div>
        )}
      </div>
    </div>
  );
}
