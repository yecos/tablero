'use client'

import { useEffect } from 'react'
import { Toolbar } from './toolbar'
import { LayersPanel } from './layers-panel'
import { CanvasArea } from './canvas-area'
import { ChatSidebar } from './chat-sidebar'
import { useDesignStore } from '@/store/design-store'

interface DesignWorkspaceProps {
  onClose: () => void
}

export function DesignWorkspace({ onClose }: DesignWorkspaceProps) {
  const { leftPanelOpen, chatSidebarOpen } = useDesignStore()

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
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col animate-in fade-in duration-200">
      {/* Toolbar */}
      <Toolbar onClose={onClose} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        {leftPanelOpen && <LayersPanel />}

        {/* Canvas */}
        <CanvasArea />

        {/* Chat Sidebar */}
        {chatSidebarOpen && <ChatSidebar onClose={() => useDesignStore.getState().setChatSidebarOpen(false)} />}
      </div>
    </div>
  )
}
