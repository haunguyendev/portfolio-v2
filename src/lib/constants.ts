export const SITE_NAME = 'Kane Nguyen'
export const SITE_DESCRIPTION = "Software Engineer's Portfolio"
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Diary', href: '/diary' },
] as const

export const SOCIAL_LINKS = {
  github: 'https://github.com/haunguyendev',
  linkedin: 'https://www.linkedin.com/in/h%E1%BA%ADu-nguy%E1%BB%85n-6b1576229/',
  facebook: 'https://www.facebook.com/nguyen.trung.hau.778410/',
  email: 'mailto:haunt150603@gmail.com',
  zalo: 'https://zalo.me/0969313263',
} as const
