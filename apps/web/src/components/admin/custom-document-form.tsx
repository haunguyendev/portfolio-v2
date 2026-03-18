'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { gql } from 'graphql-request'
import { getAuthenticatedGqlClient } from '@/lib/graphql-client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CustomDocumentFormProps {
  initialData?: {
    id?: string
    name?: string
    content?: string
  }
}

const CREATE_MUTATION = gql`
  mutation CreateCustomKnowledgeSource($input: CreateCustomSourceInput!) {
    createCustomKnowledgeSource(input: $input) { id }
  }
`

const UPDATE_MUTATION = gql`
  mutation UpdateCustomKnowledgeSource($id: ID!, $input: UpdateCustomSourceInput!) {
    updateCustomKnowledgeSource(id: $id, input: $input) { id }
  }
`

export function CustomDocumentForm({ initialData }: CustomDocumentFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id
  const [name, setName] = useState(initialData?.name ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !content.trim()) {
      toast.error('Name and content are required')
      return
    }

    setSaving(true)
    try {
      const client = await getAuthenticatedGqlClient()

      if (isEdit) {
        await client.request(UPDATE_MUTATION, {
          id: initialData!.id,
          input: { name: name.trim(), content: content.trim() },
        })
        toast.success('Document updated')
      } else {
        await client.request(CREATE_MUTATION, {
          input: { name: name.trim(), content: content.trim() },
        })
        toast.success('Document created')
      }

      router.push('/admin/knowledge')
      router.refresh()
    } catch {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} document`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., My Detailed CV"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Content (Markdown)
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your knowledge document in Markdown..."
          rows={16}
          className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
          required
        />
        <p className="text-xs text-muted-foreground">
          This content will be split into chunks and embedded for AI chat retrieval.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEdit ? 'Update' : 'Create'} Document
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/knowledge')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
