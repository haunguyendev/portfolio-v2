import { gqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import Link from 'next/link'
import { DataTable } from '@/components/admin/data-table'
import { Plus, Pencil } from 'lucide-react'

const POSTS_QUERY = gql`
  query Posts($filter: PostsFilterInput) {
    posts(filter: $filter) {
      id title slug type published featured createdAt
      category { name }
    }
  }
`

interface Post {
  id: string; title: string; slug: string; type: string
  published: boolean; featured: boolean; createdAt: string
  category?: { name: string }
}

export const revalidate = 0

export default async function AdminPostsPage() {
  let posts: Post[] = []

  try {
    const data = await gqlClient.request<{ posts: Post[] }>(POSTS_QUERY, { filter: {} })
    posts = data.posts
  } catch {
    // API not available
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Link href="/admin/posts/new" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="size-4" />New Post</Link>
      </div>

      <DataTable
        data={posts}
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
          { key: 'type', header: 'Type', cell: (p) => <span className="text-xs text-muted-foreground">{p.type}</span> },
          {
            key: 'status', header: 'Status',
            cell: (p) => (
              <span className={`rounded-full px-2 py-0.5 text-xs ${p.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                {p.published ? 'Published' : 'Draft'}
              </span>
            ),
          },
          { key: 'category', header: 'Category', cell: (p) => <span className="text-sm">{p.category?.name ?? '—'}</span> },
          { key: 'date', header: 'Created', cell: (p) => <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</span> },
          {
            key: 'actions', header: '', className: 'w-20',
            cell: (p) => (
              <Link href={`/admin/posts/${p.id}/edit`} className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"><Pencil className="size-3.5" /></Link>
            ),
          },
        ]}
        emptyMessage="No posts yet."
      />
    </div>
  )
}
