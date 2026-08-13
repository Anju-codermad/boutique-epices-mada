import type { OrderStatus } from '@prisma/client';

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
