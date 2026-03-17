import { gqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import { PostForm } from '@/components/admin/post-form'

const FORM_DATA_QUERY = gql`
  query FormData {
    categories { id name }
    tags { id name }
    seriesList { id title }
  }
`

export const revalidate = 0

export default async function NewPostPage() {
  let categories: { id: string; name: string }[] = []
  let tags: { id: string; name: string }[] = []
  let seriesList: { id: string; title: string }[] = []

  try {
    const data = await gqlClient.request<{
      categories: typeof categories
      tags: typeof tags
      seriesList: typeof seriesList
    }>(FORM_DATA_QUERY)
    categories = data.categories
    tags = data.tags
    seriesList = data.seriesList
  } catch {
    // API not available
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Post</h1>
      <PostForm categories={categories} tags={tags} seriesList={seriesList} />
    </div>
  )
}
