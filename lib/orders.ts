import type { OrderStatus } from '@prisma/client';

import { RETURN_WINDOW_DAYS } from '@/lib/stripe';

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: 'En attente de paiement',
  PAID: 'Payée',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  RETURN_REQUESTED: 'Retour demandé',
  RETURNED: 'Retour reçu',
  REFUNDED: 'Remboursée',
  CANCELLED: 'Annulée',
};

/** Date limite (incluse) pour demander un retour, ou `null` si la commande n'est pas livrée. */
export function returnDeadline(order: {
  status: OrderStatus;
  deliveredAt: Date | null;
}): Date | null {
  if (order.status !== 'DELIVERED' || !order.deliveredAt) {
    return null;
  }
  const deadline = new Date(order.deliveredAt);
  deadline.setDate(deadline.getDate() + RETURN_WINDOW_DAYS);
  return deadline;
}

export function isReturnEligible(order: {
  status: OrderStatus;
  deliveredAt: Date | null;
}): boolean {
  const deadline = returnDeadline(order);
  return deadline !== null && deadline.getTime() >= Date.now();
}
