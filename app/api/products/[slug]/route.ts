import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      certifications: true,
      isNew: true,
      category: { select: { name: true, slug: true } },
      variants: {
        orderBy: { weightGrams: 'asc' },
        select: { id: true, sku: true, weightGrams: true, priceTtcCents: true, stock: true },
      },
      images: {
        orderBy: { position: 'asc' },
        select: { url: true, alt: true, position: true },
      },
      reviews: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  const disponible = product.variants.some((variant) => variant.stock > 0);
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : null;

  return NextResponse.json({
    ...product,
    disponible,
    averageRating,
  });
}
