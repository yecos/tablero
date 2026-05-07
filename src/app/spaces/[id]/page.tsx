import SpaceDetail from '@/components/spaces/SpaceDetail';

export const metadata = {
  title: 'Espacio | Tablero',
  description: 'Espacio creativo con IA',
};

export default async function SpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SpaceDetail spaceId={id} />;
}
