'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export function Logo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — render placeholder until mounted
  useEffect(() => setMounted(true), [])

  const logoSrc = mounted && resolvedTheme === 'dark'
    ? '/logo/logo-dark.svg'
    : '/logo/logo-light.svg'

  return (
    <Link href="/" className="flex items-center">
      {!mounted ? (
        // Placeholder to prevent layout shift during hydration
        <div className="h-10 w-[180px]" />
      ) : (
        <Image
          src={logoSrc}
          alt="haunguyen.dev"
          width={180}
          height={40}
          className="h-10 w-auto"
          priority
        />
      )}
    </Link>
  )
}
