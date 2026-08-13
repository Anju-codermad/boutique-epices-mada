import { CertificationType, Prisma } from '@prisma/client';

const productListSelect = {
  id: true,
  name: true,
  slug: true,
  certifications: true,
  isNew: true,
  category: { select: { name: true, slug: true } },
  variants: {
    select: { id: true, priceTtcCents: true, stock: true, weightGrams: true },
    orderBy: { priceTtcCents: 'asc' as const },
  },
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
  // Variante par défaut pour l'ajout rapide : la moins chère parmi celles en stock,
  // sinon la moins chère tout court (désactivée côté UI si le produit est épuisé).
  const defaultVariant = product.variants.find((v) => v.stock > 0) ?? product.variants[0] ?? null;

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
    defaultVariant: defaultVariant
      ? {
          id: defaultVariant.id,
          priceTtcCents: defaultVariant.priceTtcCents,
          stock: defaultVariant.stock,
          weightGrams: defaultVariant.weightGrams,
        }
      : null,
  };
}

export { productListSelect };

export function isValidCertification(value: string): value is CertificationType {
  return (Object.values(CertificationType) as string[]).includes(value);
}
