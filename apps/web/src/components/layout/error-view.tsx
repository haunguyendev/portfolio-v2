'use client'

import { useEffect } from 'react'

export function ErrorView({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="section-spacing">
      <div className="container-main">
        <div className="flex flex-col items-center justify-center py-16 text-center md:py-24">
          <div className="mb-6 rounded-full bg-red-50 p-4 dark:bg-red-950/50">
            <span className="text-2xl font-bold text-red-500">!</span>
          </div>

          <h1 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
            Something Went Wrong
          </h1>

          <p className="mb-8 max-w-md text-base text-muted-foreground">
            An unexpected error occurred. Please try again or navigate back to
            the home page.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              Try Again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- next/link is copied into the homepage error chunk */}
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
