import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

import { getProductDetail, getRelatedProducts } from '@/lib/products';
import { getAppUrl } from '@/lib/url';
import { Badge } from '@/components/ui/Badge';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductGallery } from '@/components/shared/ProductGallery';
import { ProductPurchasePanel } from '@/components/shared/ProductPurchasePanel';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductDetail(params.slug);
  if (!product) {
    return {};
  }
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductDetail(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  const prices = product.variants.map((variant) => variant.priceTtcCents / 100);
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((image) => new URL(image.url, getAppUrl()).toString()),
    url: new URL(`/produits/${product.slug}`, getAppUrl()).toString(),
    ...(product.averageRating !== null
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.averageRating,
            reviewCount: product.reviews.length,
          },
        }
      : {}),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: Math.min(...prices).toFixed(2),
      highPrice: Math.max(...prices).toFixed(2),
      offerCount: product.variants.length,
      availability: product.disponible
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  const breadcrumbItems = [
    { name: 'Accueil', url: getAppUrl() },
    { name: 'Boutique', url: new URL('/boutique', getAppUrl()).toString() },
    {
      name: product.category.name,
      url: new URL(`/boutique?category=${product.category.slug}`, getAppUrl()).toString(),
    },
    { name: product.name, url: new URL(`/produits/${product.slug}`, getAppUrl()).toString() },
  ];
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        // `<` échappé pour empêcher une donnée produit contenant "</script>" de sortir de la balise.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <main className="container py-12">
        <nav aria-label="Fil d'ariane" className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-terracotta">
            Accueil
          </Link>{' '}
          /{' '}
          <Link href="/boutique" className="hover:text-terracotta">
            Boutique
          </Link>{' '}
          /{' '}
          <Link
            href={`/boutique?category=${product.category.slug}`}
            className="hover:text-terracotta"
          >
            {product.category.name}
          </Link>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} productName={product.name} />

          <div>
            <div className="flex flex-wrap gap-1">
              {product.certifications.includes('BIO') ? <Badge variant="bio" /> : null}
              {product.certifications.includes('EQUITABLE') ? <Badge variant="equitable" /> : null}
              {product.isNew ? <Badge variant="nouveau" /> : null}
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold text-forest">{product.name}</h1>

            {product.averageRating !== null ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Note moyenne : {product.averageRating.toFixed(1)} / 5 ({product.reviews.length}{' '}
                avis)
              </p>
            ) : null}

            <p className="mt-4 text-muted-foreground">{product.description}</p>

            <div className="mt-6">
              <ProductPurchasePanel
                productSlug={product.slug}
                productName={product.name}
                image={product.images[0]?.url ?? null}
                variants={product.variants}
              />
            </div>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="font-serif text-2xl font-bold text-forest">Avis clients</h2>
          {product.reviews.length === 0 ? (
            <p className="mt-4 text-muted-foreground">Aucun avis pour le moment.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {product.reviews.map((review) => (
                <li key={review.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{review.user.name ?? 'Client'}</span>
                    <span className="text-sm text-muted-foreground">{review.rating} / 5</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="mt-2 text-sm">{review.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {relatedProducts.length > 0 ? (
          <section className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-forest">Produits associés</h2>
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
