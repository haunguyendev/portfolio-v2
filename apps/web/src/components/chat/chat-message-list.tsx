'use client'

import { useEffect, useRef } from 'react'
import type { ChatMessage } from './use-chat-stream'
import { ChatMessageBubble } from './chat-message-bubble'

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
        <div className="flex items-center gap-1 px-3 text-sm text-muted-foreground">
          <span className="animate-pulse">Thinking...</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
