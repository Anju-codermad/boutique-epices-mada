import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Boutique d'épices de Madagascar",
  description:
    'Épices premium de Madagascar — vanille, poivre sauvage, cannelle, curcuma, gingembre, piment. Commerce équitable, vente directe.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, categories] = await Promise.all([
    auth(),
    prisma.category.findMany({ select: { name: true, slug: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <html lang="fr">
      <body className={`${playfairDisplay.variable} ${inter.variable} antialiased`}>
        <Header
          categories={categories}
          session={
            session?.user
              ? { name: session.user.name ?? null, email: session.user.email ?? null }
              : null
          }
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}
