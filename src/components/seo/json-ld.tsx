import { SITE_URL, SOCIAL_LINKS } from '@/lib/constants'

// Escape closing script tags to prevent XSS via content injection
function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function PersonJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Kane Nguyen',
    jobTitle: 'Software Engineer',
    url: SITE_URL,
    sameAs: [SOCIAL_LINKS.github, SOCIAL_LINKS.linkedin, SOCIAL_LINKS.facebook],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
    />
  )
}

interface ArticleJsonLdProps {
  title: string
  description: string
  datePublished: string
  dateModified?: string
  url: string
  image?: string
}

export function ArticleJsonLd({
  title,
  description,
  datePublished,
  dateModified,
  url,
  image,
}: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished,
    ...(dateModified && { dateModified }),
    url,
    ...(image && { image }),
    author: {
      '@type': 'Person',
      name: 'Kane Nguyen',
      url: SITE_URL,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
    />
  )
}
