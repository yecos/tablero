import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/tools'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/tools/'));
  const isApiAuthRoute = pathname.startsWith('/api/auth');
  const isApiPublicRoute = pathname === '/api/ai-status' || pathname === '/api/templates' || pathname.startsWith('/api/templates/');

  // Allow public routes
  if (isPublicRoute || isApiAuthRoute || isApiPublicRoute) {
    return NextResponse.next();
  }

  // Check for auth token on protected routes
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    if (pathname.startsWith('/api/')) {
      // API routes return 401
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    // Page routes redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/spaces/:path*',
    '/api/spaces/:path*',
    '/api/generate-image',
    '/api/generate-video',
    '/api/generate-audio',
    '/api/chat',
    '/api/upscale',
    '/api/image-to-3d',
    '/api/brand-kit',
    '/api/analyze-image',
    '/api/split-image',
    '/api/usage',
  ],
};
