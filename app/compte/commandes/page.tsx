import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { orderStatusLabels, isReturnEligible, returnDeadline } from '@/lib/orders';
import { formatPriceTtc } from '@/lib/format';
import { Button } from '@/components/ui/Button';

import { requestReturn } from './actions';

export default async function CommandesPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { variant: { include: { product: true } } } },
    },
  });

  if (orders.length === 0) {
    return <p className="text-muted-foreground">Vous n&apos;avez pas encore passé de commande.</p>;
  }

  return (
    <ul className="space-y-6">
      {orders.map((order) => (
        <li key={order.id} className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Commande #{order.id.slice(-8)}</span>
            <span className="text-sm text-muted-foreground">{orderStatusLabels[order.status]}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString('fr-FR')} —{' '}
            {formatPriceTtc(order.totalTtcCents)}
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.quantity} × {item.variant.product.name} ({item.variant.weightGrams} g)
              </li>
            ))}
          </ul>
          {order.trackingNumber ? (
            <p className="mt-3 text-sm">
              Suivi de colis :{' '}
              <span className="font-medium">
                {order.trackingNumber}
                {order.carrier ? ` (${order.carrier})` : ''}
              </span>
            </p>
          ) : null}

          {order.status === 'DELIVERED' && isReturnEligible(order) ? (
            <form action={requestReturn.bind(null, order.id)} className="mt-3">
              <p className="text-sm text-muted-foreground">
                Retour possible jusqu&apos;au {returnDeadline(order)?.toLocaleDateString('fr-FR')}{' '}
                (droit de rétractation de 14 jours).
              </p>
              <Button type="submit" variant="outline" size="sm" className="mt-2">
                Demander un retour
              </Button>
            </form>
          ) : null}

          {order.status === 'DELIVERED' && !isReturnEligible(order) ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Délai de rétractation de 14 jours dépassé.
            </p>
          ) : null}

          {order.status === 'RETURN_REQUESTED' ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Retour demandé, en attente de traitement par notre équipe.
            </p>
          ) : null}

          {order.status === 'RETURNED' ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Retour reçu, remboursement en cours.
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
