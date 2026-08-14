import * as Sentry from '@sentry/nextjs';

// Sans SENTRY_DSN (aucun compte Sentry réel configuré pour l'instant), le SDK devient un
// no-op silencieux : rien n'est envoyé, mais l'initialisation ne casse rien.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
