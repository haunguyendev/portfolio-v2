import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for admin route protection.
 * Checks for Better Auth session token cookie before allowing access to /admin/* routes.
 *
 * Note: This runs on the Edge runtime, so we can only check cookie existence.
 * Full session verification happens in route handlers when pages load.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page through
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Protect all /admin/* routes
  if (pathname.startsWith('/admin')) {
    // Check for session token cookie (supports both secure and non-secure variants)
    const sessionToken =
      request.cookies.get('better-auth.session_token')?.value ??
      request.cookies.get('__Secure-better-auth.session_token')?.value

    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Cookie exists - let request through
    // Full session validation happens server-side in page components
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
