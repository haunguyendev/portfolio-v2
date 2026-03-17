import { gqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import { notFound } from 'next/navigation'
import { ProjectForm } from '@/components/admin/project-form'

const PROJECT_QUERY = gql`
  query Project($id: ID!) {
    project(id: $id) {
      id title slug description longDesc image
      technologies category github demo featured sortOrder
    }
  }
`

export const revalidate = 0

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let data: {
    project: {
      id: string; title: string; slug: string; description: string
      longDesc?: string; image?: string; technologies: string[]
      category?: string; github?: string; demo?: string
      featured: boolean; sortOrder: number
    } | null
  }

  try {
    data = await gqlClient.request(PROJECT_QUERY, { id })
  } catch {
    notFound()
  }

  if (!data.project) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Project</h1>
      <ProjectForm initialData={data.project} />
    </div>
  )
}
