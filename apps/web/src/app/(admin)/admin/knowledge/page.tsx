import { gqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { KnowledgeSourceTable } from '@/components/admin/knowledge-source-table'

const KNOWLEDGE_SOURCES_QUERY = gql`
  query KnowledgeSources {
    knowledgeSources {
      id name type sourceKey enabled chunkCount lastIndexedAt updatedAt
    }
  }
`

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

export const revalidate = 0

export default async function AdminKnowledgePage() {
  let sources: KnowledgeSource[] = []

  try {
    const data = await gqlClient.request<{ knowledgeSources: KnowledgeSource[] }>(
      KNOWLEDGE_SOURCES_QUERY
    )
    sources = data.knowledgeSources
  } catch {
    // API not available or not authenticated for this query
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Knowledge Base</h1>
        <Link
          href="/admin/knowledge/custom/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          New Custom Doc
        </Link>
      </div>

      <KnowledgeSourceTable sources={sources} />
    </div>
  )
}
