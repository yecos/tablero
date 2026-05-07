import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const templates = [
  { name: 'Generador de Imágenes', description: 'Crea imágenes impresionantes con IA', icon: '🎨', category: 'image', prompt: 'Crear una imagen de', mode: 'image', featured: true },
  { name: 'Asistente de Chat', description: 'Conversa con inteligencia artificial', icon: '💬', category: 'chat', prompt: 'Ayúdame con', mode: 'chat', featured: true },
  { name: 'Generador de Video', description: 'Produce videos con IA', icon: '🎬', category: 'video', prompt: 'Crear un video de', mode: 'video', featured: true },
  { name: 'Estudio de Audio', description: 'Genera audio y música con IA', icon: '🎵', category: 'audio', prompt: 'Crear audio de', mode: 'audio', featured: false },
  { name: 'Escalador de Imágenes', description: 'Mejora la resolución de tus imágenes', icon: '🔍', category: 'upscale', prompt: 'Mejorar resolución de', mode: 'upscale', featured: false },
  { name: 'Conversor 3D', description: 'Convierte imágenes a modelos 3D', icon: '🧊', category: '3d', prompt: 'Convertir a 3D', mode: 'image-to-3d', featured: false },
  { name: 'Kit de Marca', description: 'Genera identidad visual para tu marca', icon: '🏷️', category: 'brand', prompt: 'Crear kit de marca para', mode: 'brand-kit', featured: true },
  { name: 'Diseño de Espacios', description: 'Crea diseños para espacios creativos', icon: '🏠', category: 'space', prompt: 'Diseñar espacio', mode: 'image', featured: false },
];

async function main() {
  console.log('Seeding templates...');
  for (const t of templates) {
    await prisma.template.upsert({ where: { id: t.name }, update: t, create: t });
  }
  console.log('Seeding complete!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
