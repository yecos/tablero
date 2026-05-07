'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader2, Send, Image, MessageSquare, Film, Music, ZoomIn, Box, Tag, X, Plus, Trash2, Download, ChevronDown } from 'lucide-react';
import { AI_MODES } from '@/lib/tablero';
import { cn } from '@/lib/utils';

// ---- Types ----
interface AINode {
  id: string;
  mode: string;
  icon: string;
  name: string;
  status: 'idle' | 'running' | 'done' | 'error';
  result?: { url?: string; text?: string };
  prompt?: string;
  error?: string;
}

interface DesignItem {
  id: string;
  title: string;
  type: string;
  imageUrl?: string;
  prompt?: string;
  createdAt: string;
}

// ---- Node Component ----
function AINodeCard({ node, onRun, onRemove }: { node: AINode; onRun: (id: string, prompt: string) => void; onRemove: (id: string) => void }) {
  const [prompt, setPrompt] = useState(node.prompt || '');
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={cn(
      'rounded-xl border transition-all',
      node.status === 'running' ? 'border-purple-500/50 bg-purple-500/5 shadow-lg shadow-purple-500/10' :
      node.status === 'done' ? 'border-emerald-500/30 bg-emerald-500/5' :
      node.status === 'error' ? 'border-red-500/30 bg-red-500/5' :
      'border-white/10 bg-white/[0.03]'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{node.icon}</span>
          <span className="text-sm font-medium text-white">{node.name}</span>
          {node.status === 'running' && <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />}
          {node.status === 'done' && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Listo</span>}
          {node.status === 'error' && <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Error</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onRemove(node.id); }} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-red-400 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          <ChevronDown className={cn('w-4 h-4 text-white/30 transition-transform', expanded && 'rotate-180')} />
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Describe qué quieres ${node.name.toLowerCase()}...`}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-purple-500/40 resize-none"
            rows={2}
            disabled={node.status === 'running'}
          />
          <button
            onClick={() => onRun(node.id, prompt)}
            disabled={!prompt.trim() || node.status === 'running'}
            className={cn(
              'w-full rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center justify-center gap-2',
              prompt.trim() && node.status !== 'running'
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            )}
          >
            {node.status === 'running' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Ejecutar</>
            )}
          </button>

          {/* Result */}
          {node.result?.url && (
            <div className="rounded-lg overflow-hidden border border-white/10">
              <img src={node.result.url} alt="Resultado" className="w-full h-auto" />
            </div>
          )}
          {node.result?.text && (
            <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white/70 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {node.result.text}
            </div>
          )}
          {node.error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300">
              {node.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Main Component ----
export default function SpaceDetail({ spaceId }: { spaceId: string }) {
  const [space, setSpace] = useState<{ id: string; name: string; icon: string; description?: string } | null>(null);
  const [designs, setDesigns] = useState<DesignItem[]>([]);
  const [nodes, setNodes] = useState<AINode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'nodes' | 'gallery'>('nodes');
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Close add menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setShowAddMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch space data
  useEffect(() => {
    async function load() {
      try {
        const [spacesRes, designsRes] = await Promise.all([
          fetch('/api/spaces'),
          fetch(`/api/spaces/${spaceId}/designs`),
        ]);
        const spaces = await spacesRes.json();
        const currentSpace = spaces.find((s: any) => s.id === spaceId);
        if (currentSpace) setSpace({ id: currentSpace.id, name: currentSpace.name, icon: currentSpace.icon || '🎨', description: currentSpace.description });
        const designsData = await designsRes.json();
        setDesigns(Array.isArray(designsData) ? designsData : []);
      } catch (e) {
        console.error('Failed to load space:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [spaceId]);

  // Add AI node
  const addNode = (modeId: string) => {
    const mode = AI_MODES.find(m => m.id === modeId);
    if (!mode) return;
    const newNode: AINode = {
      id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      mode: mode.id,
      icon: mode.icon,
      name: mode.name,
      status: 'idle',
    };
    setNodes(prev => [...prev, newNode]);
    setShowAddMenu(false);
  };

  // Remove node
  const removeNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  // Run AI node
  const runNode = useCallback(async (nodeId: string, prompt: string) => {
    if (!prompt.trim()) return;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'running' as const, prompt, error: undefined, result: undefined } : n));

    try {
      const endpointMap: Record<string, string> = {
        'image': '/api/generate-image',
        'chat': '/api/chat',
        'video': '/api/generate-video',
        'audio': '/api/generate-audio',
        'upscale': '/api/upscale',
        'image-to-3d': '/api/image-to-3d',
        'brand-kit': '/api/brand-kit',
      };

      const endpoint = endpointMap[node.mode] || '/api/chat';
      const body: Record<string, unknown> = { prompt };

      if (node.mode === 'chat') body.message = prompt;
      if (node.mode === 'image') { body.width = 1024; body.height = 1024; }
      if (node.mode === 'upscale' || node.mode === 'image-to-3d') body.image = prompt;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, spaceId }),
      });

      const data = await res.json();

      if (data.success) {
        const result = {
          url: data.data?.url || data.imageUrl,
          text: data.data?.text || data.text || data.reply,
        };

        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'done' as const, result } : n));

        // Save as design in this space
        if (result.url || result.text) {
          try {
            await fetch(`/api/spaces/${spaceId}/designs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: `${node.name} — ${prompt.slice(0, 40)}`,
                type: node.mode,
                prompt,
                imageUrl: result.url,
              }),
            });
            // Refresh designs
            const designsRes = await fetch(`/api/spaces/${spaceId}/designs`);
            const designsData = await designsRes.json();
            if (Array.isArray(designsData)) setDesigns(designsData);
          } catch (e) {
            console.error('Failed to save design:', e);
          }
        }
      } else {
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'error' as const, error: data.error || 'Error desconocido' } : n));
      }
    } catch (error) {
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'error' as const, error: 'Error de conexión' } : n));
    }
  }, [nodes, spaceId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
      <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!space) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] text-white/50">
      <p className="text-4xl mb-4">🚫</p>
      <h3 className="text-lg font-semibold text-white">Espacio no encontrado</h3>
      <Link href="/spaces" className="mt-4 text-purple-400 hover:text-purple-300 text-sm">← Volver a Espacios</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/spaces" className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{space.icon}</span>
              <div>
                <h1 className="text-lg font-semibold">{space.name}</h1>
                {space.description && <p className="text-xs text-white/40">{space.description}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switcher */}
            <div className="flex bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('nodes')}
                className={cn('px-3 py-1.5 text-xs rounded-md transition-all', activeTab === 'nodes' ? 'bg-purple-600 text-white' : 'text-white/50 hover:text-white')}
              >
                Nodos IA
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={cn('px-3 py-1.5 text-xs rounded-md transition-all', activeTab === 'gallery' ? 'bg-purple-600 text-white' : 'text-white/50 hover:text-white')}
              >
                Galería ({designs.length})
              </button>
            </div>

            {/* Add Node button */}
            {activeTab === 'nodes' && (
              <div className="relative" ref={addMenuRef}>
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Nodo
                </button>

                {showAddMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a2e] border border-white/10 rounded-xl p-2 shadow-2xl z-50">
                    {AI_MODES.map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => addNode(mode.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                      >
                        <span className="text-lg">{mode.icon}</span>
                        <div>
                          <div className="text-sm text-white">{mode.name}</div>
                          <div className="text-[10px] text-white/40">{mode.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {activeTab === 'nodes' && (
          <>
            {nodes.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Agrega nodos de IA</h2>
                <p className="text-white/40 text-sm text-center max-w-md mb-6">
                  Los nodos son herramientas de IA que ejecutas dentro de tu espacio.
                  Agrega generadores de imagen, chat, video, audio y más.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-2xl w-full">
                  {AI_MODES.map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => addNode(mode.id)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">{mode.icon}</span>
                      <span className="text-xs text-white/60 group-hover:text-white transition-colors">{mode.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Nodes grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {nodes.map(node => (
                  <AINodeCard key={node.id} node={node} onRun={runNode} onRemove={removeNode} />
                ))}

                {/* Add more button */}
                <button
                  onClick={() => setShowAddMenu(true)}
                  className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all min-h-[180px] group"
                >
                  <Plus className="w-8 h-8 text-white/20 group-hover:text-purple-400 transition-colors" />
                  <span className="text-sm text-white/30 group-hover:text-purple-300 transition-colors">Agregar Nodo</span>
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'gallery' && (
          <>
            {designs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-4xl mb-4">✨</p>
                <h3 className="text-lg font-semibold mb-2">Sin diseños aún</h3>
                <p className="text-white/40 text-sm">Ejecuta los nodos de IA para crear tu primer diseño</p>
                <button onClick={() => setActiveTab('nodes')} className="mt-4 text-purple-400 hover:text-purple-300 text-sm">← Ir a Nodos IA</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {designs.map(design => (
                  <div key={design.id} className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-all hover:border-white/20">
                    {design.imageUrl ? (
                      <div className="aspect-square bg-white/5 overflow-hidden">
                        <img src={design.imageUrl} alt={design.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-white/5 text-4xl">🎨</div>
                    )}
                    <div className="p-3">
                      <h3 className="text-sm font-medium truncate">{design.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">{design.type}</p>
                        {design.imageUrl && (
                          <a href={design.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-purple-400 hover:text-purple-300">
                            <Download className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
