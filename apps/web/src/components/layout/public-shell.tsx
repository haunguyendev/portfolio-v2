import type { ReactNode } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="h-1 gradient-accent" aria-hidden="true" />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
