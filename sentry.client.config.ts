import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Pas de session replay pour l'instant (coût et vie privée) — à activer explicitement
  // plus tard si besoin, avec une politique de confidentialité mise à jour en conséquence.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});
