import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { CertificationType, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { isValidCertification, productListSelect, serializeProductListItem } from '@/lib/products';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
  category: z.string().trim().min(1).optional(),
  certification: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  q: z.string().trim().min(1).max(100).optional(),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Paramètres de requête invalides', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { page, pageSize, category, certification, minPrice, maxPrice, q } = parsed.data;

  if (certification !== undefined && !isValidCertification(certification)) {
    return NextResponse.json({ error: 'Certification inconnue' }, { status: 400 });
  }
  const validCertification = certification as CertificationType | undefined;

  const where: Prisma.ProductWhereInput = {
    ...(category ? { category: { slug: category } } : {}),
    ...(validCertification ? { certifications: { has: validCertification } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          variants: {
            some: {
              ...(minPrice !== undefined ? { priceTtcCents: { gte: minPrice } } : {}),
              ...(maxPrice !== undefined ? { priceTtcCents: { lte: maxPrice } } : {}),
            },
          },
        }
      : {}),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: productListSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    products: products.map(serializeProductListItem),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}
