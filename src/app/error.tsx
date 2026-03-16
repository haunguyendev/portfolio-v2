'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="section-spacing">
      <div className="container-main">
        <div className="flex flex-col items-center justify-center py-16 text-center md:py-24">
          <div className="mb-6 rounded-full bg-red-50 p-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
            Something Went Wrong
          </h1>

          <p className="mb-8 max-w-md text-base text-muted-foreground">
            An unexpected error occurred. Please try again or navigate back to
            the home page.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'gap-2',
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
