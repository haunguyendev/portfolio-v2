import Link from 'next/link'
import { Navigation } from '@/components/layout/navigation'
import { MobileNav } from '@/components/layout/mobile-nav'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
      <div className="container-main flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold text-zinc-900 transition-colors hover:text-zinc-700"
        >
          Kane Nguyen
        </Link>

        <Navigation />
        <MobileNav />
      </div>
    </header>
  )
}
