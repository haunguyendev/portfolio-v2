import { CertificateForm } from '@/components/admin/certificate-form'

export default function NewCertificatePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Certificate</h1>
      <CertificateForm />
    </div>
  )
}
