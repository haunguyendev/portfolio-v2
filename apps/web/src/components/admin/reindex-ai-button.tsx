'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export function ReindexAiButton() {
  const [loading, setLoading] = useState(false)

  const handleReindex = async () => {
    setLoading(true)
    try {
      const sessionRes = await fetch('/api/auth/get-session', {
        credentials: 'include',
      })
      if (!sessionRes.ok) {
        toast.error('Not authenticated')
        return
      }
      const sessionData = await sessionRes.json()
      const token = sessionData?.session?.token
      if (!token) {
        toast.error('No session token')
        return
      }

      const res = await fetch(`${API_URL}/api/chat/reindex`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error(`Failed: ${res.status}`)
      }

      const data = await res.json()
      toast.success(`Re-indexed ${data.chunksIndexed} chunks`)
    } catch (err) {
      toast.error(`Re-index failed: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleReindex}
      disabled={loading}
      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {loading ? 'Re-indexing...' : 'Re-index AI'}
    </button>
  )
}
