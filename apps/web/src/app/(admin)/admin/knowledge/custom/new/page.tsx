import { CustomDocumentForm } from '@/components/admin/custom-document-form'

export default function NewCustomDocumentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Custom Document</h1>
      <div className="max-w-2xl">
        <CustomDocumentForm />
      </div>
    </div>
  )
}
