import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAppUrl } from '@/lib/url';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo';
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
  metadataBase: new URL(getAppUrl()),
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-forest focus:px-4 focus:py-2 focus:text-white"
        >
          Aller au contenu principal
        </a>
        <Header
          categories={categories}
          session={
            session?.user
              ? { name: session.user.name ?? null, email: session.user.email ?? null }
              : null
          }
        />
        <div id="main-content">{children}</div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
