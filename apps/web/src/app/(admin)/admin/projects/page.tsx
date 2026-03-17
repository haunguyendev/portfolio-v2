import { gqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { DataTable } from '@/components/admin/data-table'
import { Plus, Pencil } from 'lucide-react'

const PROJECTS_QUERY = gql`
  query Projects {
    projects {
      id title slug category featured technologies createdAt
    }
  }
`

interface Project {
  id: string; title: string; slug: string; category?: string
  featured: boolean; technologies: string[]; createdAt: string
}

export const revalidate = 0

export default async function AdminProjectsPage() {
  let projects: Project[] = []

  try {
    const data = await gqlClient.request<{ projects: Project[] }>(PROJECTS_QUERY)
    projects = data.projects
  } catch {
    // API not available
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link href="/admin/projects/new" className={buttonVariants({ size: 'sm' })}><Plus className="size-4" />New Project</Link>
      </div>

      <DataTable
        data={projects}
        columns={[
          {
            key: 'title', header: 'Title',
            cell: (p) => (
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.slug}</div>
              </div>
            ),
          },
          { key: 'category', header: 'Category', cell: (p) => <span className="text-sm">{p.category ?? '—'}</span> },
          {
            key: 'featured', header: 'Featured',
            cell: (p) => p.featured ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Featured</span> : null,
          },
          { key: 'tech', header: 'Technologies', cell: (p) => <span className="text-xs text-muted-foreground">{p.technologies.slice(0, 3).join(', ')}{p.technologies.length > 3 ? '…' : ''}</span> },
          {
            key: 'actions', header: '', className: 'w-20',
            cell: (p) => (
              <Link href={`/admin/projects/${p.id}/edit`} className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}><Pencil className="size-3.5" /></Link>
            ),
          },
        ]}
        emptyMessage="No projects yet."
      />
    </div>
  )
}
