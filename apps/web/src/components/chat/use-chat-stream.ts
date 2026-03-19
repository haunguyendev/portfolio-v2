'use client'

import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

/** Chat API goes through Next.js rewrite → backend, so use relative URL */

/**
 * Lightweight chat hook that parses Vercel AI SDK Data Stream Protocol.
 * Format: `0:"text"\n` for text deltas, `d:{...}\n` for finish, `e:{...}\n` for errors.
 */
export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const idCounter = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
  }, [])

  const sendMessage = useCallback(
    async (text: string, provider?: string) => {
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

      // Capture current messages before state update for the API call
      let currentMessages: ChatMessage[] = []
      setMessages((prev) => {
        currentMessages = prev
        return [...prev, userMsg, assistantMsg]
      })
      setIsLoading(true)
      setError(null)

      // Abort any previous in-flight request
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      try {
        const allMessages = [...currentMessages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: allMessages, provider }),
          signal: abortRef.current.signal,
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

            if (line.startsWith('0:')) {
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
              try {
                const err = JSON.parse(line.slice(2)) as { message: string }
                throw new Error(err.message)
              } catch (e) {
                if (e instanceof Error) throw e
              }
            }
          }
        }
      } catch (err) {
        // Ignore abort errors (user-initiated cancellation)
        if (err instanceof DOMException && err.name === 'AbortError') return

        setError(err instanceof Error ? err : new Error('Unknown error'))
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
    [isLoading],
  )

  const clearMessages = useCallback(() => {
    stop()
    setMessages([])
    setError(null)
  }, [stop])

  return { messages, isLoading, error, sendMessage, clearMessages, stop }
}
