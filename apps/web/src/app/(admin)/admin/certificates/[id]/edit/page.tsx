import { gqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import { notFound } from 'next/navigation'
import { CertificateForm } from '@/components/admin/certificate-form'

const CERTIFICATE_QUERY = gql`
  query Certificate($id: ID!) {
    certificate(id: $id) {
      id title issuer issueDate credentialUrl image issuerIcon sortOrder published
    }
  }
`

export const revalidate = 0

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let data: {
    certificate: {
      id: string; title: string; issuer: string; issueDate: string
      credentialUrl?: string; image?: string; issuerIcon?: string
      sortOrder: number; published: boolean
    } | null
  }

  try {
    data = await gqlClient.request(CERTIFICATE_QUERY, { id })
  } catch {
    notFound()
  }

  if (!data.certificate) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Certificate</h1>
      <CertificateForm initialData={data.certificate} />
    </div>
  )
}
