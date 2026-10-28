'use client'

import { useState, useMemo } from 'react'
import { SearchInput } from '@/components/shared/search-input'
import { BlogTagFilter } from '@/components/blog/blog-tag-filter'
import { BlogPostList } from '@/components/blog/blog-post-list'
import type { Blog } from '@/lib/content'

interface BlogPageContentProps {
  posts: Blog[]
  allTags: string[]
}

export function BlogPageContent({ posts, allTags }: BlogPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Keyword filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesKeyword =
          post.title.toLowerCase().includes(q) ||
          post.description.toLowerCase().includes(q)
        if (!matchesKeyword) return false
      }

      // Tag filter
      if (activeTags.length > 0) {
        const matchesTag = activeTags.some((tag) => post.tags.includes(tag))
        if (!matchesTag) return false
      }

      return true
    })
  }, [posts, searchQuery, activeTags])

  const handleToggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search blog posts..."
          />
        </div>
      </div>
      <BlogTagFilter
        allTags={allTags}
        activeTags={activeTags}
        onToggleTag={handleToggleTag}
        onClearAll={() => setActiveTags([])}
      />
      <BlogPostList posts={filteredPosts} />
    </div>
  )
}
