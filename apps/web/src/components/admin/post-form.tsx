'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { gql } from 'graphql-request'
import { TiptapEditor } from './tiptap-editor'
import { Button } from '@/components/ui/button'
import { getAuthenticatedGqlClient } from '@/lib/graphql-client'
import { useSession } from '@/lib/auth-client'
import { toast } from 'sonner'
import { ImageDropzone } from './image-dropzone'

interface Category { id: string; name: string }
interface Tag { id: string; name: string }
interface Series { id: string; title: string }

interface PostFormProps {
  initialData?: {
    id?: string
    title?: string
    slug?: string
    description?: string
    content?: Record<string, unknown>
    coverImage?: string
    published?: boolean
    featured?: boolean
    type?: 'BLOG' | 'DIARY'
    mood?: string
    categoryId?: string
    seriesId?: string
    tagIds?: string[]
    metaTitle?: string
    metaDesc?: string
    ogImage?: string
  }
  categories: Category[]
  tags: Tag[]
  seriesList: Series[]
}

const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) { id slug }
  }
`

const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) { id slug }
  }
`

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function PostForm({ initialData, categories, tags, seriesList }: PostFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const isEdit = !!initialData?.id

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [content, setContent] = useState<Record<string, unknown>>(
    initialData?.content ?? { type: 'doc', content: [] }
  )
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? '')
  const [published, setPublished] = useState(initialData?.published ?? false)
  const [featured, setFeatured] = useState(initialData?.featured ?? false)
  const [type, setType] = useState<'BLOG' | 'DIARY'>(initialData?.type ?? 'BLOG')
  const [mood, setMood] = useState(initialData?.mood ?? '')
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '')
  const [seriesId, setSeriesId] = useState(initialData?.seriesId ?? '')
  const [tagIds, setTagIds] = useState<string[]>(initialData?.tagIds ?? [])
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle ?? '')
  const [metaDesc, setMetaDesc] = useState(initialData?.metaDesc ?? '')
  const [ogImage, setOgImage] = useState(initialData?.ogImage ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    if (!isEdit) setSlug(slugify(e.target.value))
  }

  function toggleTag(id: string) {
    setTagIds((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session?.user) return
    setError('')
    setSaving(true)

    try {
      const client = await getAuthenticatedGqlClient()
      const input = {
        title, slug, description: description || undefined,
        content, coverImage: coverImage || undefined,
        published, featured, type,
        mood: type === 'DIARY' ? mood || undefined : undefined,
        categoryId: categoryId || undefined,
        seriesId: seriesId || undefined,
        tagIds: tagIds.length ? tagIds : undefined,
        metaTitle: metaTitle || undefined,
        metaDesc: metaDesc || undefined,
        ogImage: ogImage || undefined,
      }

      if (isEdit) {
        await client.request(UPDATE_POST, { id: initialData!.id, input })
      } else {
        await client.request(CREATE_POST, { input })
      }

      toast.success(isEdit ? 'Post updated successfully' : 'Post created successfully')
      router.push('/admin/posts')
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'
  const labelCls = 'block text-sm font-medium mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          <div>
            <label className={labelCls}>Title *</label>
            <input className={inputCls} value={title} onChange={handleTitleChange} required placeholder="Post title" />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="post-slug" />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Short excerpt…" />
          </div>
          <div>
            <label className={labelCls}>Content *</label>
            <TiptapEditor content={content} onChange={setContent} placeholder="Write your post…" />
          </div>

          {/* SEO */}
          <details className="rounded-xl border border-border p-4">
            <summary className="cursor-pointer text-sm font-medium">SEO Fields</summary>
            <div className="mt-4 space-y-3">
              <div>
                <label className={labelCls}>Meta title</label>
                <input className={inputCls} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={title} />
              </div>
              <div>
                <label className={labelCls}>Meta description</label>
                <textarea className={inputCls} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={2} placeholder={description} />
              </div>
              <div>
                <label className={labelCls}>OG image URL</label>
                <input className={inputCls} value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://…" />
              </div>
            </div>
          </details>
        </div>

        {/* Sidebar column */}
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Type</label>
            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as 'BLOG' | 'DIARY')}>
              <option value="BLOG">Blog</option>
              <option value="DIARY">Diary</option>
            </select>
          </div>
          {type === 'DIARY' && (
            <div>
              <label className={labelCls}>Mood</label>
              <input className={inputCls} value={mood} onChange={(e) => setMood(e.target.value)} placeholder="e.g. reflective" />
            </div>
          )}
          <div>
            <label className={labelCls}>Category</label>
            <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Series</label>
            <select className={inputCls} value={seriesId} onChange={(e) => setSeriesId(e.target.value)}>
              <option value="">None</option>
              {seriesList.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                  className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${tagIds.includes(t.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <ImageDropzone
            value={coverImage || null}
            onChange={(url) => setCoverImage(url ?? '')}
            folder="posts/cover"
            label="Cover Image"
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="rounded" />
              Published
            </label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin/posts')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
