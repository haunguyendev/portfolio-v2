import { gqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import { notFound } from 'next/navigation'
import { CustomDocumentForm } from '@/components/admin/custom-document-form'

const SOURCE_QUERY = gql`
  query KnowledgeSources {
    knowledgeSources {
      id name type content
    }
  }
`

interface KnowledgeSource {
  id: string
  name: string
  type: 'SYSTEM' | 'CUSTOM'
  content: string | null
}

export const revalidate = 0

export default async function EditCustomDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let source: KnowledgeSource | undefined

  try {
    const data = await gqlClient.request<{ knowledgeSources: KnowledgeSource[] }>(SOURCE_QUERY)
    source = data.knowledgeSources.find((s) => s.id === id && s.type === 'CUSTOM')
  } catch {
    // API not available
  }

  if (!source) return notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit: {source.name}</h1>
      <div className="max-w-2xl">
        <CustomDocumentForm
          initialData={{
            id: source.id,
            name: source.name,
            content: source.content ?? '',
          }}
        />
      </div>
    </div>
  )
}
