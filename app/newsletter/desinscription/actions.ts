'use server';

import { z } from 'zod';

import { prisma } from '@/lib/prisma';

const emailSchema = z.string().trim().toLowerCase().email();

export async function unsubscribeFromNewsletter(formData: FormData) {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) {
    return;
  }

  await prisma.newsletterSubscriber.deleteMany({ where: { email: parsed.data } });
}
