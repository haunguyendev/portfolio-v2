import { gqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import Link from 'next/link'
import { DataTable } from '@/components/admin/data-table'
import { Plus, Pencil } from 'lucide-react'

const CERTIFICATES_QUERY = gql`
  query Certificates {
    certificates {
      id title issuer issueDate published sortOrder
    }
  }
`

interface CertificateRow {
  id: string; title: string; issuer: string
  issueDate: string; published: boolean; sortOrder: number
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export const revalidate = 0

export default async function AdminCertificatesPage() {
  let certificates: CertificateRow[] = []

  try {
    const data = await gqlClient.request<{ certificates: CertificateRow[] }>(CERTIFICATES_QUERY)
    certificates = data.certificates
  } catch {
    // API not available
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Certificates</h1>
        <Link href="/admin/certificates/new" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="size-4" />New Certificate</Link>
      </div>

      <DataTable
        data={certificates}
        columns={[
          {
            key: 'title', header: 'Title',
            cell: (c) => (
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-muted-foreground">{c.issuer}</div>
              </div>
            ),
          },
          { key: 'issueDate', header: 'Date', cell: (c) => <span className="text-sm">{formatDate(c.issueDate)}</span> },
          {
            key: 'published', header: 'Status',
            cell: (c) => c.published
              ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">Published</span>
              : <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">Draft</span>,
          },
          {
            key: 'actions', header: '', className: 'w-20',
            cell: (c) => (
              <Link href={`/admin/certificates/${c.id}/edit`} className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"><Pencil className="size-3.5" /></Link>
            ),
          },
        ]}
        emptyMessage="No certificates yet."
      />
    </div>
  )
}
