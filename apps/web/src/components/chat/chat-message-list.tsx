'use client'

import { useEffect, useRef } from 'react'
import type { ChatMessage } from './use-chat-stream'
import { ChatMessageBubble } from './chat-message-bubble'
import { Sparkles } from 'lucide-react'

export function ChatMessageList({
  messages,
  isLoading,
}: {
  messages: ChatMessage[]
  isLoading: boolean
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col gap-3 p-4">
      {messages.map((msg) => (
        <ChatMessageBubble key={msg.id} message={msg} />
      ))}
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
