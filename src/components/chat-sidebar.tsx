'use client'

import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '@/store/chat-store'
import { useDesignStore } from '@/store/design-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Sparkles, Send, Loader2, Image, Palette, PenTool, LayoutTemplate } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'

interface ChatSidebarProps {
  onClose: () => void
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const { messages, isGenerating, addMessage, updateMessage, setIsGenerating, startOperation, endOperation, isOperationRunning } = useChatStore()
  const { addElement, setLeftPanelTab, setLeftPanelOpen, setBrandKit } = useDesignStore()
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const quickActions = [
    { icon: PenTool, label: 'Create Logo', prompt: 'Create a modern, professional logo design' },
    { icon: Image, label: 'Design Poster', prompt: 'Design a stunning event poster' },
    { icon: Palette, label: 'Generate Brand Kit', prompt: 'Generate a complete brand kit' },
    { icon: LayoutTemplate, label: 'Social Media Post', prompt: 'Create a social media post design' },
  ]

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isSending) return

    setInput('')
    setIsSending(true)

    // Add user message
    addMessage({ role: 'user', content: text })

    // Add loading AI message
    const aiMsgId = addMessage({ role: 'assistant', content: '', isLoading: true })
    startOperation('chat')

    try {
      // Build history for context
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      updateMessage(aiMsgId, { content: data.reply, isLoading: false })
    } catch {
      updateMessage(aiMsgId, {
        content: 'Sorry, I encountered an error. Please try again.',
        isLoading: false,
      })
      toast.error('Failed to get AI response')
    } finally {
      endOperation('chat')
      setIsSending(false)
    }
  }

  const generateImage = async (prompt: string) => {
    startOperation('image-gen')
    addMessage({ role: 'user', content: `Generate image: ${prompt}` })
    const aiMsgId = addMessage({ role: 'assistant', content: 'Generating your image... ✨', isLoading: true })
    toast.loading('Generating image...', { id: 'gen-image' })

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size: '1024x1024' }),
      })

      if (!response.ok) throw new Error('Failed to generate image')

      const data = await response.json()

      if (data.imageUrl || data.base64) {
        const imgSrc = data.base64 ? `data:image/png;base64,${data.base64}` : data.imageUrl
        updateMessage(aiMsgId, {
          content: 'Here\'s your generated image! I\'ve added it to the canvas. 🎨',
          images: [imgSrc],
          isLoading: false,
        })

        // Add image element to canvas
        addElement({
          id: `img_${Date.now()}`,
          type: 'image',
          x: 4900 + Math.random() * 200,
          y: 4900 + Math.random() * 200,
          width: 400,
          height: 400,
          rotation: 0,
          content: prompt,
          src: imgSrc,
          selected: false,
          locked: false,
          visible: true,
          opacity: 1,
        })
        toast.success('Image generated and added to canvas', { id: 'gen-image' })
      } else {
        updateMessage(aiMsgId, {
          content: 'I couldn\'t generate an image right now. Please try again.',
          isLoading: false,
        })
        toast.error('Image generation failed', { id: 'gen-image' })
      }
    } catch {
      updateMessage(aiMsgId, {
        content: 'Failed to generate image. Please try again.',
        isLoading: false,
      })
      toast.error('Failed to generate image', { id: 'gen-image' })
    } finally {
      endOperation('image-gen')
    }
  }

  const generateBrandKit = async (description: string) => {
    startOperation('brand-kit')
    addMessage({ role: 'user', content: `Generate brand kit for: ${description}` })
    const aiMsgId = addMessage({ role: 'assistant', content: 'Creating your brand kit... 🎨', isLoading: true })
    toast.loading('Generating brand kit...', { id: 'gen-brandkit' })

    try {
      const response = await fetch('/api/brand-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) throw new Error('Failed to generate brand kit')

      const data = await response.json()
      const kit = data.brandKit

      // Save brand kit to design store
      setBrandKit(kit)

      const brandMessage = `Here's your brand kit for **${kit.brandName}**! 🎨

**Colors:**
${Object.entries(kit.colors || {}).map(([key, val]) => `• ${key}: \`${val}\``).join('\n')}

**Fonts:**
• Heading: ${kit.fonts?.heading || 'Inter'} (${kit.fonts?.headingStyle || ''})
• Body: ${kit.fonts?.body || 'Inter'} (${kit.fonts?.bodyStyle || ''})

**Brand Voice:**
• Tone: ${kit.voice?.tone || 'Professional'}
• Personality: ${(kit.voice?.personality || []).join(', ')}
• Keywords: ${(kit.voice?.keywords || []).join(', ')}

**Logo Concept:** ${kit.logoConcept || 'N/A'}

**Tagline:** _"${kit.tagline || 'N/A'}"_`

      updateMessage(aiMsgId, { content: brandMessage, isLoading: false })

      // Switch to brand kit tab
      setLeftPanelTab('brandkit')
      setLeftPanelOpen(true)

      // Add color swatches to canvas as shapes
      const colorEntries = Object.entries(kit.colors || {})
      colorEntries.forEach(([key, color], index) => {
        addElement({
          id: `color_${Date.now()}_${index}`,
          type: 'shape',
          x: 4800 + index * 120,
          y: 5100,
          width: 100,
          height: 100,
          rotation: 0,
          content: `${key}: ${color}`,
          color: color as string,
          selected: false,
          locked: false,
          visible: true,
          opacity: 1,
        })
      })
      toast.success('Brand kit generated!', { id: 'gen-brandkit' })
    } catch {
      updateMessage(aiMsgId, {
        content: 'Failed to generate brand kit. Please try again.',
        isLoading: false,
      })
      toast.error('Failed to generate brand kit', { id: 'gen-brandkit' })
    } finally {
      endOperation('brand-kit')
    }
  }

  const handleQuickAction = (action: { prompt: string; label: string }) => {
    if (action.label === 'Generate Brand Kit') {
      generateBrandKit(action.prompt)
    } else if (action.label === 'Design Poster' || action.label === 'Create Logo' || action.label === 'Social Media Post') {
      generateImage(action.prompt)
    } else {
      sendMessage(action.prompt)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="w-80 bg-[#12121a] border-l border-white/5 flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">AI Design Agent</h3>
              <p className="text-[10px] text-emerald-400">Online</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:text-white hover:bg-white/5 lg:hidden"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-sm font-medium text-white mb-1">Welcome to DesignAI!</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                I&apos;m your AI design agent. Tell me what you want to create, or use a quick action below.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-2',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-6 h-6 shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center text-[10px] mt-1">
                  ✦
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-xl p-3 text-xs leading-relaxed',
                  message.role === 'user'
                    ? 'bg-purple-600/20 border border-purple-500/20 text-purple-100 rounded-tr-none'
                    : 'bg-[#1a1a2e] text-slate-300 rounded-tl-none'
                )}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                    <span className="text-slate-500">Generating...</span>
                  </div>
                ) : (
                  <>
                    {message.role === 'assistant' ? (
                      <div className="chat-markdown prose prose-invert prose-xs max-w-none [&_p]:mb-1 [&_p:last-child]:mb-0 [&_ul]:mb-1 [&_ol]:mb-1 [&_li]:mb-0.5 [&_strong]:text-white [&_em]:text-purple-300 [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded [&_code]:text-purple-300 [&_code]:text-[11px] [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-white [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-white [&_a]:text-cyan-400 [&_a]:underline">
                        <ReactMarkdown
                          components={{
                            a: ({ children, ...props }) => (
                              <a {...props} target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                    {message.images && message.images.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="Generated"
                            className="w-full rounded-lg border border-white/10"
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action)}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:border-purple-500/20 hover:bg-purple-500/5 transition-colors text-xs text-slate-400 hover:text-white"
              >
                <action.icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-white/5" />

      {/* Input */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your design..."
            disabled={isSending || isOperationRunning('chat')}
            className="bg-[#1a1a2e] border-white/5 text-white text-xs placeholder:text-slate-600 focus:border-purple-500/30 focus:ring-purple-500/20"
          />
          <Button
            size="icon"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isSending || isOperationRunning('chat')}
            className="h-9 w-9 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white border-0 shrink-0"
          >
            {isSending || isOperationRunning('chat') ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {/* Inline quick actions */}
        {messages.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <button
              onClick={() => generateImage('A modern logo design')}
              className="text-[10px] px-2 py-1 rounded-md bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white hover:border-purple-500/20 transition-colors"
            >
              + Generate Image
            </button>
            <button
              onClick={() => generateBrandKit('A modern tech brand')}
              className="text-[10px] px-2 py-1 rounded-md bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white hover:border-purple-500/20 transition-colors"
            >
              + Brand Kit
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
