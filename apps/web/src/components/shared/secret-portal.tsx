'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const SECRET_CODE = 'toilahaune'

/** Hidden keyboard shortcut — type the secret code on any public page to access admin */
export function SecretPortal() {
  const router = useRouter()
  const pathname = usePathname()
  const bufferRef = useRef('')

  useEffect(() => {
    // Only active on public pages, not admin
    if (pathname.startsWith('/admin')) return

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      bufferRef.current += e.key.toLowerCase()

      // Keep buffer trimmed to code length
      if (bufferRef.current.length > SECRET_CODE.length) {
        bufferRef.current = bufferRef.current.slice(-SECRET_CODE.length)
      }

      if (bufferRef.current === SECRET_CODE) {
        bufferRef.current = ''
        router.push('/admin')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pathname, router])

  return null
}
