'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { OrderStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendShippingNotificationEmail, sendRefundConfirmationEmail } from '@/lib/emails';
import { requireAdmin } from '@/lib/admin';

const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUNDED',
  'CANCELLED',
] as const;

const updateOrderSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  trackingNumber: z.string().trim().max(100).optional(),
  carrier: z.string().trim().max(100).optional(),
});

export async function updateOrder(orderId: string, formData: FormData) {
  await requireAdmin();

  const parsed = updateOrderSchema.safeParse({
    status: formData.get('status'),
    trackingNumber: formData.get('trackingNumber') || undefined,
    carrier: formData.get('carrier') || undefined,
  });

  if (!parsed.success) {
    throw new Error('Formulaire invalide');
  }

  const existing = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { user: { select: { email: true } }, items: true },
  });

  const { status, trackingNumber, carrier } = parsed.data;
  const recipientEmail = existing.user?.email ?? existing.guestEmail;

  if (status === 'REFUNDED') {
    // Le remboursement engage de l'argent réel : jamais un simple changement de statut,
    // toujours un vrai appel Stripe (jamais fait deux fois grâce au garde ci-dessous).
    if (existing.status !== 'REFUNDED') {
      if (!existing.stripePaymentIntentId) {
        throw new Error(
          'Impossible de rembourser : aucun paiement Stripe associé à cette commande.'
        );
      }

      await stripe.refunds.create({
        payment_intent: existing.stripePaymentIntentId,
        amount: existing.totalTtcCents,
      });

      await prisma.$transaction([
        ...existing.items.map((item) =>
          prisma.variant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          })
        ),
        prisma.order.update({
          where: { id: orderId },
          data: { status: 'REFUNDED', trackingNumber, carrier },
        }),
      ]);

      if (recipientEmail) {
        await sendRefundConfirmationEmail(recipientEmail, {
          orderId: existing.id,
          refundedAmountCents: existing.totalTtcCents,
        }).catch((error) => {
          console.error("Échec de l'envoi de l'email de remboursement", error);
        });
      }
    }

    revalidatePath('/admin/commandes');
    return;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      trackingNumber,
      carrier,
      deliveredAt:
        status === 'DELIVERED' && existing.status !== 'DELIVERED' ? new Date() : undefined,
    },
  });

  const justShipped = status === 'SHIPPED' && existing.status !== 'SHIPPED';

  if (justShipped && trackingNumber && carrier && recipientEmail) {
    await sendShippingNotificationEmail(recipientEmail, {
      orderId: updated.id,
      trackingNumber,
      carrier,
    });
  }

  revalidatePath('/admin/commandes');
}

export type { OrderStatus };
