import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${playfairDisplay.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
