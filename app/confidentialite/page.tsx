import type { Metadata } from 'next';

import { LegalReviewNotice } from '@/components/shared/LegalReviewNotice';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
};

export default function ConfidentialitePage() {
  return (
    <main className="container max-w-3xl py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Politique de confidentialité</h1>
      <LegalReviewNotice />

      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">
            1. Responsable du traitement
          </h2>
          <p>
            [Raison sociale à compléter] est responsable du traitement des données personnelles
            collectées sur ce site, conformément au Règlement général sur la protection des données
            (RGPD).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">2. Données collectées</h2>
          <p>Selon votre utilisation du site, nous collectons :</p>
          <ul className="ml-6 list-disc space-y-1">
            <li>
              <strong>Compte et commandes</strong> : email, nom, adresses de livraison, historique
              de commandes, pour la gestion de votre compte et le traitement de vos achats.
            </li>
            <li>
              <strong>Newsletter</strong> : votre adresse email, avec double confirmation
              d&apos;inscription (double opt-in), pour l&apos;envoi de nos actualités. Vous pouvez
              vous désinscrire à tout moment via le lien présent dans chaque email.
            </li>
            <li>
              <strong>Avis clients</strong> : votre nom (ou pseudonyme) et le contenu de votre avis,
              publié après modération, associé à votre compte.
            </li>
            <li>
              <strong>Navigation</strong> : mesure d&apos;audience anonymisée et sans cookie (voir
              section 6 « Cookies »).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">
            3. Finalités et bases légales
          </h2>
          <p>
            Ces données sont traitées pour l&apos;exécution du contrat de vente (commandes,
            livraison), sur la base de votre consentement (newsletter), ou pour notre intérêt
            légitime (amélioration du service, prévention de la fraude, mesure d&apos;audience
            anonymisée).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">4. Durée de conservation</h2>
          <p>
            Les données relatives aux commandes sont conservées pendant la durée nécessaire aux
            obligations légales et comptables. Les données de compte sont conservées tant que
            celui-ci est actif. Les inscriptions à la newsletter sont conservées jusqu&apos;à
            désinscription.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">5. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
            d&apos;effacement, de limitation, d&apos;opposition et de portabilité de vos données.
            Vous pouvez exercer ces droits en nous contactant via la page{' '}
            <a href="/contact" className="text-terracotta hover:underline">
              Contact
            </a>
            . Vous disposez également du droit d&apos;introduire une réclamation auprès de la CNIL
            (www.cnil.fr).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">6. Cookies</h2>
          <p>
            Le site utilise uniquement des cookies strictement nécessaires à son fonctionnement
            (maintien de votre connexion). Notre mesure d&apos;audience ne dépose aucun cookie et ne
            collecte aucune donnée permettant de vous identifier individuellement : conformément aux
            recommandations de la CNIL sur les outils exemptés, elle ne nécessite donc pas de
            recueil de votre consentement, et aucun bandeau cookies n&apos;est affiché.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-semibold text-forest">7. Sous-traitants</h2>
          <p>
            Nous faisons appel à des prestataires pour l&apos;hébergement (Vercel), la base de
            données (Supabase), le paiement (Stripe) et l&apos;envoi d&apos;emails (Resend), qui
            traitent vos données pour notre compte dans le respect du RGPD.
          </p>
        </section>
      </div>
    </main>
  );
}
