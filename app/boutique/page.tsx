import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import {
  isValidCertification,
  queryProducts,
  SORT_OPTIONS,
  type ProductSort,
} from '@/lib/products';
import { ProductCard } from '@/components/shared/ProductCard';
import type { CertificationType } from '@prisma/client';

const sortLabels: Record<ProductSort, string> = {
  newest: 'Nouveautés',
  name_asc: 'Nom (A-Z)',
  price_asc: 'Prix croissant',
  price_desc: 'Prix décroissant',
};

interface BoutiqueSearchParams {
  category?: string;
  certification?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  sort?: string;
  page?: string;
}

function buildQueryString(
  params: BoutiqueSearchParams,
  overrides: Partial<Record<keyof BoutiqueSearchParams, string | undefined>>
) {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) {
      search.set(key, value);
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: BoutiqueSearchParams;
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const sort: ProductSort = SORT_OPTIONS.includes(searchParams.sort as ProductSort)
    ? (searchParams.sort as ProductSort)
    : 'newest';
  const certification =
    searchParams.certification && isValidCertification(searchParams.certification)
      ? (searchParams.certification as CertificationType)
      : undefined;
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) * 100 : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) * 100 : undefined;

  const [categories, { products, pagination }] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    queryProducts({
      page,
      pageSize: 12,
      category: searchParams.category || undefined,
      certification,
      minPrice,
      maxPrice,
      q: searchParams.q || undefined,
      sort,
    }),
  ]);

  return (
    <main className="container py-12">
      <h1 className="font-serif text-3xl font-bold text-forest">Boutique</h1>
      {searchParams.q ? (
        <p className="mt-2 text-muted-foreground">
          Résultats pour « {searchParams.q} » ({pagination.total})
        </p>
      ) : null}

      <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]">
        <form method="GET" className="h-fit space-y-6 rounded-lg border border-border p-4 text-sm">
          {searchParams.q ? <input type="hidden" name="q" value={searchParams.q} /> : null}

          <div>
            <label htmlFor="category" className="font-medium">
              Catégorie
            </label>
            <select
              id="category"
              name="category"
              defaultValue={searchParams.category ?? ''}
              className="mt-2 w-full rounded-md border border-border px-2 py-1.5"
            >
              <option value="">Toutes</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="certification" className="font-medium">
              Certification
            </label>
            <select
              id="certification"
              name="certification"
              defaultValue={searchParams.certification ?? ''}
              className="mt-2 w-full rounded-md border border-border px-2 py-1.5"
            >
              <option value="">Toutes</option>
              <option value="BIO">Bio</option>
              <option value="EQUITABLE">Équitable</option>
            </select>
          </div>

          <div>
            <span className="font-medium">Prix TTC (€)</span>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                name="minPrice"
                min={0}
                step={1}
                placeholder="Min"
                defaultValue={searchParams.minPrice ?? ''}
                className="w-1/2 rounded-md border border-border px-2 py-1.5"
              />
              <input
                type="number"
                name="maxPrice"
                min={0}
                step={1}
                placeholder="Max"
                defaultValue={searchParams.maxPrice ?? ''}
                className="w-1/2 rounded-md border border-border px-2 py-1.5"
              />
            </div>
          </div>

          <div>
            <label htmlFor="sort" className="font-medium">
              Trier par
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="mt-2 w-full rounded-md border border-border px-2 py-1.5"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {sortLabels[option]}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark"
          >
            Appliquer
          </button>
          {searchParams.category ||
          searchParams.certification ||
          searchParams.minPrice ||
          searchParams.maxPrice ||
          searchParams.sort ? (
            <Link
              href={searchParams.q ? `/boutique?q=${searchParams.q}` : '/boutique'}
              className="block text-center text-muted-foreground hover:text-terracotta"
            >
              Réinitialiser les filtres
            </Link>
          ) : null}
        </form>

        <div>
          {products.length === 0 ? (
            <p className="text-muted-foreground">Aucun produit ne correspond à votre recherche.</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {pagination.totalPages > 1 ? (
            <nav className="mt-8 flex items-center justify-center gap-2 text-sm">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/boutique${buildQueryString(searchParams, { page: p === 1 ? undefined : String(p) })}`}
                  className={`rounded-md px-3 py-1.5 ${
                    p === pagination.page
                      ? 'bg-terracotta text-white'
                      : 'border border-border hover:bg-muted'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </main>
  );
}
