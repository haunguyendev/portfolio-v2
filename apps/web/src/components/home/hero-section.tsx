import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Download } from 'lucide-react'
import { TypewriterHeading } from '@/components/ui/typewriter-heading'
import { RotatingText } from '@/components/ui/rotating-text'
import profile from '@/content/profile.json'

// Name variants for typewriter — last word gets gradient styling
const NAMES = [
  [
    { text: `${profile.name.split(' ').slice(0, -1).join(' ')} ` },
    { text: profile.name.split(' ').at(-1)!, className: 'gradient-text' },
  ],
  [
    { text: `${profile.fullName.split(' ').slice(0, -1).join(' ')} ` },
    { text: profile.fullName.split(' ').at(-1)!, className: 'gradient-text' },
  ],
]

// Rotating title styles (presentation concern — stays in component)
const TITLE_STYLES = [
  'text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]',
  'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]',
  'text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]',
]

const TITLES = profile.titles.map((text, i) => ({
  text,
  className: TITLE_STYLES[i],
}))

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
              <RotatingText
                items={TITLES}
                className="text-xl font-medium"
              />
            </div>

            <p className="max-w-md leading-relaxed text-muted-foreground">
              {profile.bio.hero}
            </p>

            <span className="text-xs text-muted-foreground">
              {profile.location} &middot; {profile.timezone}
            </span>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
              >
                View Projects
                <ArrowRight className="size-4" />
              </Link>
              <a
                href={profile.resumePath}
                download
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
              >
                <Download className="size-4" />
                Resume
              </a>
            </div>
          </div>

          {/* Right: Photo */}
          <div className="order-1 flex justify-center md:order-2 md:justify-end">
            <div className="relative h-72 w-72 overflow-hidden rounded-2xl shadow-xl md:h-80 md:w-80 lg:h-96 lg:w-96">
              <Image
                src={profile.heroPhoto}
                alt={profile.name}
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
