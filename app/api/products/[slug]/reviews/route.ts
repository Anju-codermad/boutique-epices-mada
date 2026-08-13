import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(2000),
});

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Avis invalide', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: {
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      productId: product.id,
      userId: session.user.id,
      status: 'PENDING',
    },
  });

  return NextResponse.json({ id: review.id, status: review.status }, { status: 201 });
}
