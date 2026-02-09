// middleware.ts — Server-side route protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.get('is_logged_in')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // --- Protect /admin routes: only ADMIN allowed ---
  if (pathname.startsWith('/admin')) {
    if (isLoggedIn !== 'true') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'ADMIN') {
      // Members trying to access admin → redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // --- Protect /dashboard routes: only USER (member) allowed ---
  if (pathname.startsWith('/dashboard')) {
    if (isLoggedIn !== 'true') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole === 'ADMIN') {
      // Admins trying to access member dashboard → redirect to admin
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
