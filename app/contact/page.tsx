import type { Metadata } from 'next';

import { Phone } from 'lucide-react';

import { ContactForm } from '@/components/shared/ContactForm';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Une question sur nos épices, votre commande ou une collaboration ? Contactez l'équipe de la Boutique d'épices de Madagascar.",
};

export default function ContactPage() {
  return (
    <main className="container max-w-3xl py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Contact</h1>
      <p className="mt-2 text-muted-foreground">
        Une question sur nos produits, votre commande ou notre démarche ? Écrivez-nous, nous vous
        répondons rapidement.
      </p>
      <p className="mt-4 flex items-center gap-2 text-foreground">
        <Phone className="h-4 w-4 text-terracotta" aria-hidden="true" />
        Par téléphone :{' '}
        <a href={CONTACT_PHONE_HREF} className="font-medium text-terracotta hover:underline">
          {CONTACT_PHONE_DISPLAY}
        </a>
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </main>
  );
}
