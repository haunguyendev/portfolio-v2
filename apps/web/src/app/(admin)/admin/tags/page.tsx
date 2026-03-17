'use client'

import { useState, useEffect } from 'react'
import { gql } from 'graphql-request'
import { gqlClient, getGraphQLClient } from '@/lib/graphql-client'
import { Button } from '@/components/ui/button'
import { Plus, Check, X } from 'lucide-react'

interface Tag { id: string; name: string; slug: string }

const TAGS_QUERY = gql`query { tags { id name slug } }`
const CREATE_TAG = gql`mutation CreateTag($input: CreateTagInput!) { createTag(input: $input) { id name slug } }`
const DELETE_TAG = gql`mutation DeleteTag($id: ID!) { deleteTag(id: $id) }`

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function getAuthToken() {
  return document.cookie.split('; ').find((c) => c.startsWith('better-auth.session_token='))?.split('=')[1]
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    gqlClient.request<{ tags: Tag[] }>(TAGS_QUERY)
      .then((d) => setTags(d.tags))
      .catch(() => {})
  }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    const client = getGraphQLClient(getAuthToken())
    const d = await client.request<{ createTag: Tag }>(CREATE_TAG, {
      input: { name: newName.trim(), slug: slugify(newName) },
    })
    setTags((prev) => [...prev, d.createTag])
    setNewName(''); setAdding(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this tag?')) return
    const client = getGraphQLClient(getAuthToken())
    await client.request(DELETE_TAG, { id })
    setTags((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tags</h1>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}><Plus className="size-4" />Add</Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {adding && (
          <div className="flex items-center gap-1.5">
            <input
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tag name"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button variant="ghost" size="icon-sm" onClick={handleCreate}><Check className="size-3.5" /></Button>
            <Button variant="ghost" size="icon-sm" onClick={() => { setAdding(false); setNewName('') }}><X className="size-3.5" /></Button>
          </div>
        )}
        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-sm">
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={() => handleDelete(tag.id)}
              className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        {tags.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No tags yet.</p>
        )}
      </div>
    </div>
  )
}
