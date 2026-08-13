import type { Metadata } from 'next';

import { LegalReviewNotice } from '@/components/shared/LegalReviewNotice';

export const metadata: Metadata = {
  title: "Conditions générales de vente — Boutique d'épices de Madagascar",
};

export default function CgvPage() {
  return (
    <main className="container max-w-3xl py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Conditions générales de vente</h1>
      <LegalReviewNotice />

      <div className="prose prose-sm max-w-none space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">1. Objet</h2>
          <p>
            Les présentes conditions générales de vente (CGV) régissent les ventes de produits
            réalisées sur le site de la Boutique d&apos;épices de Madagascar (ci-après « le Site »)
            entre [Raison sociale à compléter], et toute personne physique ou morale effectuant un
            achat (ci-après « le Client »). Le Client déclare avoir pris connaissance des présentes
            CGV et les avoir acceptées avant la validation de sa commande.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">2. Produits et prix</h2>
          <p>
            Les produits proposés à la vente sont des épices et coffrets cadeaux d&apos;origine
            malgache, décrits et présentés avec la plus grande exactitude possible sur le Site.
            <strong> Tous les prix sont indiqués en euros, toutes taxes comprises (TTC)</strong>,
            hors frais de livraison, conformément à la réglementation applicable à la vente à
            distance de biens aux consommateurs au sein de l&apos;Union européenne. Les frais de
            livraison sont précisés avant la validation définitive de la commande.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">3. Commande</h2>
          <p>
            Le Client sélectionne les produits de son choix, les ajoute à son panier, puis valide sa
            commande après avoir renseigné les informations de livraison et de paiement requises. La
            commande peut être passée avec ou sans création de compte. La confirmation de commande
            est envoyée par email après validation du paiement.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">4. Paiement</h2>
          <p>
            Le paiement s&apos;effectue en ligne, au moment de la commande, par carte bancaire via
            la solution sécurisée Stripe. Le Site ne stocke aucune donnée de carte bancaire.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">5. Livraison</h2>
          <p>
            Les produits sont livrés à l&apos;adresse indiquée par le Client lors de la commande, en
            France métropolitaine et dans l&apos;Union européenne. Les frais de livraison sont de
            5,90€ TTC, offerts à partir de 49€ TTC d&apos;achat. Les délais de livraison sont
            communiqués à titre indicatif lors de la commande.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">6. Droit de rétractation</h2>
          <p>
            Conformément à la réglementation européenne relative à la vente à distance, le Client
            consommateur dispose d&apos;un délai de <strong>14 jours calendaires</strong> à compter
            de la réception de sa commande pour exercer son droit de rétractation, sans avoir à
            justifier de motif ni à payer de pénalité, à l&apos;exception des frais de retour.
          </p>
          <p>
            Pour exercer ce droit, le Client doit notifier sa décision de rétractation par email ou
            depuis son espace « Mes commandes », puis retourner le ou les produits dans leur état
            d&apos;origine. Le remboursement est effectué dans un délai de 14 jours à compter de la
            réception du retour, via le moyen de paiement utilisé lors de la commande.
          </p>
          <p>
            Conformément à la réglementation, le droit de rétractation ne s&apos;applique pas aux
            biens descellés après livraison qui ne peuvent être renvoyés pour des raisons
            d&apos;hygiène ou de protection de la santé, le cas échéant précisé sur la fiche produit
            concernée.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">
            7. Retours et remboursements
          </h2>
          <p>
            Toute demande de retour doit être initiée depuis l&apos;espace « Mes commandes » du
            Client, dans les 14 jours suivant la livraison. Après validation du retour par nos
            services, le remboursement est effectué sur le moyen de paiement d&apos;origine.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">8. Responsabilité</h2>
          <p>
            [Raison sociale à compléter] ne saurait être tenue responsable de l&apos;inexécution du
            contrat en cas de rupture de stock ou d&apos;indisponibilité du produit, de force
            majeure, de perturbation ou de grève totale ou partielle notamment des services postaux
            et moyens de transport.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">
            9. Droit applicable et litiges
          </h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, le Client peut
            recourir à une médiation de la consommation ou à la plateforme européenne de règlement
            en ligne des litiges. À défaut, les tribunaux français compétents seront saisis.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">10. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGV, le Client peut nous contacter via la
            page{' '}
            <a href="/contact" className="text-terracotta hover:underline">
              Contact
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
