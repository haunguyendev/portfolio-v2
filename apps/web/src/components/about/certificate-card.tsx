// Compact certificate card: thumbnail + title + issuer · date (minimal, single row layout)
import Image from 'next/image'
import { GraduationCap } from 'lucide-react'
import type { Certificate } from '@/types'

const ISSUER_STYLES: Record<string, { label: string; color: string }> = {
  coursera: { label: 'Coursera', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  udemy: { label: 'Udemy', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  freecodecamp: { label: 'freeCodeCamp', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
}

function formatDate(dateStr: string): string {
  // Parse as UTC to avoid timezone off-by-one (e.g. "2025-02-10" shifting to Jan in UTC- zones)
  const [year, month] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, 15))
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

interface CertificateCardProps {
  certificate: Certificate
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const { title, issuer, issueDate, credentialUrl, image, issuerIcon } = certificate
  const style = issuerIcon ? ISSUER_STYLES[issuerIcon] : undefined

  const card = (
    <div className="group w-56 shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-foreground/20 hover:bg-muted/30">
      {/* Thumbnail — only show for local/API images (starts with / or /api/) */}
      {image && image.startsWith('/') ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="224px"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted">
          <GraduationCap className="size-8 text-muted-foreground/40" />
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        {/* Issuer badge */}
        {style ? (
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${style.color}`}>
            {style.label}
          </span>
        ) : (
          <span className="text-[10px] font-medium text-muted-foreground">{issuer}</span>
        )}

        {/* Title */}
        <h3 className="mt-1 text-xs font-medium leading-tight text-foreground line-clamp-2">
          {title}
        </h3>

        {/* Date */}
        <p className="mt-1 text-[10px] text-muted-foreground">
          {formatDate(issueDate)}
        </p>
      </div>
    </div>
  )

  // Wrap entire card in verify link if available
  if (credentialUrl) {
    return (
      <a
        href={credentialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={`View ${title} credential`}
      >
        {card}
      </a>
    )
  }

  return card
}
