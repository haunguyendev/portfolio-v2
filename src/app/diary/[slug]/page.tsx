import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { MdxContent } from '@/components/blog/mdx-content'
import { DiaryMoodBadge } from '@/components/diary/diary-mood-badge'
import { ShareButtons } from '@/components/shared/share-buttons'
import { getDiaries, getDiaryBySlug } from '@/lib/content'
import { SITE_URL } from '@/lib/constants'

interface DiaryEntryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getDiaries().map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({
  params,
}: DiaryEntryPageProps): Promise<Metadata> {
  const { slug } = await params
  const entry = getDiaryBySlug(slug)
  if (!entry) return { title: 'Entry Not Found' }

  return {
    title: entry.title,
    description: entry.description || `Diary entry: ${entry.title}`,
  }
}

export default async function DiaryEntryPage({
  params,
}: DiaryEntryPageProps) {
  const { slug } = await params
  const entry = getDiaryBySlug(slug)
  if (!entry) notFound()

  const entryUrl = `${SITE_URL}/diary/${entry.slug}`

  return (
    <div className="section-spacing">
      <div className="container-main max-w-3xl">
        {/* Back link */}
        <Link
          href="/diary"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Diary
        </Link>

        <article>
          {/* Header */}
          <header className="mb-8">
            <div className="mb-3">
              <DiaryMoodBadge mood={entry.mood} />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              {entry.title}
            </h1>

            {/* Meta */}
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-4" />
                {new Date(entry.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-4" />
                {entry.readingTime} min read
              </span>
            </div>

            {/* Share */}
            <ShareButtons title={entry.title} url={entryUrl} />
          </header>

          {/* MDX body with softer diary styling */}
          <div className="diary-prose">
            <MdxContent code={entry.body} />
          </div>
        </article>
      </div>
    </div>
  )
}
