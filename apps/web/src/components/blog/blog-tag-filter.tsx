'use client'

import { Badge } from '@/components/ui/badge'

interface BlogTagFilterProps {
  allTags: string[]
  activeTags: string[]
  onToggleTag: (tag: string) => void
  onClearAll: () => void
}

export function BlogTagFilter({
  allTags,
  activeTags,
  onToggleTag,
  onClearAll,
}: BlogTagFilterProps) {
  if (allTags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onClearAll}
        className="cursor-pointer"
        type="button"
      >
        <Badge variant={activeTags.length === 0 ? 'default' : 'outline'}>
          All
        </Badge>
      </button>
      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onToggleTag(tag)}
          className="cursor-pointer"
          type="button"
        >
          <Badge
            variant={activeTags.includes(tag) ? 'default' : 'outline'}
          >
            {tag}
          </Badge>
        </button>
      ))}
    </div>
  )
}
