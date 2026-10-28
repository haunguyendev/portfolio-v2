import type { Metadata } from 'next'
import { AnimatedPageTitle } from '@/components/ui/animated-page-title'
import { DiaryPageContent } from './diary-page-content'
import { apiGetDiaries } from '@/lib/api-client'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Diary',
  description:
    "Kane Nguyen's personal diary — reflections, emotions, and memories.",
}

export default async function DiaryPage() {
  const entries = await apiGetDiaries()

  return (
    <div className="section-spacing">
      <div className="container-main">
        <AnimatedPageTitle className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
          Diary
        </AnimatedPageTitle>
        <p className="mb-8 max-w-2xl text-base text-muted-foreground">
          Personal reflections, emotions, and memories I want to keep and
          share.
        </p>
        <DiaryPageContent entries={entries} />
      </div>
    </div>
  )
}
