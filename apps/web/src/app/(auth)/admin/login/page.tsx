'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Github } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGitHubLogin() {
    setError('')
    setLoading(true)
    try {
      await signIn.social({
        provider: 'github',
        callbackURL: '/admin',
        errorCallbackURL: '/admin/login?error=unauthorized',
      })
    } catch {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Admin Login</CardTitle>
        <CardDescription>Sign in to manage your portfolio</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGitHubLogin}
          className="w-full"
          disabled={loading}
        >
          <Github className="mr-2 h-4 w-4" />
          {loading ? 'Redirecting...' : 'Continue with GitHub'}
        </Button>
        {urlError === 'unauthorized' && (
          <p className="text-sm text-destructive text-center">
            Access denied. Your GitHub account is not authorized.
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
        <p className="text-xs text-muted-foreground text-center">
          Only authorized GitHub accounts can access.
        </p>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
