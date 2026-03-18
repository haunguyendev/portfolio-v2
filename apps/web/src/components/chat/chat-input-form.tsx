'use client'

import { Send } from 'lucide-react'
import type { ChangeEvent, FormEvent } from 'react'

export function ChatInputForm({
  input,
  onChange,
  onSubmit,
  isLoading,
}: {
  input: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: FormEvent) => void
  isLoading: boolean
}) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 border-t p-3">
      <input
        value={input}
        onChange={onChange}
        placeholder="Ask me about Kane..."
        disabled={isLoading}
        maxLength={500}
        className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
        aria-label="Chat message input"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  )
}
