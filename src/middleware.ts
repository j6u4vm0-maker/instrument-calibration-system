import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key_for_development_only';
const key = new TextEncoder().encode(SECRET_KEY);

// Routes that don't require authentication
const publicRoutes = ['/login'];
const staticAssetPrefixes = ['/_next', '/favicon.ico', '/images', '/public'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass static files and API routes if needed
  if (staticAssetPrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for session token
  const sessionToken = request.cookies.get('session')?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify the token
    await jwtVerify(sessionToken, key);
    return NextResponse.next();
  } catch (error) {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    response.cookies.delete('role');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - all media files (svg, png, jpg, webm, mp4, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)).*)',
  ],
};
