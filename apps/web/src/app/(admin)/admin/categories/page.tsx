'use client'

import { useState, useEffect } from 'react'
import { gql } from 'graphql-request'
import { gqlClient, getGraphQLClient } from '@/lib/graphql-client'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'

interface Category {
  id: string; name: string; slug: string; description?: string; color?: string
}

const CATEGORIES_QUERY = gql`query { categories { id name slug description color } }`
const CREATE_CATEGORY = gql`mutation CreateCategory($input: CreateCategoryInput!) { createCategory(input: $input) { id name slug description color } }`
const UPDATE_CATEGORY = gql`mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) { updateCategory(id: $id, input: $input) { id name slug description color } }`
const DELETE_CATEGORY = gql`mutation DeleteCategory($id: ID!) { deleteCategory(id: $id) }`

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function getAuthToken() {
  return document.cookie.split('; ').find((c) => c.startsWith('better-auth.session_token='))?.split('=')[1]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    gqlClient.request<{ categories: Category[] }>(CATEGORIES_QUERY)
      .then((d) => setCategories(d.categories))
      .catch(() => {})
  }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    const client = getGraphQLClient(getAuthToken())
    const input = { name: newName.trim(), slug: slugify(newName), description: newDesc || undefined }
    const d = await client.request<{ createCategory: Category }>(CREATE_CATEGORY, { input })
    setCategories((prev) => [...prev, d.createCategory])
    setNewName(''); setNewDesc(''); setAdding(false)
  }

  async function handleUpdate(id: string) {
    const client = getGraphQLClient(getAuthToken())
    const input = { name: editName, slug: slugify(editName), description: editDesc || undefined }
    const d = await client.request<{ updateCategory: Category }>(UPDATE_CATEGORY, { id, input })
    setCategories((prev) => prev.map((c) => c.id === id ? d.updateCategory : c))
    setEditId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return
    const client = getGraphQLClient(getAuthToken())
    await client.request(DELETE_CATEGORY, { id })
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const inputCls = 'rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}><Plus className="size-4" />Add</Button>
        )}
      </div>

      <div className="rounded-xl ring-1 ring-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {adding && (
              <tr className="border-b border-border bg-muted/20">
                <td className="px-4 py-2"><input className={inputCls + ' w-full'} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" autoFocus /></td>
                <td className="px-4 py-2"><span className="text-xs text-muted-foreground">{slugify(newName)}</span></td>
                <td className="px-4 py-2"><input className={inputCls + ' w-full'} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description" /></td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={handleCreate}><Check className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setAdding(false)}><X className="size-3.5" /></Button>
                  </div>
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  {editId === cat.id ? (
                    <input className={inputCls + ' w-full'} value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                  ) : (
                    <span className="font-medium">{cat.name}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{cat.slug}</td>
                <td className="px-4 py-3">
                  {editId === cat.id ? (
                    <input className={inputCls + ' w-full'} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                  ) : (
                    <span className="text-muted-foreground">{cat.description ?? '—'}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {editId === cat.id ? (
                      <>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleUpdate(cat.id)}><Check className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditId(null)}><X className="size-3.5" /></Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon-sm" onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditDesc(cat.description ?? '') }}><Pencil className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(cat.id)}><Trash2 className="size-3.5 text-destructive" /></Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && !adding && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No categories yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
