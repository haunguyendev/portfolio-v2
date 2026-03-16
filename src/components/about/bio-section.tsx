// About page hero section with photo, bio, social links, and resume download
import Image from 'next/image'
import { Github, Linkedin, Mail, Download } from 'lucide-react'
import { SOCIAL_LINKS as SOCIAL_URLS } from '@/lib/constants'
import type { LucideIcon } from 'lucide-react'

interface SocialLink {
  label: string
  href: string
  icon: LucideIcon
}

const SOCIAL_LINKS: SocialLink[] = [
  { label: 'GitHub', href: SOCIAL_URLS.github, icon: Github },
  { label: 'LinkedIn', href: SOCIAL_URLS.linkedin, icon: Linkedin },
  { label: 'Email', href: SOCIAL_URLS.email, icon: Mail },
]

export function BioSection() {
  return (
    <section className="mb-12 md:mb-16">
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[160px_1fr] md:gap-8">
        {/* Profile photo */}
        <div className="flex justify-center md:justify-start">
          <div className="relative size-40 overflow-hidden rounded-full border-2 border-border">
            <Image
              src="/images/hero/kane-avatar.jpg"
              alt="Kane Nguyen's profile photo"
              fill
              priority
              className="object-cover"
              sizes="160px"
            />
          </div>
        </div>

        {/* Bio content */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Kane Nguyen
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Software Engineer — Vietnam
          </p>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            I build web apps with React, Next.js, and TypeScript. In my first
            year as a Software Engineer, I shipped features that improved user
            engagement by 20%, built REST APIs for e-commerce, and set up
            CI/CD pipelines that cut production bugs by 30%. I value clean
            boundaries between work and life — it keeps my code sharp and my
            thinking fresh. Currently looking for a full-stack or frontend role
            where I can grow with a strong engineering team.
          </p>

          {/* Social links */}
          <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
            {SOCIAL_LINKS.map((link) => {
              const isExternal = link.href.startsWith('http')
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  aria-label={isExternal ? `${link.label} (opens in new tab)` : link.label}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <link.icon className="size-4" aria-hidden="true" />
                  <span>{link.label}</span>
                </a>
              )
            })}
          </div>

          {/* Resume download CTA */}
          <div className="mt-5 flex justify-center md:justify-start">
            <a
              href="/resume.pdf"
              download
              title="Download resume (PDF)"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-orange-500 via-red-500 to-blue-500 px-4 py-2 text-sm font-medium text-white transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Download className="size-4" aria-hidden="true" />
              <span>Download Resume</span>
            </a>
          </div>
        </div>
      </div>

    </section>
  )
}
