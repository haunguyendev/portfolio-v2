import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function AboutPreviewSection() {
  return (
    <section className="section-spacing">
      <div className="container-main">
        <div className="max-w-2xl">
          <h2 className="mb-6 text-2xl font-bold text-zinc-900 md:text-3xl">
            About Me
          </h2>

          <div className="flex flex-col gap-4 leading-relaxed text-zinc-600">
            <p>
              I&apos;m a Software Engineer with 1 year of experience building
              modern web applications. I thrive on turning ideas into polished
              products — from architecting scalable backends to crafting
              pixel-perfect UIs.
            </p>
            <p>
              When I&apos;m not writing code, you&apos;ll find me exploring new
              technologies, contributing to open source, or writing about
              software engineering on my blog. I believe in continuous learning
              and sharing knowledge with the community.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
            >
              Learn More About Me
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
