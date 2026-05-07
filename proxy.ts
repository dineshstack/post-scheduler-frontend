import { NextRequest, NextResponse } from 'next/server'

/**
 * proxy.ts - Next.js 16.2.4
 *
 * Replaces middleware.ts. Runs in the Node.js runtime on every request.
 *
 * Responsibilities:
 * 1. Redirect unauthenticated users away from protected routes -> /auth/login
 * 2. Redirect already-authenticated users away from auth pages -> /dashboard
 * 3. Attach the Bearer token to outbound API requests (optional - Axios
 *    interceptor also handles this, but belt-and-suspenders here)
 */

const PROTECTED_PREFIXES = ['/dashboard', '/settings', '/compose']
const AUTH_PAGES         = ['/auth/login', '/auth/register']

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // Read the Passport token from the httpOnly cookie set at login
  const token = request.cookies.get('scheduler_token')?.value

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthPage  = AUTH_PAGES.some((p) => pathname.startsWith(p))

  // Guard: unauthenticated -> redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Guard: authenticated -> redirect away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Run on all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public assets
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|ico|css|js)$).*)',
  ],
}
