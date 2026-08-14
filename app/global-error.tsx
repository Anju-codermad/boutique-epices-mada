'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <main style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', fontWeight: 'bold' }}>Oups</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Une erreur est survenue</h1>
          <p style={{ marginTop: '0.5rem' }}>
            Quelque chose s&apos;est mal passé. Vous pouvez réessayer.
          </p>
          <button type="button" onClick={() => reset()} style={{ marginTop: '1.5rem' }}>
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
