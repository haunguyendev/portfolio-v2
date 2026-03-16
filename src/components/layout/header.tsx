import { Navigation } from '@/components/layout/navigation'
import { MobileNav } from '@/components/layout/mobile-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { CommandMenu } from '@/components/layout/command-menu'
import { Logo } from '@/components/layout/logo'

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
