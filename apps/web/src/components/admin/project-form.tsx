'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { gql } from 'graphql-request'
import { Button } from '@/components/ui/button'
import { getGraphQLClient } from '@/lib/graphql-client'

interface ProjectFormProps {
  initialData?: {
    id?: string
    title?: string
    slug?: string
    description?: string
    longDesc?: string
    image?: string
    technologies?: string[]
    category?: string
    github?: string
    demo?: string
    featured?: boolean
    sortOrder?: number
  }
}

const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) { id slug }
  }
`
const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) { id slug }
  }
`

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [longDesc, setLongDesc] = useState(initialData?.longDesc ?? '')
  const [image, setImage] = useState(initialData?.image ?? '')
  const [techInput, setTechInput] = useState(initialData?.technologies?.join(', ') ?? '')
  const [category, setCategory] = useState(initialData?.category ?? '')
  const [github, setGithub] = useState(initialData?.github ?? '')
  const [demo, setDemo] = useState(initialData?.demo ?? '')
  const [featured, setFeatured] = useState(initialData?.featured ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    if (!isEdit) setSlug(slugify(e.target.value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const token = document.cookie
        .split('; ')
        .find((c) => c.startsWith('better-auth.session_token='))
        ?.split('=')[1]

      const client = getGraphQLClient(token)
      const technologies = techInput.split(',').map((t) => t.trim()).filter(Boolean)
      const input = {
        title, slug, description,
        longDesc: longDesc || undefined,
        image: image || undefined,
        technologies,
        category: category || undefined,
        github: github || undefined,
        demo: demo || undefined,
        featured,
      }

      if (isEdit) {
        await client.request(UPDATE_PROJECT, { id: initialData!.id, input })
      } else {
        await client.request(CREATE_PROJECT, { input })
      }

      router.push('/admin/projects')
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
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className={labelCls}>Title *</label>
        <input className={inputCls} value={title} onChange={handleTitleChange} required placeholder="Project title" />
      </div>
      <div>
        <label className={labelCls}>Slug *</label>
        <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="project-slug" />
      </div>
      <div>
        <label className={labelCls}>Short description *</label>
        <textarea className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} required rows={2} placeholder="One-line description" />
      </div>
      <div>
        <label className={labelCls}>Long description</label>
        <textarea className={inputCls} value={longDesc} onChange={(e) => setLongDesc(e.target.value)} rows={4} placeholder="Detailed description…" />
      </div>
      <div>
        <label className={labelCls}>Cover image URL</label>
        <input className={inputCls} value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" />
      </div>
      <div>
        <label className={labelCls}>Technologies (comma-separated)</label>
        <input className={inputCls} value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="Next.js, TypeScript, Prisma" />
      </div>
      <div>
        <label className={labelCls}>Category</label>
        <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">None</option>
          <option value="personal">Personal</option>
          <option value="company">Company</option>
          <option value="freelance">Freelance</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>GitHub URL</label>
          <input className={inputCls} value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/…" />
        </div>
        <div>
          <label className={labelCls}>Demo URL</label>
          <input className={inputCls} value={demo} onChange={(e) => setDemo(e.target.value)} placeholder="https://…" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
        Featured project
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}</Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/projects')}>Cancel</Button>
      </div>
    </form>
  )
}
