export const SITE_NAME = 'Kane Nguyen'
export const SITE_DESCRIPTION = "Software Engineer's Portfolio"
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
] as const

export const SOCIAL_LINKS = {
  github: 'https://github.com/kanenguyen',
  linkedin: 'https://linkedin.com/in/kanenguyen',
  email: 'mailto:kane@example.com',
} as const
