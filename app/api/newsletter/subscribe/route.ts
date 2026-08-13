import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { sendNewsletterConfirmationEmail } from '@/lib/emails';

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  const { email } = parsed.data;
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

  if (existing?.status === 'CONFIRMED') {
    return NextResponse.json({ message: 'Vous êtes déjà inscrit.' });
  }

  const confirmationToken = randomUUID();

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { confirmationToken, status: 'PENDING' },
    create: { email, confirmationToken, status: 'PENDING' },
  });

  await sendNewsletterConfirmationEmail(email, confirmationToken);

  return NextResponse.json({ message: 'Un email de confirmation vous a été envoyé.' });
}
