import { CertificationType, Prisma } from '@prisma/client';

const productListSelect = {
  id: true,
  name: true,
  slug: true,
  certifications: true,
  isNew: true,
  category: { select: { name: true, slug: true } },
  variants: { select: { priceTtcCents: true, stock: true } },
  images: {
    orderBy: { position: 'asc' as const },
    take: 1,
    select: { url: true, alt: true },
  },
} satisfies Prisma.ProductSelect;

type ProductListRow = Prisma.ProductGetPayload<{ select: typeof productListSelect }>;

export function serializeProductListItem(product: ProductListRow) {
  const prices = product.variants.map((v) => v.priceTtcCents);
  const disponible = product.variants.some((v) => v.stock > 0);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    certifications: product.certifications,
    isNew: product.isNew,
    disponible,
    minPriceTtcCents: prices.length > 0 ? Math.min(...prices) : null,
    maxPriceTtcCents: prices.length > 0 ? Math.max(...prices) : null,
    category: product.category,
    image: product.images[0] ?? null,
  };
}

export { productListSelect };

export function isValidCertification(value: string): value is CertificationType {
  return (Object.values(CertificationType) as string[]).includes(value);
}
