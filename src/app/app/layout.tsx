'use client'

import { WorkspaceSidebar } from '@/components/workspace/sidebar'
import { WorkspaceTopbar } from '@/components/workspace/topbar'
import { WorkspaceRightPanel } from '@/components/workspace/right-panel'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#0a0a0f]">
      {/* Left Sidebar */}
      <WorkspaceSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <WorkspaceTopbar />

        {/* Content area with right panel */}
        <div className="flex-1 flex min-h-0">
          {/* Main Canvas */}
          <main className="flex-1 min-w-0 overflow-auto">
            {children}
          </main>

          {/* Right Panel */}
          <WorkspaceRightPanel />
        </div>
      </div>
    </div>
  )
}
