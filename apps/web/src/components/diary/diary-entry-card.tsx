import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DIARY_MOODS } from '@/lib/diary-constants'
import type { Diary } from '@/lib/content'

interface DiaryEntryCardProps {
  entry: Diary
}

export function DiaryEntryCard({ entry }: DiaryEntryCardProps) {
  const mood = DIARY_MOODS[entry.mood]
  const isDraft = !entry.published

  return (
    <Link href={`/diary/${entry.slug}`} className="group block">
      <article className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Draft badge overlay */}
        {isDraft && (
          <div className="absolute right-2 top-2 z-10">
            <Badge variant="destructive">Draft</Badge>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
          {/* Mood emoji + label */}
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label={mood.label}>
              {mood.emoji}
            </span>
            <span className={`text-sm font-medium ${mood.color}`}>
              {mood.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-muted-foreground">
            {entry.title}
          </h3>

          {/* Description */}
          {entry.description && (
            <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {entry.description}
            </p>
          )}

          {/* Meta: date + reading time */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(entry.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {entry.readingTime} min read
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
