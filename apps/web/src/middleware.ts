import { NextRequest, NextResponse } from 'next/server'

const KNOWN_PUBLIC =
  /^\/(?:$|about|projects|blog|diary|design|feed\.xml|robots\.txt|sitemap\.xml|icon\.svg|favicon\.ico|api(?:\/|$)|blog\/|diary\/)/

function isKnownAdminPath(pathname: string) {
  if (pathname === '/admin') return true
  if (pathname === '/admin/categories') return true
  if (pathname === '/admin/tags') return true
  if (pathname === '/admin/certificates') return true
  if (pathname === '/admin/certificates/new') return true
  if (/^\/admin\/certificates\/[^/]+\/edit$/.test(pathname)) return true
  if (pathname === '/admin/posts') return true
  if (pathname === '/admin/posts/new') return true
  if (/^\/admin\/posts\/[^/]+\/edit$/.test(pathname)) return true
  if (pathname === '/admin/projects') return true
  if (pathname === '/admin/projects/new') return true
  if (/^\/admin\/projects\/[^/]+\/edit$/.test(pathname)) return true
  if (pathname === '/admin/series') return true
  if (pathname === '/admin/series/new') return true
  if (pathname === '/admin/knowledge') return true
  if (pathname === '/admin/knowledge/custom/new') return true
  if (/^\/admin\/knowledge\/custom\/[^/]+\/edit$/.test(pathname)) return true
  return false
}

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

    if (!isKnownAdminPath(pathname)) {
      return NextResponse.next({ status: 404 })
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
