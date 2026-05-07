import SpaceDetail from '@/components/spaces/SpaceDetail';

export const metadata = {
  title: 'Espacio | Tablero',
  description: 'Detalle del espacio creativo',
};

export default function SpaceDetailPage({ params }: { params: { id: string } }) {
  return <SpaceDetail spaceId={params.id} />;
}
