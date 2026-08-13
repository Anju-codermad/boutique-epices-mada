'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-serif text-6xl font-bold text-terracotta">Oups</p>
      <h1 className="mt-4 font-serif text-2xl font-bold text-forest">Une erreur est survenue</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Quelque chose s&apos;est mal passé de notre côté. Vous pouvez réessayer, ou revenir plus
        tard.
      </p>
      <Button variant="primary" className="mt-6" onClick={() => reset()}>
        Réessayer
      </Button>
    </main>
  );
}
