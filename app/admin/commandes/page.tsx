import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { formatPriceTtc } from '@/lib/format';
import { orderStatusLabels, returnDeadline } from '@/lib/orders';

import { updateOrder } from './actions';

export default async function AdminCommandesPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  const orders = await prisma.order.findMany({
    where: { status: { not: 'PENDING' } },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { variant: { include: { product: true } } } },
    },
  });

  return (
    <main className="container py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Commandes</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Aucune commande pour le moment.</p>
      ) : (
        <ul className="mt-6 space-y-6">
          {orders.map((order) => (
            <li key={order.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium">Commande #{order.id.slice(-8)}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {order.user?.email ?? order.guestEmail ?? '—'}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR')} —{' '}
                  {formatPriceTtc(order.totalTtcCents)}
                </span>
              </div>

              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} × {item.variant.product.name} ({item.variant.weightGrams} g)
                  </li>
                ))}
              </ul>

              {order.deliveredAt ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Livrée le {new Date(order.deliveredAt).toLocaleDateString('fr-FR')}
                  {order.status === 'DELIVERED' ? (
                    <>
                      {' '}
                      — retour possible jusqu&apos;au{' '}
                      {returnDeadline(order)?.toLocaleDateString('fr-FR')}
                    </>
                  ) : null}
                </p>
              ) : null}

              <form
                action={updateOrder.bind(null, order.id)}
                className="mt-4 flex flex-wrap items-end gap-3"
              >
                <div>
                  <label className="text-xs font-medium" htmlFor={`status-${order.id}`}>
                    Statut
                  </label>
                  <select
                    id={`status-${order.id}`}
                    name="status"
                    defaultValue={order.status}
                    className="mt-1 block rounded-md border border-border px-2 py-1.5 text-sm"
                  >
                    {Object.entries(orderStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium" htmlFor={`tracking-${order.id}`}>
                    Numéro de suivi
                  </label>
                  <input
                    id={`tracking-${order.id}`}
                    name="trackingNumber"
                    defaultValue={order.trackingNumber ?? ''}
                    className="mt-1 block rounded-md border border-border px-2 py-1.5 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium" htmlFor={`carrier-${order.id}`}>
                    Transporteur
                  </label>
                  <input
                    id={`carrier-${order.id}`}
                    name="carrier"
                    defaultValue={order.carrier ?? ''}
                    className="mt-1 block rounded-md border border-border px-2 py-1.5 text-sm"
                  />
                </div>

                <Button type="submit" size="sm">
                  Enregistrer
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
