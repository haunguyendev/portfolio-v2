'use client'

import { Sparkles } from 'lucide-react'

const SUGGESTED_QUESTIONS = [
  "What projects has Kane built?",
  "What's Kane's tech stack?",
  "Tell me about Kane's work experience",
]

export function ChatSuggestedQuestions({
  onSelect,
}: {
  onSelect: (question: string) => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <Sparkles className="h-8 w-8 text-primary" />
      <div>
        <h3 className="text-sm font-semibold">Hi! I&apos;m Kane&apos;s AI assistant</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Ask me anything about Kane&apos;s projects, skills, or experience.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="rounded-lg border px-3 py-2 text-left text-xs transition-colors hover:bg-muted"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
