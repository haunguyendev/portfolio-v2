// Horizontal scrolling certificates strip — fetches from API with JSON fallback
import { ChevronRight } from 'lucide-react'
import { apiGetCertificates } from '@/lib/api-client'
import { getCertificates } from '@/lib/content'
import { CertificateCard } from './certificate-card'

export async function CertificatesSection() {
  // Try API first, fallback to static JSON
  let certificates = await apiGetCertificates()
  if (certificates.length === 0) {
    certificates = getCertificates()
  }

  if (certificates.length === 0) return null

  return (
    <section className="mb-12 md:mb-16">
      {/* Header with scroll hint */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Certifications
        </h2>
        {certificates.length > 4 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            Scroll for more <ChevronRight className="size-3" />
          </span>
        )}
      </div>

      {/* Horizontal scroll container */}
      <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:-mx-0 md:px-0">
        {certificates.map((cert) => (
          <CertificateCard key={cert.id} certificate={cert} />
        ))}
      </div>
    </section>
  )
}
