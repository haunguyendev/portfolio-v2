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

  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const sessionToken =
      request.cookies.get('better-auth.session_token')?.value ??
      request.cookies.get('__Secure-better-auth.session_token')?.value

    if (!sessionToken) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
