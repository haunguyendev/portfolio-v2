'use client'

import dynamic from 'next/dynamic'
import { Navigation } from '@/components/layout/navigation'
import { MobileNav } from '@/components/layout/mobile-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Logo } from '@/components/layout/logo'

const CommandMenu = dynamic(
  () => import('@/components/layout/command-menu').then(m => ({ default: m.CommandMenu })),
  { ssr: false, loading: () => <button className="h-9 w-9 rounded-md border border-border" /> }
)

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container-main flex h-16 items-center justify-between">
        <Logo />

        <div className="flex items-center gap-2">
          <Navigation />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <CommandMenu />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
