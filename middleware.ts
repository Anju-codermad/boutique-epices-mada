import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

const ADMIN_MAX_SESSION_AGE_SECONDS = 60 * 60 * 2; // 2h — re-authentification plus fréquente qu'en zone client standard

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  const isAccountRoute = nextUrl.pathname.startsWith('/compte');

  if (!session) {
    if (isAdminRoute || isAccountRoute) {
      const signInUrl = new URL('/connexion', nextUrl);
      signInUrl.searchParams.set('callbackUrl', nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }

    const issuedAt = session.iat ?? 0;
    const ageSeconds = Date.now() / 1000 - issuedAt;
    if (ageSeconds > ADMIN_MAX_SESSION_AGE_SECONDS) {
      const signInUrl = new URL('/connexion', nextUrl);
      signInUrl.searchParams.set('callbackUrl', nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/compte/:path*', '/admin/:path*'],
};
