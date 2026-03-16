'use client'

import { useState, useEffect } from 'react'
import { Share2, Linkedin, Facebook, Twitter } from 'lucide-react'
import { CopyLinkButton } from './copy-link-button'

interface ShareButtonsProps {
  title: string
  url: string
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [canNativeShare, setCanNativeShare] = useState(false)
  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)

  // Detect native share support on client only (avoids SSR mismatch)
  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && 'share' in navigator)
  }, [])

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url })
    } catch {
      // User cancelled or not supported
    }
  }

  const linkClass =
    'inline-flex items-center justify-center rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Share:</span>

      {canNativeShare && (
        <button
          onClick={handleNativeShare}
          type="button"
          className={`cursor-pointer ${linkClass}`}
          aria-label="Share"
        >
          <Share2 className="size-4" />
        </button>
      )}

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label="Share on X (Twitter)"
      >
        <Twitter className="size-4" />
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="size-4" />
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label="Share on Facebook"
      >
        <Facebook className="size-4" />
      </a>

      <CopyLinkButton url={url} />
    </div>
  )
}
