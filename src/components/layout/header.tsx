import Link from 'next/link'
import { Navigation } from '@/components/layout/navigation'
import { MobileNav } from '@/components/layout/mobile-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { CommandMenu } from '@/components/layout/command-menu'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container-main flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold text-foreground transition-colors hover:text-foreground/80"
        >
          Kane Nguyen
        </Link>

        <div className="flex items-center gap-1">
          <Navigation />
          <ThemeToggle />
          <CommandMenu />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
