'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const infoSchema = z.object({
  name: z.string().trim().min(1).max(200),
});

export async function updatePersonalInfo(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Non authentifié');
  }

  const parsed = infoSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) {
    throw new Error('Nom invalide');
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  });

  revalidatePath('/compte/informations');
}
