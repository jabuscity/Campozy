import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/signup/form',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/auth/callback',
  '/community',
  '/community/events',
  '/neighborhoods',
]

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/api/')) {
    return response
  }

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|logo.svg|logo.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
