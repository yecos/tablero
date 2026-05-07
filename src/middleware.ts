import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple auth check - redirect unauthenticated users to login
  // For now, allow all requests through (auth will be handled by API routes)
  return NextResponse.next();
}

export const config = {
  matcher: ['/spaces/:path*'],
};
