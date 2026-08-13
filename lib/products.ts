import { CertificationType, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

const productListSelect = {
  id: true,
  name: true,
  slug: true,
  certifications: true,
  isNew: true,
  createdAt: true,
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

export const SORT_OPTIONS = ['newest', 'name_asc', 'price_asc', 'price_desc'] as const;
export type ProductSort = (typeof SORT_OPTIONS)[number];

export interface QueryProductsParams {
  page: number;
  pageSize: number;
  category?: string;
  certification?: CertificationType;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: ProductSort;
}

/**
 * Requête produits partagée entre app/api/products (fetch client) et
 * app/boutique (rendu serveur) pour éviter de dupliquer la construction
 * du `where` et la sérialisation.
 *
 * Le tri par prix (min variante) n'est pas exprimable par un simple
 * `orderBy` Prisma sur une relation to-many : pour un catalogue de cette
 * taille (dizaines de produits), on trie en mémoire plutôt que d'ajouter
 * une colonne dénormalisée.
 */
export async function queryProducts({
  page,
  pageSize,
  category,
  certification,
  minPrice,
  maxPrice,
  q,
  sort = 'newest',
}: QueryProductsParams) {
  const where: Prisma.ProductWhereInput = {
    ...(category ? { category: { slug: category } } : {}),
    ...(certification ? { certifications: { has: certification } } : {}),
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

  if (sort === 'price_asc' || sort === 'price_desc') {
    const all = await prisma.product.findMany({ where, select: productListSelect });
    const serialized = all.map(serializeProductListItem);
    serialized.sort((a, b) => {
      const priceA = a.minPriceTtcCents ?? 0;
      const priceB = b.minPriceTtcCents ?? 0;
      return sort === 'price_asc' ? priceA - priceB : priceB - priceA;
    });

    const total = serialized.length;
    const start = (page - 1) * pageSize;

    return {
      products: serialized.slice(start, start + pageSize),
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'name_asc' ? { name: 'asc' } : { createdAt: 'desc' };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: productListSelect,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    products: products.map(serializeProductListItem),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

const productDetailSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  certifications: true,
  isNew: true,
  categoryId: true,
  category: { select: { name: true, slug: true } },
  variants: {
    orderBy: { weightGrams: 'asc' as const },
    select: { id: true, sku: true, weightGrams: true, priceTtcCents: true, stock: true },
  },
  images: {
    orderBy: { position: 'asc' as const },
    select: { url: true, alt: true, position: true },
  },
  reviews: {
    where: { status: 'APPROVED' as const },
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  },
} satisfies Prisma.ProductSelect;

/**
 * Requête détail produit partagée entre app/api/products/[slug] (fetch
 * client) et app/produits/[slug] (rendu serveur), même logique qu'au
 * Jour 14 pour la liste.
 */
export async function getProductDetail(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: productDetailSelect,
  });

  if (!product) {
    return null;
  }

  const disponible = product.variants.some((variant) => variant.stock > 0);
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : null;

  const { categoryId, ...rest } = product;

  return { ...rest, categoryId, disponible, averageRating };
}

export async function getRelatedProducts(categoryId: string, excludeProductId: string, take = 4) {
  const related = await prisma.product.findMany({
    where: { categoryId, id: { not: excludeProductId } },
    select: productListSelect,
    take,
    orderBy: { createdAt: 'desc' },
  });

  return related.map(serializeProductListItem);
}
