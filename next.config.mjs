import { withSentryConfig } from '@sentry/nextjs';

// CSP volontairement permissive sur script-src/style-src ('unsafe-inline', pas de nonce) :
// une politique stricte à base de nonces nécessite de générer le nonce dans le middleware
// (aujourd'hui limité aux routes /compte et /admin) et de la vérifier contre un vrai
// déploiement Vercel avant d'être fiable — prévu en durcissement post-lancement plutôt que
// livré ici sans pouvoir le valider en conditions réelles. Les autres directives (object-src,
// frame-ancestors, form-action, base-uri) apportent déjà une protection réelle contre
// l'injection de scripts/frames tiers et le détournement de formulaire.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
};

// Sans SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN (aucun compte Sentry réel pour l'instant),
// le plugin d'upload des source maps s'auto-désactive proprement au build (pas d'échec).
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  // Fait transiter les événements Sentry par une route interne (/monitoring) : reste
  // conforme à la CSP `connect-src 'self'` sans avoir à y ajouter le domaine Sentry.
  tunnelRoute: '/monitoring',
  widenClientFileUpload: true,
  webpack: {
    removeDebugLogging: true,
    automaticVercelMonitors: true,
  },
});
