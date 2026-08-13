import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { productListSelect, serializeProductListItem } from '@/lib/products';
import { buttonVariants } from '@/components/ui/Button';
import { ProductCard } from '@/components/shared/ProductCard';

export default async function Home() {
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.findMany({
      where: { isNew: true },
      select: productListSelect,
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <main>
      <section className="bg-forest py-24 text-center text-white">
        <div className="container">
          <h1 className="font-serif text-4xl font-bold sm:text-5xl">
            Les épices de Madagascar, directement du producteur à votre table
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/85">
            Vanille, poivre sauvage, cannelle, curcuma et bien plus — commerce équitable, vente
            directe depuis Madagascar, qualité premium.
          </p>
          <Link
            href="/boutique"
            className={buttonVariants({ variant: 'primary', size: 'lg', className: 'mt-8' })}
          >
            Découvrir la boutique
          </Link>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-center font-serif text-3xl font-bold text-forest">
          Nos familles d&apos;épices
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/boutique?category=${category.slug}`}
              className="rounded-lg border border-border p-6 text-center transition-colors hover:border-terracotta hover:bg-terracotta/5"
            >
              <span className="font-serif text-lg font-semibold text-forest">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {featuredProducts.length > 0 ? (
        <section className="bg-muted/40 py-16">
          <div className="container">
            <h2 className="text-center font-serif text-3xl font-bold text-forest">
              Nos nouveautés
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={serializeProductListItem(product)} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-bold text-forest">
            Commerce équitable, vente directe
          </h2>
          <p className="mt-4 text-muted-foreground">
            Nous travaillons directement avec des producteurs malgaches, sans intermédiaire, pour
            garantir une juste rémunération et une qualité irréprochable. Chaque épice est récoltée
            et préparée avec soin, dans le respect des savoir-faire traditionnels de Madagascar.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 py-10">
        <div className="container grid grid-cols-2 gap-6 text-center text-sm sm:grid-cols-4">
          <div>
            <p className="font-serif text-lg font-semibold text-forest">Livraison</p>
            <p className="mt-1 text-muted-foreground">Offerte dès 49€ d&apos;achat</p>
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-forest">Paiement sécurisé</p>
            <p className="mt-1 text-muted-foreground">Via Stripe</p>
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-forest">Origine garantie</p>
            <p className="mt-1 text-muted-foreground">Directement de Madagascar</p>
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-forest">Commerce équitable</p>
            <p className="mt-1 text-muted-foreground">Producteurs rémunérés justement</p>
          </div>
        </div>
      </section>
    </main>
  );
}
