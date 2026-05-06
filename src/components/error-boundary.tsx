'use client'

import React from 'react'
import { useDesignStore } from '@/store/design-store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ErrorBoundaryProps {
  children: React.ReactNode
  /** Optional custom fallback rendered instead of the default error card */
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

// ---------------------------------------------------------------------------
// Shared fallback UI helpers
// ---------------------------------------------------------------------------

interface FallbackCardProps {
  title: string
  message: string
  details?: string
  error: Error | null
  onRetry: () => void
  extraActions?: React.ReactNode
}

function FallbackCard({ title, message, details, error, onRetry, extraActions }: FallbackCardProps) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[320px] bg-[#0a0a0f] p-6">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-[#0a0a0f] to-cyan-500/10 p-8 shadow-[0_0_60px_rgba(168,85,247,0.08)]">
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-5 text-center">
          {/* Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 ring-1 ring-purple-500/30">
            <svg
              className="h-7 w-7 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-slate-100">{title}</h2>

          {/* Message */}
          <p className="text-sm leading-relaxed text-slate-400">{message}</p>

          {/* Details hint */}
          {details && <p className="text-xs text-slate-500">{details}</p>}

          {/* Error message */}
          {error && (
            <pre className="max-h-32 w-full overflow-y-auto rounded-lg border border-slate-700/50 bg-slate-900/60 p-3 text-left font-mono text-xs text-red-400/90 scrollbar-thin scrollbar-thumb-slate-700">
              {error.message}
            </pre>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
                />
              </svg>
              Retry
            </button>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/50 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-700/50 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              Go Home
            </button>

            {extraActions}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ErrorBoundary — generic catch-all
// ---------------------------------------------------------------------------

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught an error:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
    this.setState({ errorInfo })
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <FallbackCard
          title="Something went wrong"
          message="An unexpected error occurred while rendering this component. You can try again or return to the home page."
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// ThreeDErrorBoundary — specialized for Three.js / 3D model viewer
// ---------------------------------------------------------------------------

interface SpecializedBoundaryProps {
  children: React.ReactNode
}

interface SpecializedBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ThreeDErrorBoundary extends React.Component<
  SpecializedBoundaryProps,
  SpecializedBoundaryState
> {
  constructor(props: SpecializedBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<SpecializedBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ThreeDErrorBoundary] 3D rendering error:', error)
    console.error('[ThreeDErrorBoundary] Component stack:', errorInfo.componentStack)
    this.setState({ errorInfo })
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <FallbackCard
          title="3D Rendering Failed"
          message="The 3D model viewer encountered an error and couldn't render properly. This may be caused by an unsupported model format, insufficient GPU resources, or a WebGL issue."
          details="Try using a different image or refresh the page to attempt loading again."
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// CanvasErrorBoundary — specialized for the design canvas
// ---------------------------------------------------------------------------

interface CanvasErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class CanvasErrorBoundary extends React.Component<
  SpecializedBoundaryProps,
  CanvasErrorBoundaryState
> {
  constructor(props: SpecializedBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<CanvasErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[CanvasErrorBoundary] Canvas rendering error:', error)
    console.error('[CanvasErrorBoundary] Component stack:', errorInfo.componentStack)
    this.setState({ errorInfo })
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleClearAndRetry = (): void => {
    useDesignStore.getState().clearCanvas()
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <FallbackCard
          title="Canvas Error"
          message="The design canvas encountered an error and couldn't continue rendering. This may be caused by a corrupted element or an invalid canvas state."
          details="You can retry, or clear the canvas and start fresh."
          error={this.state.error}
          onRetry={this.handleRetry}
          extraActions={
            <button
              onClick={this.handleClearAndRetry}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-sm font-medium text-amber-300 transition-all hover:border-amber-500/60 hover:bg-amber-500/20 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              Clear Canvas &amp; Retry
            </button>
          }
        />
      )
    }

    return this.props.children
  }
}
