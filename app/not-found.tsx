import Link from 'next/link';

import { buttonVariants } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-serif text-6xl font-bold text-terracotta">404</p>
      <h1 className="mt-4 font-serif text-2xl font-bold text-forest">Page introuvable</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        La page que vous cherchez n&apos;existe pas ou plus. Retournez à la boutique pour continuer
        votre visite.
      </p>
      <Link href="/boutique" className={buttonVariants({ variant: 'primary', className: 'mt-6' })}>
        Retour à la boutique
      </Link>
    </main>
  );
}
