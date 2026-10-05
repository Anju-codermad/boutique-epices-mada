import { withSentryConfig } from '@sentry/nextjs';

// CSP volontairement permissive sur script-src/style-src ('unsafe-inline', pas de nonce) :
// une politique stricte à base de nonces nécessite de générer le nonce dans le middleware
// (aujourd'hui limité aux routes /compte et /admin) et de la vérifier contre un vrai
// déploiement avant d'être fiable — prévu en durcissement post-lancement plutôt que livré
// ici sans pouvoir le valider en conditions réelles. Les autres directives (object-src,
// frame-ancestors, form-action, base-uri) apportent déjà une protection réelle contre
// l'injection de scripts/frames tiers et le détournement de formulaire.
// plausible.io : script d'analytics (voir app/layout.tsx) — sans effet si
// NEXT_PUBLIC_PLAUSIBLE_DOMAIN n'est pas défini, donc autorisé même si inutilisé.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://plausible.io",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://plausible.io",
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
    // L'optimiseur d'images natif de Next (sharp, binaire natif) ne fonctionne pas dans le
    // runtime Cloudflare Workers. Le binding Cloudflare Images permettrait de la réactiver,
    // mais dépend du plan Cloudflare du compte (non vérifiable depuis cet environnement) —
    // voir https://opennext.js.org/cloudflare/howtos/image. En attendant, `next/image` reste
    // utilisé partout (conforme à la règle CLAUDE.md) pour le lazy loading et le layout, mais
    // sert les images telles quelles plutôt que de les retailler/convertir côté serveur.
    unoptimized: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
  // Empêche webpack de bundler Prisma (require dynamiques, moteur wasm/natif) : résolu tel
  // quel depuis node_modules à l'exécution, par chaque environnement selon ses propres règles
  // (Node.js en local, le re-bundling esbuild d'OpenNext pour Cloudflare Workers — voir
  // lib/prisma.ts). Tenter de laisser webpack le bundler lui-même menait à une incohérence de
  // chemin entre où le fichier .wasm était écrit et où le code généré le cherchait.
  serverExternalPackages: ['@prisma/client'],
  webpack: (config, { isServer }) => {
    // `.prisma/client` a un nom de package généré (hash), qui ne correspond jamais à une
    // entrée `serverExternalPackages` littérale : on externalise donc explicitement la
    // requête exacte importée par lib/prisma.ts (voir son commentaire). Au-delà de ce point
    // précis, toute la résolution (import conditionnel `#wasm-compiler-loader`, import
    // statique du .wasm) se fait nativement par Node/esbuild selon l'environnement cible,
    // sans que webpack n'ait besoin de comprendre le wasm lui-même.
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        '.prisma/client/wasm.js',
      ];
    }
    return config;
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
