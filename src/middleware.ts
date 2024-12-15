import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isApiRoute = req.nextUrl.pathname.startsWith('/api')

    console.log('Middleware check:', {
      path: req.nextUrl.pathname,
      isAuth,
      isAuthPage
    })

    // Skip middleware for API routes
    if (isApiRoute) {
      return NextResponse.next()
    }

    // If user is on an auth page but already authenticated,
    // redirect to dashboard
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // If user is not authenticated and not on an auth page,
    // redirect to login
    if (!isAuth && !isAuthPage) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Allow the request to proceed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log('Auth callback token:', token)
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/dashboard/:path*',
    '/auth/:path*'
  ]
}
