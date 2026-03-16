import Link from 'next/link'
import { Github, Linkedin, Mail } from 'lucide-react'
import { SiFacebook, SiZalo } from 'react-icons/si'
import { SOCIAL_LINKS } from '@/lib/constants'

const FOOTER_NAV = [
  {
    title: 'Pages',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'GitHub', href: SOCIAL_LINKS.github },
      { label: 'LinkedIn', href: SOCIAL_LINKS.linkedin },
      { label: 'Facebook', href: SOCIAL_LINKS.facebook },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'Email', href: SOCIAL_LINKS.email },
      { label: 'Zalo', href: SOCIAL_LINKS.zalo },
    ],
  },
]

const SOCIAL_ICONS = [
  { icon: Github, href: SOCIAL_LINKS.github, label: 'GitHub' },
  { icon: Linkedin, href: SOCIAL_LINKS.linkedin, label: 'LinkedIn' },
  { icon: SiFacebook, href: SOCIAL_LINKS.facebook, label: 'Facebook' },
  { icon: Mail, href: SOCIAL_LINKS.email, label: 'Email' },
  { icon: SiZalo, href: SOCIAL_LINKS.zalo, label: 'Zalo' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="container-main py-10 md:py-14">
        {/* Top: Nav columns + social icons */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Nav columns */}
          {FOOTER_NAV.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => {
                  const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto:')
                  return (
                    <li key={link.label}>
                      {isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

          {/* Social icons column */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Connect
            </h3>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_ICONS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={social.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Kane Nguyen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
