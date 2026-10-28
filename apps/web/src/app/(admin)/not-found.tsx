import Link from 'next/link'

export default function AdminNotFound() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">That admin page does not exist.</p>
      <Link href="/admin" className="text-sm underline">
        Back to the dashboard
      </Link>
    </div>
  )
}
