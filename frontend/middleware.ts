import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const isProd = process.env.NODE_ENV === 'production'
  

  
  // Normalize secret path: ensure leading '/', remove trailing '/'
  const rawSecret = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'
  let secretPath = rawSecret.startsWith('/') ? rawSecret : `/${rawSecret}`
  if (secretPath.length > 1 && secretPath.endsWith('/')) secretPath = secretPath.slice(0, -1)
  const devFallbackSecret = '/a-9f3d2-super-panel'
  const candidateSecrets = new Set<string>([secretPath])
  if (!isProd && secretPath === '/admin') {
    candidateSecrets.add(devFallbackSecret)
  }

  if (isProd) {
    // Hide default /admin in production
    if (url.pathname.startsWith('/admin') && ![...candidateSecrets].some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) {
      return new NextResponse(null, { status: 404 })
    }

    // Rewrite secret path to real admin route and add noindex
    const match = [...candidateSecrets].find((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))
    if (match) {
      const rewriteUrl = url.clone()
      // Map secret prefix to /admin prefix preserving any subpath
      const suffix = url.pathname.slice(match.length)
      rewriteUrl.pathname = `/admin${suffix}`
      const res = NextResponse.rewrite(rewriteUrl)
      res.headers.set('X-Robots-Tag', 'noindex, nofollow')
      return res
    }
  }

  // In development: allow testing secretPath rewrite without hiding /admin
  if (!isProd) {
    // If a secret path is configured, block direct /admin to mimic prod
    if (secretPath !== '/admin' && url.pathname.startsWith('/admin') && !(url.pathname === secretPath || url.pathname.startsWith(`${secretPath}/`))) {
      return new NextResponse(null, { status: 404 })
    }
    const match = [...candidateSecrets].find((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))
    if (match) {
      const rewriteUrl = url.clone()
      const suffix = url.pathname.slice(match.length)
      rewriteUrl.pathname = `/admin${suffix}`
      return NextResponse.rewrite(rewriteUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};