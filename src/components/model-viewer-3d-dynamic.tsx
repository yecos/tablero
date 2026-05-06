'use client'

import dynamic from 'next/dynamic'

export const DynamicModelViewer3D = dynamic(
  () => import('./model-viewer-3d').then((mod) => mod.ModelViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#12121a]/50 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500">Loading 3D Viewer...</span>
        </div>
      </div>
    ),
  }
)
