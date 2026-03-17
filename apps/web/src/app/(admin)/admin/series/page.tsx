import { gqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import Link from 'next/link'
import { DataTable } from '@/components/admin/data-table'
import { Plus, Pencil } from 'lucide-react'

const SERIES_QUERY = gql`query { seriesList { id title slug description published createdAt } }`

interface Series {
  id: string; title: string; slug: string; description?: string
  published: boolean; createdAt: string
}

export const revalidate = 0

export default async function AdminSeriesPage() {
  let seriesList: Series[] = []

  try {
    const data = await gqlClient.request<{ seriesList: Series[] }>(SERIES_QUERY)
    seriesList = data.seriesList
  } catch {
    // API not available
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Series</h1>
        <Link href="/admin/series/new" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="size-4" />New Series</Link>
      </div>

      <DataTable
        data={seriesList}
        columns={[
          {
            key: 'title', header: 'Title',
            cell: (s) => (
              <div>
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.slug}</div>
              </div>
            ),
          },
          { key: 'description', header: 'Description', cell: (s) => <span className="text-sm text-muted-foreground">{s.description ?? '—'}</span> },
          {
            key: 'published', header: 'Status',
            cell: (s) => (
              <span className={`rounded-full px-2 py-0.5 text-xs ${s.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                {s.published ? 'Published' : 'Draft'}
              </span>
            ),
          },
          { key: 'date', header: 'Created', cell: (s) => <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</span> },
          {
            key: 'actions', header: '', className: 'w-20',
            cell: (s) => (
              <Link href={`/admin/series/${s.id}/edit`} className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"><Pencil className="size-3.5" /></Link>
            ),
          },
        ]}
        emptyMessage="No series yet."
      />
    </div>
  )
}
