'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { gql } from 'graphql-request'
import { getGraphQLClient } from '@/lib/graphql-client'
import { Button } from '@/components/ui/button'

const CREATE_SERIES = gql`
  mutation CreateSeries($input: CreateSeriesInput!) {
    createSeries(input: $input) { id slug }
  }
`

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function NewSeriesPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    setSlug(slugify(e.target.value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const token = document.cookie.split('; ').find((c) => c.startsWith('better-auth.session_token='))?.split('=')[1]
      const client = getGraphQLClient(token)
      await client.request(CREATE_SERIES, {
        input: { title, slug, description: description || undefined, coverImage: coverImage || undefined, published },
      })
      router.push('/admin/series')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'
  const labelCls = 'block text-sm font-medium mb-1'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Series</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div>
          <label className={labelCls}>Title *</label>
          <input className={inputCls} value={title} onChange={handleTitleChange} required placeholder="Series title" />
        </div>
        <div>
          <label className={labelCls}>Slug *</label>
          <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="series-slug" />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What is this series about?" />
        </div>
        <div>
          <label className={labelCls}>Cover image URL</label>
          <input className={inputCls} value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://…" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="rounded" />
          Published
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create'}</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/series')}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
