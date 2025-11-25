import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = await auth()
  
  // Protect dashboard routes - require authentication
  if (!session) {
    const signInUrl = new URL('/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(signInUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/agents/:path*',
    '/campaigns/:path*',
    '/calls/:path*',
    '/voice-cloning/:path*',
    '/analytics/:path*',
    '/contacts/:path*',
    '/settings/:path*',
    '/billing/:path*',
    '/rag/:path*',
    '/tools/:path*',
    '/phone-numbers/:path*',
    '/conversations/:path*',
  ],
}