import Link from 'next/link';
import type { Metadata } from 'next';

import { auth } from '@/auth';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Mon compte',
  robots: NOINDEX_ROBOTS,
};

export default async function CompteLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <main className="container py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Mon compte</h1>
      {session?.user?.email ? (
        <p className="mt-1 text-sm text-muted-foreground">{session.user.email}</p>
      ) : null}

      <nav className="mt-6 flex gap-6 border-b border-border pb-4 text-sm">
        <Link href="/compte/commandes" className="hover:text-terracotta">
          Commandes
        </Link>
        <Link href="/compte/adresses" className="hover:text-terracotta">
          Adresses
        </Link>
        <Link href="/compte/informations" className="hover:text-terracotta">
          Informations personnelles
        </Link>
      </nav>

      <div className="mt-8">{children}</div>
    </main>
  );
}
