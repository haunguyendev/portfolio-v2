'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main navigation"
      className="hidden items-center gap-6 md:flex"
    >
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-foreground',
            pathname === link.href ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
