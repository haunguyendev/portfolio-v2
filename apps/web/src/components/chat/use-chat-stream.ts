'use client'

import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

/**
 * Lightweight chat hook that parses Vercel AI SDK Data Stream Protocol.
 * Format: `0:"text"\n` for text deltas, `d:{...}\n` for finish, `e:{...}\n` for errors.
 */
export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const idCounter = useRef(0)

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMsg: ChatMessage = {
        id: String(++idCounter.current),
        role: 'user',
        content: text,
      }

      const assistantMsg: ChatMessage = {
        id: String(++idCounter.current),
        role: 'assistant',
        content: '',
      }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setIsLoading(true)
      setError(null)

      try {
        const allMessages = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const res = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: allMessages }),
        })

        if (!res.ok) {
          throw new Error(
            res.status === 429
              ? '429: Too many requests'
              : `Request failed: ${res.status}`,
          )
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.trim()) continue

            // Parse Vercel AI SDK Data Stream Protocol
            if (line.startsWith('0:')) {
              // Text delta: 0:"token text"
              try {
                const token = JSON.parse(line.slice(2)) as string
                setMessages((prev) => {
                  const updated = [...prev]
                  const last = updated[updated.length - 1]
                  if (last?.role === 'assistant') {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + token,
                    }
                  }
                  return updated
                })
              } catch {
                // Skip malformed tokens
              }
            } else if (line.startsWith('e:')) {
              // Error: e:{"message":"..."}
              try {
                const err = JSON.parse(line.slice(2)) as { message: string }
                throw new Error(err.message)
              } catch (e) {
                if (e instanceof Error) throw e
              }
            }
            // d: (finish) — just ignore, stream ends naturally
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        // Remove empty assistant message on error
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last?.role === 'assistant' && !last.content) {
            return prev.slice(0, -1)
          }
          return prev
        })
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, clearMessages }
}
