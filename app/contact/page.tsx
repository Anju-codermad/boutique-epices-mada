import type { Metadata } from 'next';

import { ContactForm } from '@/components/shared/ContactForm';

export const metadata: Metadata = {
  title: "Contact — Boutique d'épices de Madagascar",
};

export default function ContactPage() {
  return (
    <main className="container max-w-3xl py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Contact</h1>
      <p className="mt-2 text-muted-foreground">
        Une question sur nos produits, votre commande ou notre démarche ? Écrivez-nous, nous vous
        répondons rapidement.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </main>
  );
}
