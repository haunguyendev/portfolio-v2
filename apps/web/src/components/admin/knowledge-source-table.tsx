'use client'

import { useState } from 'react'
import { gql } from 'graphql-request'
import { getAuthenticatedGqlClient } from '@/lib/graphql-client'
import { toast } from 'sonner'
import { Loader2, RefreshCw, Pencil, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { KnowledgeChunkPreview } from './knowledge-chunk-preview'

interface KnowledgeSource {
  id: string
  name: string
  type: 'SYSTEM' | 'CUSTOM'
  sourceKey: string
  enabled: boolean
  chunkCount: number
  lastIndexedAt: string | null
  updatedAt: string
}

const TOGGLE_MUTATION = gql`
  mutation ToggleKnowledgeSource($id: ID!, $enabled: Boolean!) {
    toggleKnowledgeSource(id: $id, enabled: $enabled) { id enabled }
  }
`

const REINDEX_MUTATION = gql`
  mutation ReindexKnowledgeSource($id: ID!) {
    reindexKnowledgeSource(id: $id) { chunksIndexed }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteCustomKnowledgeSource($id: ID!) {
    deleteCustomKnowledgeSource(id: $id)
  }
`

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function KnowledgeSourceTable({ sources: initialSources }: { sources: KnowledgeSource[] }) {
  const [sources, setSources] = useState(initialSources)
  const [reindexing, setReindexing] = useState<string | null>(null)
  const [previewSourceId, setPreviewSourceId] = useState<string | null>(null)

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    try {
      const client = await getAuthenticatedGqlClient()
      await client.request(TOGGLE_MUTATION, { id, enabled: !currentEnabled })
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, enabled: !currentEnabled } : s))
      )
      toast.success(`Source ${!currentEnabled ? 'enabled' : 'disabled'}`)
    } catch {
      toast.error('Failed to toggle source')
    }
  }

  const handleReindex = async (id: string, name: string) => {
    setReindexing(id)
    try {
      const client = await getAuthenticatedGqlClient()
      const data = await client.request<{
        reindexKnowledgeSource: { chunksIndexed: number }
      }>(REINDEX_MUTATION, { id })
      setSources((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, chunkCount: data.reindexKnowledgeSource.chunksIndexed, lastIndexedAt: new Date().toISOString() }
            : s
        )
      )
      toast.success(`Re-indexed ${name}: ${data.reindexKnowledgeSource.chunksIndexed} chunks`)
    } catch {
      toast.error(`Re-index failed for ${name}`)
    } finally {
      setReindexing(null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will remove all its embeddings.`)) return
    try {
      const client = await getAuthenticatedGqlClient()
      await client.request(DELETE_MUTATION, { id })
      setSources((prev) => prev.filter((s) => s.id !== id))
      toast.success(`Deleted "${name}"`)
    } catch {
      toast.error('Failed to delete source')
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Source</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-center font-medium">Chunks</th>
              <th className="px-4 py-3 text-left font-medium">Last Indexed</th>
              <th className="px-4 py-3 text-center font-medium">Enabled</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    s.type === 'SYSTEM'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  }`}>
                    {s.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setPreviewSourceId(s.id)}
                    className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    title="View chunks"
                  >
                    {s.chunkCount}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{timeAgo(s.lastIndexedAt)}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggle(s.id, s.enabled)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      s.enabled ? 'bg-primary' : 'bg-muted'
                    }`}
                    aria-label={`Toggle ${s.name}`}
                  >
                    <span className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${
                      s.enabled ? 'translate-x-4.5' : 'translate-x-1'
                    }`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setPreviewSourceId(s.id)}
                      className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent"
                      title="Preview chunks"
                    >
                      <Eye className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleReindex(s.id, s.name)}
                      disabled={reindexing === s.id}
                      className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent disabled:opacity-50"
                      title="Re-index"
                    >
                      {reindexing === s.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="size-3.5" />
                      )}
                    </button>
                    {s.type === 'CUSTOM' && (
                      <>
                        <Link
                          href={`/admin/knowledge/custom/${s.id}/edit`}
                          className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent"
                          title="Edit"
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="inline-flex size-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {sources.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No knowledge sources found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {previewSourceId && (
        <KnowledgeChunkPreview
          sourceId={previewSourceId}
          sourceName={sources.find((s) => s.id === previewSourceId)?.name ?? ''}
          onClose={() => setPreviewSourceId(null)}
        />
      )}
    </>
  )
}
