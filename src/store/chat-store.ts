import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  images?: string[]
  timestamp: number
  isLoading?: boolean
}

export interface ChatState {
  messages: ChatMessage[]
  isGenerating: boolean
  generatingOperations: Set<string>

  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  removeMessage: (id: string) => void
  clearMessages: () => void
  setIsGenerating: (generating: boolean) => void
  startOperation: (operationId: string) => void
  endOperation: (operationId: string) => void
  isOperationRunning: (operationId?: string) => boolean
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isGenerating: false,
  generatingOperations: new Set<string>(),

  addMessage: (message) => {
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const newMessage: ChatMessage = {
      ...message,
      id,
      timestamp: Date.now(),
    }
    set((state) => ({ messages: [...state.messages, newMessage] }))
    return id
  },

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),

  clearMessages: () => set({ messages: [] }),
  
  setIsGenerating: (generating) => set({ isGenerating: generating }),

  startOperation: (operationId) => {
    const ops = new Set(get().generatingOperations)
    ops.add(operationId)
    set({ generatingOperations: ops, isGenerating: true })
  },

  endOperation: (operationId) => {
    const ops = new Set(get().generatingOperations)
    ops.delete(operationId)
    set({ generatingOperations: ops, isGenerating: ops.size > 0 })
  },

  isOperationRunning: (operationId) => {
    const ops = get().generatingOperations
    if (operationId) return ops.has(operationId)
    return ops.size > 0
  },
}))
