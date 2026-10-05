'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isReturnEligible } from '@/lib/orders';

export async function requestReturn(orderId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Non authentifié');
  }

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

  if (order.userId !== session.user.id) {
    throw new Error('Accès refusé');
  }

  // Jamais de confiance dans un éventuel statut envoyé par le client : on revérifie
  // l'éligibilité (statut + délai de 14 jours) depuis les données en base.
  if (!isReturnEligible(order)) {
    throw new Error('Cette commande n’est plus éligible au retour.');
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'RETURN_REQUESTED' },
  });

  revalidatePath('/compte/commandes');
}
