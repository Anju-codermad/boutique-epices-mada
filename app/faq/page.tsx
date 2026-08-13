import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FAQ — Boutique d'épices de Madagascar",
};

const faqItems = [
  {
    category: 'Livraison',
    questions: [
      {
        question: 'Quels sont les délais et frais de livraison ?',
        answer:
          "Nous livrons en France métropolitaine et dans l'Union européenne. Les frais de livraison s'élèvent à 5,90€ TTC et sont offerts dès 49€ TTC d'achat. Le délai de livraison indicatif est communiqué lors de la commande.",
      },
      {
        question: 'Comment suivre ma commande ?',
        answer:
          'Une fois votre commande expédiée, un numéro de suivi vous est communiqué par email et reste consultable depuis votre espace « Mes commandes ».',
      },
    ],
  },
  {
    category: 'Retours et remboursements',
    questions: [
      {
        question: 'Puis-je retourner un produit ?',
        answer:
          'Conformément à la réglementation européenne, vous disposez de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation. La demande se fait depuis votre espace « Mes commandes ».',
      },
      {
        question: 'Sous quel délai suis-je remboursé ?',
        answer:
          'Une fois votre retour reçu et validé, le remboursement est effectué sous 14 jours sur le moyen de paiement utilisé lors de la commande.',
      },
    ],
  },
  {
    category: 'Origine des produits',
    questions: [
      {
        question: "D'où proviennent vos épices ?",
        answer:
          'Toutes nos épices sont cultivées et récoltées à Madagascar, achetées directement auprès des producteurs sans intermédiaire, dans une logique de commerce équitable.',
      },
    ],
  },
  {
    category: 'Certifications',
    questions: [
      {
        question: 'Que signifient les badges « Bio » et « Équitable » ?',
        answer:
          'Le badge « Bio » indique une culture sans intrants chimiques de synthèse. Le badge « Équitable » indique une relation commerciale directe avec les producteurs, garantissant une juste rémunération.',
      },
    ],
  },
  {
    category: 'Paiement',
    questions: [
      {
        question: 'Quels moyens de paiement acceptez-vous ?',
        answer:
          "Le paiement s'effectue en ligne par carte bancaire, via la solution sécurisée Stripe. Aucune donnée de carte bancaire n'est stockée sur notre site.",
      },
      {
        question: 'Le paiement en ligne est-il sécurisé ?',
        answer:
          "Oui, l'ensemble des transactions est traité par Stripe, un prestataire de paiement certifié PCI-DSS.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="container max-w-3xl py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Questions fréquentes</h1>

      <div className="mt-8 space-y-8">
        {faqItems.map((section) => (
          <div key={section.category}>
            <h2 className="font-serif text-xl font-semibold text-forest">{section.category}</h2>
            <div className="mt-3 space-y-2">
              {section.questions.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-lg border border-border p-4 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                    {item.question}
                    <span className="ml-4 text-muted-foreground group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
