import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page through
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Protect all /admin/* routes
  if (pathname.startsWith('/admin')) {
    const sessionToken =
      request.cookies.get('better-auth.session_token')?.value ??
      request.cookies.get('__Secure-better-auth.session_token')?.value

    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verify session with Better Auth API
    const verifyUrl = new URL('/api/auth/get-session', request.url)
    const res = await fetch(verifyUrl.toString(), {
      headers: {
        cookie: request.headers.get('cookie') ?? '',
      },
    })

    if (!res.ok || res.status === 401) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const session = await res.json().catch(() => null)
    if (!session?.user) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
