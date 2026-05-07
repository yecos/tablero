import ToolWorkspace from '@/components/tools/ToolWorkspace';

export async function generateMetadata({ params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = await params;
  const names: Record<string, string> = {
    image: 'Generador de Imágenes',
    video: 'Generador de Video',
    chat: 'Chat IA',
    audio: 'Generador de Audio',
    upscale: 'Mejorar Imagen',
    '3d': 'Convertir a 3D',
    'brand-kit': 'Kit de Marca',
  };
  return {
    title: `${names[toolId] || 'Herramienta'} | Tablero`,
    description: `Herramienta de IA: ${names[toolId] || toolId}`,
  };
}

export default function ToolPage({ params }: { params: Promise<{ toolId: string }> }) {
  // We need to unwrap the Promise in a client component
  return <ToolPageClient params={params} />;
}

import ToolPageClient from './ToolPageClient';
