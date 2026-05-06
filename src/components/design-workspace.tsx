'use client'

import { useEffect } from 'react'
import { Toolbar } from './toolbar'
import { LayersPanel } from './layers-panel'
import { CanvasArea } from './canvas-area'
import { ChatSidebar } from './chat-sidebar'
import { ImageSplitPanel } from './image-split-panel'
import { useDesignStore } from '@/store/design-store'

interface DesignWorkspaceProps {
  onClose: () => void
}

export function DesignWorkspace({ onClose }: DesignWorkspaceProps) {
  const { leftPanelOpen, chatSidebarOpen, imageSplit } = useDesignStore()

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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel */}
        {leftPanelOpen && <LayersPanel />}

        {/* Canvas */}
        <CanvasArea />

        {/* Image Split Panel (overlays the right side) */}
        <ImageSplitPanel />

        {/* Chat Sidebar */}
        {chatSidebarOpen && !imageSplit.showSplitPanel && <ChatSidebar onClose={() => useDesignStore.getState().setChatSidebarOpen(false)} />}
      </div>
    </div>
  )
}
