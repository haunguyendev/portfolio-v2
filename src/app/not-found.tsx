import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="section-spacing">
      <div className="container-main">
        <div className="flex flex-col items-center justify-center py-16 text-center md:py-24">
          <p className="gradient-text mb-4 text-6xl font-bold md:text-8xl">
            404
          </p>

          <h1 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
            Page Not Found
          </h1>

          <p className="mb-8 max-w-md text-base text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
