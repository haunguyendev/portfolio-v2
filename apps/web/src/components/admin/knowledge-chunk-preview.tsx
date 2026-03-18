'use client'

import { useEffect, useState } from 'react'
import { gql } from 'graphql-request'
import { getAuthenticatedGqlClient } from '@/lib/graphql-client'
import { X, Loader2 } from 'lucide-react'

interface Chunk {
  id: string
  content: string
  metadata: Record<string, unknown>
  sourceType: string
  createdAt: string
}

const CHUNKS_QUERY = gql`
  query KnowledgeSourceChunks($sourceId: ID!) {
    knowledgeSourceChunks(sourceId: $sourceId) {
      id content metadata sourceType createdAt
    }
  }
`

export function KnowledgeChunkPreview({
  sourceId,
  sourceName,
  onClose,
}: {
  sourceId: string
  sourceName: string
  onClose: () => void
}) {
  const [chunks, setChunks] = useState<Chunk[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const client = await getAuthenticatedGqlClient()
        const data = await client.request<{ knowledgeSourceChunks: Chunk[] }>(
          CHUNKS_QUERY,
          { sourceId }
        )
        setChunks(data.knowledgeSourceChunks)
      } catch {
        // Failed to load
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sourceId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">
            Chunks — {sourceName} ({chunks.length})
          </h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && chunks.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No chunks indexed for this source. Try re-indexing.
            </p>
          )}

          {chunks.map((chunk, i) => (
            <div key={chunk.id} className="rounded-md border border-border p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Chunk {i + 1}</span>
                <span>{chunk.sourceType}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {chunk.content.length > 500
                  ? `${chunk.content.slice(0, 500)}...`
                  : chunk.content}
              </p>
              {chunk.metadata && Object.keys(chunk.metadata).length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {Object.entries(chunk.metadata).map(([k, v]) => (
                    <span key={k} className="mr-3">
                      {k}: {String(v)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
