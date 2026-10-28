import { NextRequest, NextResponse } from 'next/server'

const KNOWN_PUBLIC =
  /^\/(?:$|about|projects|blog|diary|design|feed\.xml|robots\.txt|sitemap\.xml|icon\.svg|favicon\.ico|api(?:\/|$)|blog\/|diary\/)/

/**
 * Admin auth runs here; unknown public URLs get a 404 status while still rendering
 * the public catch-all + (public)/not-found page (200 body with shell).
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

    return NextResponse.next()
  }

  if (!KNOWN_PUBLIC.test(pathname)) {
    return NextResponse.next({ status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|feed.xml).*)',
  ],
}
