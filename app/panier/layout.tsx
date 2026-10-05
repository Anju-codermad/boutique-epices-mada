import type { Metadata } from 'next';

import { NOINDEX_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Panier',
  robots: NOINDEX_ROBOTS,
};

export default function PanierLayout({ children }: { children: React.ReactNode }) {
  return children;
}
