import type { Metadata } from 'next'
import { AnimatedPageTitle } from '@/components/ui/animated-page-title'
import { BookHeart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Diary',
  description: "Kane Nguyen's personal diary — coming soon.",
}

export default function DiaryPage() {
  return (
    <div className="section-spacing">
      <div className="container-main">
        <div className="flex flex-col items-center justify-center py-16 text-center md:py-24">
          <div className="mb-6 rounded-full bg-muted p-4">
            <BookHeart className="h-8 w-8 text-muted-foreground" />
          </div>

          <AnimatedPageTitle className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Diary
          </AnimatedPageTitle>

          <p className="mb-2 max-w-md text-base text-muted-foreground">
            Coming soon! A space for my personal reflections, emotions, and
            memories I want to keep and share.
          </p>
          <p className="text-sm text-muted-foreground">
            Stay tuned for heartfelt entries.
          </p>
        </div>
      </div>
    </div>
  )
}
