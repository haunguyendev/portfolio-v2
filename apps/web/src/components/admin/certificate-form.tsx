'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { gql } from 'graphql-request'
import { Button } from '@/components/ui/button'
import { getAuthenticatedGqlClient } from '@/lib/graphql-client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { ImageDropzone } from './image-dropzone'

interface CertificateFormProps {
  initialData?: {
    id?: string
    title?: string
    issuer?: string
    issueDate?: string
    credentialUrl?: string
    image?: string
    issuerIcon?: string
    sortOrder?: number
    published?: boolean
  }
}

const CREATE_CERTIFICATE = gql`
  mutation CreateCertificate($input: CreateCertificateInput!) {
    createCertificate(input: $input) { id }
  }
`
const UPDATE_CERTIFICATE = gql`
  mutation UpdateCertificate($id: ID!, $input: UpdateCertificateInput!) {
    updateCertificate(id: $id, input: $input) { id }
  }
`
const DELETE_CERTIFICATE = gql`
  mutation DeleteCertificate($id: ID!) {
    deleteCertificate(id: $id)
  }
`
const EXTRACT_URL = gql`
  mutation ExtractCertificateUrl($url: String!) {
    extractCertificateUrl(url: $url) {
      success title issuer issueDate issuerIcon image error
    }
  }
`

const ISSUER_ICONS = [
  { value: '', label: 'Auto / None' },
  { value: 'coursera', label: 'Coursera' },
  { value: 'udemy', label: 'Udemy' },
  { value: 'freecodecamp', label: 'freeCodeCamp' },
]

/** Convert ISO datetime to YYYY-MM-DD for input[type=date] */
function toDateInput(val?: string): string {
  if (!val) return ''
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toISOString().split('T')[0]
}

export function CertificateForm({ initialData }: CertificateFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [credentialUrl, setCredentialUrl] = useState(initialData?.credentialUrl ?? '')
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [issuer, setIssuer] = useState(initialData?.issuer ?? '')
  const [issueDate, setIssueDate] = useState(toDateInput(initialData?.issueDate))
  const [image, setImage] = useState(initialData?.image ?? '')
  const [issuerIcon, setIssuerIcon] = useState(initialData?.issuerIcon ?? '')
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0)
  const [published, setPublished] = useState(initialData?.published ?? true)
  const [saving, setSaving] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')

  async function handleExtractUrl() {
    if (!credentialUrl.trim()) return
    setExtracting(true)
    try {
      const client = await getAuthenticatedGqlClient()
      const data = await client.request<{
        extractCertificateUrl: {
          success: boolean; title?: string; issuer?: string
          issueDate?: string; issuerIcon?: string; image?: string; error?: string
        }
      }>(EXTRACT_URL, { url: credentialUrl.trim() })

      const result = data.extractCertificateUrl
      if (result.success) {
        if (result.title) setTitle(result.title)
        if (result.issuer) setIssuer(result.issuer)
        if (result.issueDate) setIssueDate(toDateInput(result.issueDate))
        if (result.issuerIcon) setIssuerIcon(result.issuerIcon)
        if (result.image) setImage(result.image)
        // Partial success — platform detected but not all fields
        if (result.error) {
          toast.info(result.error)
        } else {
          toast.success('Fields auto-filled from URL')
        }
      } else {
        toast.warning(result.error || 'Could not extract metadata. Please fill manually.')
      }
    } catch {
      toast.warning('Could not extract metadata. Please fill manually.')
    } finally {
      setExtracting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const client = await getAuthenticatedGqlClient()
      const input = {
        title,
        issuer,
        issueDate: new Date(issueDate).toISOString(),
        credentialUrl: credentialUrl || undefined,
        image: image || undefined,
        issuerIcon: issuerIcon || undefined,
        sortOrder,
        published,
      }

      if (isEdit) {
        await client.request(UPDATE_CERTIFICATE, { id: initialData!.id, input })
      } else {
        await client.request(CREATE_CERTIFICATE, { input })
      }

      toast.success(isEdit ? 'Certificate updated' : 'Certificate created')
      router.push('/admin/certificates')
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this certificate?')) return
    try {
      const client = await getAuthenticatedGqlClient()
      await client.request(DELETE_CERTIFICATE, { id: initialData!.id })
      toast.success('Certificate deleted')
      router.push('/admin/certificates')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'
  const labelCls = 'block text-sm font-medium mb-1'

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {/* URL Auto-fill section */}
      <div className="rounded-lg border border-dashed border-border p-4">
        <label className={labelCls}>Credential URL (optional)</label>
        <div className="flex gap-2">
          <input
            className={inputCls}
            value={credentialUrl}
            onChange={(e) => setCredentialUrl(e.target.value)}
            placeholder="https://coursera.org/verify/..."
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleExtractUrl}
            disabled={extracting || !credentialUrl.trim()}
            className="shrink-0"
          >
            {extracting ? <><Loader2 className="mr-1.5 size-3.5 animate-spin" />Fetching</> : 'Fetch'}
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Paste a Coursera/Udemy link to auto-fill fields below
        </p>
      </div>

      {/* Core fields */}
      <div>
        <label className={labelCls}>Title *</label>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Certificate title" />
      </div>
      <div>
        <label className={labelCls}>Issuer *</label>
        <input className={inputCls} value={issuer} onChange={(e) => setIssuer(e.target.value)} required placeholder="Coursera, Udemy, freeCodeCamp…" />
      </div>
      <div>
        <label className={labelCls}>Issue Date *</label>
        <input type="date" className={inputCls} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
      </div>

      {/* Image */}
      <ImageDropzone
        value={image || null}
        onChange={(url) => setImage(url ?? '')}
        folder="certificates"
        label="Certificate Image"
      />

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Issuer Icon</label>
          <select className={inputCls} value={issuerIcon} onChange={(e) => setIssuerIcon(e.target.value)}>
            {ISSUER_ICONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Sort Order</label>
          <input type="number" className={inputCls} value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="rounded" />
        Published
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}</Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/certificates')}>Cancel</Button>
        {isEdit && (
          <Button type="button" variant="destructive" onClick={handleDelete} className="ml-auto">Delete</Button>
        )}
      </div>
    </form>
  )
}
