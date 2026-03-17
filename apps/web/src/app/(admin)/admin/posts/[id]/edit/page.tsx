import { gqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import { notFound } from 'next/navigation'
import { PostForm } from '@/components/admin/post-form'

const EDIT_DATA_QUERY = gql`
  query EditPostData($id: ID!) {
    post(id: $id) {
      id title slug description content coverImage published featured
      type mood categoryId seriesId metaTitle metaDesc ogImage
      tags { id }
    }
    categories { id name }
    tags { id name }
    seriesList { id title }
  }
`

export const revalidate = 0

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const data = await gqlClient.request<{
      post: {
        id: string; title: string; slug: string; description?: string
        content: Record<string, unknown>; coverImage?: string
        published: boolean; featured: boolean; type: 'BLOG' | 'DIARY'
        mood?: string; categoryId?: string; seriesId?: string
        metaTitle?: string; metaDesc?: string; ogImage?: string
        tags: { id: string }[]
      } | null
      categories: { id: string; name: string }[]
      tags: { id: string; name: string }[]
      seriesList: { id: string; title: string }[]
    }>(EDIT_DATA_QUERY, { id })

    if (!data.post) notFound()

    const { tags: postTags, ...postData } = data.post
    const initialData = { ...postData, tagIds: postTags.map((t) => t.id) }

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Edit Post</h1>
        <PostForm
          initialData={initialData}
          categories={data.categories}
          tags={data.tags}
          seriesList={data.seriesList}
        />
      </div>
    )
  } catch {
    notFound()
  }
}
