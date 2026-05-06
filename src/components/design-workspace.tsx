'use client'

import { useEffect, useState } from 'react'
import { Toolbar } from './toolbar'
import { LayersPanel } from './layers-panel'
import { CanvasArea } from './canvas-area'
import { ChatSidebar } from './chat-sidebar'
import { ImageSplitPanel } from './image-split-panel'
import { WorkflowCanvas } from './workflow/workflow-canvas'
import { useDesignStore } from '@/store/design-store'
import { cn } from '@/lib/utils'

interface DesignWorkspaceProps {
  onClose: () => void
}

type WorkspaceMode = 'design' | 'workflow'

export function DesignWorkspace({ onClose }: DesignWorkspaceProps) {
  const { leftPanelOpen, chatSidebarOpen, imageSplit } = useDesignStore()
  const [mode, setMode] = useState<WorkspaceMode>('workflow')

  // Prevent body scroll when workspace is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const store = useDesignStore.getState()
        // Cancel connection creation first if active
        if (store.connectingFrom) {
          store.setConnectingFrom(null)
          return
        }
        // Close split panel if open
        if (store.imageSplit.showSplitPanel) {
          store.closeSplitPanel()
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col animate-in fade-in duration-200">
      {/* Toolbar */}
      <Toolbar onClose={onClose} />

      {/* Mode Toggle */}
      <div className="h-10 bg-[#0d0d14] border-b border-white/5 flex items-center px-4 gap-2">
        <div className="flex items-center gap-1 bg-[#0a0a0f] rounded-lg p-0.5 border border-white/5">
          <button
            onClick={() => setMode('workflow')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
              mode === 'workflow'
                ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border border-purple-500/30'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="5" cy="6" r="3" />
              <circle cx="19" cy="6" r="3" />
              <circle cx="12" cy="18" r="3" />
              <line x1="7.5" y1="7.5" x2="10" y2="16" />
              <line x1="16.5" y1="7.5" x2="14" y2="16" />
              <line x1="8" y1="6" x2="16" y2="6" />
            </svg>
            Workflow
          </button>
          <button
            onClick={() => setMode('design')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
              mode === 'design'
                ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border border-purple-500/30'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="9" x2="9" y2="21" />
            </svg>
            Design Canvas
          </button>
        </div>

        <span className="text-[10px] text-slate-600 ml-2">
          {mode === 'workflow'
            ? 'Conecta nodos de IA para crear flujos de trabajo'
            : 'Canvas de diseño con elementos'}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {mode === 'design' ? (
          <>
            {/* Left Panel */}
            {leftPanelOpen && <LayersPanel />}

            {/* Canvas */}
            <CanvasArea />

            {/* Image Split Panel */}
            <ImageSplitPanel />

            {/* Chat Sidebar */}
            {chatSidebarOpen && !imageSplit.showSplitPanel && <ChatSidebar onClose={() => useDesignStore.getState().setChatSidebarOpen(false)} />}
          </>
        ) : (
          <WorkflowCanvas />
        )}
      </div>
    </div>
  )
}
