'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { X, Sparkles, RotateCcw, ChevronDown } from 'lucide-react'
import { useChatStream } from './use-chat-stream'
import { ChatMessageList } from './chat-message-list'
import { ChatInputForm } from './chat-input-form'
import { ChatSuggestedQuestions } from './chat-suggested-questions'

const MODEL_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'groq', label: 'Groq (Llama)' },
  { value: 'glm', label: 'GLM' },
  { value: 'gemini', label: 'Gemini' },
] as const

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('')
  const [provider, setProvider] = useState<string>('auto')
  const { messages, isLoading, error, sendMessage, clearMessages } = useChatStream()

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input, provider === 'auto' ? undefined : provider)
    setInput('')
  }

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question, provider === 'auto' ? undefined : provider)
  }

  return (
    <div className="mb-4 flex h-[min(500px,80vh)] w-[min(400px,calc(100vw-3rem))] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl md:h-[500px] md:w-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Ask about Kane</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="appearance-none rounded-md border-0 bg-muted py-1 pl-2 pr-6 text-xs text-muted-foreground outline-none hover:text-foreground"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          </div>
          <button
            onClick={clearMessages}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Clear chat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <ChatSuggestedQuestions onSelect={handleSuggestedQuestion} />
        ) : (
          <ChatMessageList messages={messages} isLoading={isLoading} />
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-4 mb-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error.message.includes('429')
            ? 'Too many messages. Please wait a moment and try again.'
            : 'Something went wrong. Please try again.'}
        </div>
      )}

      {/* Input */}
      <ChatInputForm
        input={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
