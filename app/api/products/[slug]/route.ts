import { NextRequest, NextResponse } from 'next/server';

import { getProductDetail } from '@/lib/products';

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const product = await getProductDetail(params.slug);

  if (!product) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  return NextResponse.json(product);
}
