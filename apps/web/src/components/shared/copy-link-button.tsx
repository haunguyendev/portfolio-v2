'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

interface CopyLinkButtonProps {
  url: string
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={copied ? 'Link copied' : 'Copy link'}
    >
      {copied ? (
        <Check className="size-4 text-green-500" />
      ) : (
        <Link2 className="size-4" />
      )}
    </button>
  )
}
