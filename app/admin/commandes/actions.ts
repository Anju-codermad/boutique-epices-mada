'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { OrderStatus } from '@prisma/client';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { sendShippingNotificationEmail } from '@/lib/emails';

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

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Accès refusé');
  }
}

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
    include: { user: { select: { email: true } } },
  });

  const { status, trackingNumber, carrier } = parsed.data;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status, trackingNumber, carrier },
    include: { user: { select: { email: true } } },
  });

  const justShipped = status === 'SHIPPED' && existing.status !== 'SHIPPED';
  const recipientEmail = updated.user?.email ?? updated.guestEmail;

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
