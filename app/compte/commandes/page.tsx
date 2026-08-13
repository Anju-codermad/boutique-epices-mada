import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { formatPriceTtc, orderStatusLabels } from '@/lib/orders';

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
        </li>
      ))}
    </ul>
  );
}
