import Link from 'next/link';
import { Phone } from 'lucide-react';

import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from '@/lib/contact';

import { NewsletterForm } from './NewsletterForm';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container grid gap-10 py-12 md:grid-cols-3">
        <div id="newsletter">
          <h2 className="font-serif text-lg font-semibold text-forest">Newsletter</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Recevez nos actualités et nouveautés — pas de spam, désinscription en un clic.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>

        <div>
          <h2 className="font-serif text-lg font-semibold text-forest">Informations légales</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/cgv" className="hover:text-terracotta">
                Conditions générales de vente
              </Link>
            </li>
            <li>
              <Link href="/mentions-legales" className="hover:text-terracotta">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="hover:text-terracotta">
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-terracotta">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-terracotta">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-lg font-semibold text-forest">Nous contacter</h2>
          <a
            href={CONTACT_PHONE_HREF}
            className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-terracotta"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {CONTACT_PHONE_DISPLAY}
          </a>
          <h2 className="mt-6 font-serif text-lg font-semibold text-forest">Suivez-nous</h2>
          <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-terracotta"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-terracotta"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Boutique d&apos;épices de Madagascar. Tous droits réservés.
      </div>
    </footer>
  );
}
