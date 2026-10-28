'use client'

import { ErrorView } from '@/components/layout/error-view'

export default function ErrorPage(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorView {...props} />
}
