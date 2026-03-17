'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { signOut, useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export function AdminHeader() {
  const router = useRouter()
  const { data: session } = useSession()

  async function handleLogout() {
    await signOut()
    router.push('/admin/login')
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div />
      <div className="flex items-center gap-3">
        {session?.user && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="size-4" />
            {session.user.name ?? session.user.email}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </header>
  )
}
