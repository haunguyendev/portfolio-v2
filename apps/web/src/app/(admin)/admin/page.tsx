import { gqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import Link from 'next/link'
import { FileText, Globe, FolderKanban, FilePen } from 'lucide-react'
import { StatCard } from '@/components/admin/stat-card'
import { buttonVariants } from '@/components/ui/button'

const DASHBOARD_QUERY = gql`
  query Dashboard {
    posts(filter: {}) { id title type published createdAt }
    projects { id }
  }
`

export const revalidate = 0

export default async function AdminDashboardPage() {
  let posts: { id: string; title: string; type: string; published: boolean; createdAt: string }[] = []
  let projectCount = 0

  try {
    const data = await gqlClient.request<{
      posts: typeof posts
      projects: { id: string }[]
    }>(DASHBOARD_QUERY)
    posts = data.posts
    projectCount = data.projects.length
  } catch {
    // API not available — show zeros
  }

  const totalPosts = posts.length
  const publishedPosts = posts.filter((p) => p.published).length
  const draftPosts = totalPosts - publishedPosts
  const recentPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back. Here&apos;s an overview of your content.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Posts" value={totalPosts} icon={FileText} />
        <StatCard title="Published" value={publishedPosts} icon={Globe} description="Live posts" />
        <StatCard title="Drafts" value={draftPosts} icon={FilePen} description="Unpublished" />
        <StatCard title="Projects" value={projectCount} icon={FolderKanban} />
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link href="/admin/posts/new" className={buttonVariants({ size: 'sm' })}>New Post</Link>
        <Link href="/admin/projects/new" className={buttonVariants({ size: 'sm', variant: 'outline' })}>New Project</Link>
      </div>

      {/* Recent posts */}
      <div>
        <h2 className="mb-3 text-base font-medium">Recent Posts</h2>
        {recentPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="rounded-xl ring-1 ring-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/admin/posts/${post.id}/edit`} className="font-medium hover:underline">
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{post.type}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${post.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
