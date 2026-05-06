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

  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  removeMessage: (id: string) => void
  clearMessages: () => void
  setIsGenerating: (generating: boolean) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isGenerating: false,

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
}))
