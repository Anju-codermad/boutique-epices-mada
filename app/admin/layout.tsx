import type { Metadata } from 'next';
import Link from 'next/link';

import { auth } from '@/auth';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Administration',
  robots: NOINDEX_ROBOTS,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return children;
  }

  return (
    <>
      <nav
        aria-label="Navigation admin"
        className="border-b border-border bg-muted/40 py-3 text-sm"
      >
        <div className="container flex gap-6">
          <Link href="/admin/produits" className="hover:text-terracotta">
            Produits
          </Link>
          <Link href="/admin/commandes" className="hover:text-terracotta">
            Commandes
          </Link>
          <Link href="/admin/avis" className="hover:text-terracotta">
            Avis
          </Link>
        </div>
      </nav>
      {children}
    </>
  );
}
