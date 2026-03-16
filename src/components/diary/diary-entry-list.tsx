import { BookHeart } from 'lucide-react'
import { DiaryEntryCard } from './diary-entry-card'
import type { Diary } from '@/lib/content'

interface DiaryEntryListProps {
  entries: Diary[]
}

export function DiaryEntryList({ entries }: DiaryEntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 px-6 py-16 text-center">
        <BookHeart className="mb-4 size-10 text-muted-foreground/50" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          No diary entries yet
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Personal reflections will appear here soon.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {entries.map((entry) => (
        <DiaryEntryCard key={entry.slug} entry={entry} />
      ))}
    </div>
  )
}
