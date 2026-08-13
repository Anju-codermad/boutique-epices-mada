import type { Metadata } from 'next';

import { LegalReviewNotice } from '@/components/shared/LegalReviewNotice';

export const metadata: Metadata = {
  title: "Mentions légales — Boutique d'épices de Madagascar",
};

export default function MentionsLegalesPage() {
  return (
    <main className="container max-w-3xl py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Mentions légales</h1>
      <LegalReviewNotice />

      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">Éditeur du site</h2>
          <p>
            [Raison sociale à compléter]
            <br />
            [Forme juridique] au capital de [montant]€
            <br />
            Siège social : [adresse à compléter]
            <br />
            SIRET : [numéro à compléter]
            <br />
            Numéro de TVA intracommunautaire : [numéro à compléter]
            <br />
            Directeur de la publication : [nom à compléter]
            <br />
            Contact : voir la page{' '}
            <a href="/contact" className="text-terracotta hover:underline">
              Contact
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">Hébergement</h2>
          <p>
            Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789,
            États-Unis.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus présents sur le site (textes, images, logos, mise en page)
            est protégé par le droit de la propriété intellectuelle. Toute reproduction,
            représentation ou diffusion, en tout ou partie, sans autorisation préalable, est
            interdite.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">
            Origine et conformité des produits
          </h2>
          <p>
            Les épices commercialisées sur ce site sont importées de Madagascar. La conformité aux
            exigences d&apos;étiquetage et d&apos;enregistrement sanitaire applicables à
            l&apos;import et à la vente de denrées alimentaires au sein de l&apos;Union européenne
            est en cours de vérification auprès des organismes compétents.
          </p>
        </section>
      </div>
    </main>
  );
}
