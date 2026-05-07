export const APP_NAME = 'Tablero';
export const APP_DESCRIPTION = 'Plataforma de creatividad con IA';
export const APP_VERSION = '2.0.0';

export const AI_MODES = [
  { id: 'image', name: 'Generar Imagen', icon: '🎨', description: 'Crea imágenes con IA' },
  { id: 'chat', name: 'Chat IA', icon: '💬', description: 'Asistente inteligente' },
  { id: 'video', name: 'Generar Video', icon: '🎬', description: 'Videos con IA' },
  { id: 'audio', name: 'Generar Audio', icon: '🎵', description: 'Audio y música' },
  { id: 'upscale', name: 'Mejorar Imagen', icon: '🔍', description: 'Sube la resolución' },
  { id: 'image-to-3d', name: 'Convertir a 3D', icon: '🧊', description: 'Modelos 3D' },
  { id: 'brand-kit', name: 'Kit de Marca', icon: '🏷️', description: 'Identidad visual' },
] as const;
