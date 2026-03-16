import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { TypewriterHeading } from '@/components/ui/typewriter-heading'

const NAMES = [
  [{ text: 'Kane ' }, { text: 'Nguyen', className: 'gradient-text' }],
  [{ text: 'Trung Hau ' }, { text: 'Nguyen', className: 'gradient-text' }],
]

export function HeroSection() {
  return (
    <section className="section-spacing">
      <div className="container-main">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* Left: Text content */}
          <div className="order-2 flex flex-col gap-6 md:order-1">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Hi, I&apos;m
              </span>
              <TypewriterHeading
                names={NAMES}
                className="text-5xl font-bold tracking-tight text-foreground lg:text-6xl"
              />
              <p className="text-xl font-medium text-muted-foreground">
                Software Engineer
              </p>
            </div>

            <p className="max-w-md leading-relaxed text-muted-foreground">
              I build web applications with a focus on performance and user
              experience. Passionate about clean code, modern tooling, and
              shipping products people love.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
              >
                View Projects
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
              >
                About Me
              </Link>
            </div>
          </div>

          {/* Right: Photo */}
          <div className="order-1 flex justify-center md:order-2 md:justify-end">
            <div className="relative h-72 w-72 overflow-hidden rounded-2xl shadow-xl md:h-80 md:w-80 lg:h-96 lg:w-96">
              <Image
                src="/images/hero/kane-photo.jpg"
                alt="Kane Nguyen"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 288px, (max-width: 1024px) 320px, 384px"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
