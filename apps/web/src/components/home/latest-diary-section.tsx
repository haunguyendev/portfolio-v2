import Link from 'next/link'
import { ArrowRight, BookHeart } from 'lucide-react'
import { apiGetDiaries } from '@/lib/api-client'
import { DiaryEntryCard } from '@/components/diary/diary-entry-card'

export async function LatestDiarySection() {
  const entries = (await apiGetDiaries()).slice(0, 2)

  return (
    <section className="section-spacing">
      <div className="container-main">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground md:text-3xl">
            <BookHeart className="size-6 md:size-7" />
            Latest Diary
          </h2>
          <Link
            href="/diary"
            className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            View All
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 px-6 py-16 text-center">
            <BookHeart className="mb-4 size-10 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Coming Soon
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Personal reflections and diary entries will appear here soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {entries.map((entry) => (
              <DiaryEntryCard key={entry.slug} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
