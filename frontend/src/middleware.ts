// Auth0 middleware temporarily disabled
// import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'

// export default withMiddlewareAuthRequired()

// Temporary: Allow all routes without authentication
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
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
  ],
}