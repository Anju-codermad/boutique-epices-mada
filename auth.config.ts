import type { NextAuthConfig } from 'next-auth';

/**
 * Config Auth.js compatible Edge Runtime (utilisée par middleware.ts).
 * Ne doit importer ni l'adapter Prisma ni le provider Resend : ces
 * dépendances ne fonctionnent pas dans le runtime Edge de Next.js.
 */
export const authConfig = {
  pages: { signIn: '/connexion' },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role;
      session.iat = token.iat;
      return session;
    },
  },
} satisfies NextAuthConfig;
