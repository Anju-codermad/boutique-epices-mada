'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const addressSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional(),
  postalCode: z.string().trim().min(1).max(20),
  city: z.string().trim().min(1).max(200),
  country: z.string().trim().min(2).max(2).default('FR'),
  phone: z.string().trim().max(30).optional(),
});

export async function createAddress(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Non authentifié');
  }

  const parsed = addressSchema.safeParse({
    fullName: formData.get('fullName'),
    line1: formData.get('line1'),
    line2: formData.get('line2') || undefined,
    postalCode: formData.get('postalCode'),
    city: formData.get('city'),
    country: formData.get('country') || 'FR',
    phone: formData.get('phone') || undefined,
  });

  if (!parsed.success) {
    throw new Error('Adresse invalide');
  }

  await prisma.address.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  revalidatePath('/compte/adresses');
}

export async function deleteAddress(addressId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Non authentifié');
  }

  await prisma.address.deleteMany({
    where: { id: addressId, userId: session.user.id },
  });

  revalidatePath('/compte/adresses');
}
