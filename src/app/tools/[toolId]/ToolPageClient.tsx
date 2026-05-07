'use client';

import ToolWorkspace from '@/components/tools/ToolWorkspace';
import { use } from 'react';

export default function ToolPageClient({ params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = use(params);
  return <ToolWorkspace toolId={toolId} />;
}
