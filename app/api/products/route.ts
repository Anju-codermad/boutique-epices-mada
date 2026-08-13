import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { CertificationType } from '@prisma/client';

import { isValidCertification, queryProducts, SORT_OPTIONS } from '@/lib/products';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
  category: z.string().trim().min(1).optional(),
  certification: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  q: z.string().trim().min(1).max(100).optional(),
  sort: z.enum(SORT_OPTIONS).default('newest'),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Paramètres de requête invalides', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { certification, ...rest } = parsed.data;

  if (certification !== undefined && !isValidCertification(certification)) {
    return NextResponse.json({ error: 'Certification inconnue' }, { status: 400 });
  }

  const result = await queryProducts({
    ...rest,
    certification: certification as CertificationType | undefined,
  });

  return NextResponse.json(result);
}
