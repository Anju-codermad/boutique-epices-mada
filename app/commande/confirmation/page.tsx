import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { ClearCartOnMount } from '@/components/shared/ClearCartOnMount';
import { buttonVariants } from '@/components/ui/Button';
import { prisma } from '@/lib/prisma';
import { formatPriceTtc } from '@/lib/format';
import { orderStatusLabels } from '@/lib/orders';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Confirmation de commande',
  robots: NOINDEX_ROBOTS,
};

export default async function ConfirmationCommandePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      address: true,
    },
  });

  if (!order) {
    notFound();
  }

  const isPending = order.status === 'PENDING';

  return (
    <main className="container max-w-2xl py-12">
      <ClearCartOnMount />

      <h1 className="font-serif text-3xl font-bold text-forest">
        {isPending ? 'Paiement en cours de confirmation' : 'Merci pour votre commande !'}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Commande #{order.id.slice(-8)} — {orderStatusLabels[order.status]}
      </p>

      {isPending ? (
        <p className="mt-4 rounded-md bg-muted p-4 text-sm">
          Votre paiement est en cours de traitement. Vous recevrez un email de confirmation dès
          qu&apos;il sera validé — inutile de repasser commande.
        </p>
      ) : (
        <p className="mt-4 text-sm">
          Un email de confirmation vous a été envoyé. Vous recevrez un second email dès
          l&apos;expédition de votre commande.
        </p>
      )}

      <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between p-4 text-sm">
            <span>
              {item.quantity} × {item.variant.product.name} ({item.variant.weightGrams} g)
            </span>
            <span className="font-medium">
              {formatPriceTtc(item.unitPriceTtcCents * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <span>Livraison</span>
          <span>{order.shippingCents === 0 ? 'Offerte' : formatPriceTtc(order.shippingCents)}</span>
        </div>
        {order.discountCents > 0 ? (
          <div className="flex justify-between">
            <span>Remise</span>
            <span>-{formatPriceTtc(order.discountCents)}</span>
          </div>
        ) : null}
        <div className="flex justify-between font-medium">
          <span>Total TTC</span>
          <span>{formatPriceTtc(order.totalTtcCents)}</span>
        </div>
      </div>

      {order.address ? (
        <div className="mt-8 text-sm">
          <h2 className="font-serif font-semibold">Adresse de livraison</h2>
          <p className="mt-1 text-muted-foreground">
            {order.address.fullName}
            <br />
            {order.address.line1}
            <br />
            {order.address.line2 ? (
              <>
                {order.address.line2}
                <br />
              </>
            ) : null}
            {order.address.postalCode} {order.address.city}
            <br />
            {order.address.country}
          </p>
        </div>
      ) : null}

      <Link href="/boutique" className={buttonVariants({ variant: 'primary', className: 'mt-8' })}>
        Continuer mes achats
      </Link>
    </main>
  );
}
