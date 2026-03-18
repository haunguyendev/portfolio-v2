import profile from '@/content/profile.json'

export const SITE_NAME = 'Kane Nguyen'
export const SITE_DESCRIPTION = "Software Engineer's Portfolio"
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Diary', href: '/diary' },
] as const

export const SOCIAL_LINKS = profile.social

/** Resume download URL — served from API (MinIO) instead of static file */
export const RESUME_DOWNLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/resume/download`
