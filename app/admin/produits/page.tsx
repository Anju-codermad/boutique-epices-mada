import Link from 'next/link';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { buttonVariants } from '@/components/ui/Button';
import { formatPriceTtc } from '@/lib/format';

export default async function AdminProduitsPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true } },
      variants: { select: { priceTtcCents: true, stock: true } },
    },
  });

  return (
    <main className="container py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-forest">Produits</h1>
        <Link href="/admin/produits/nouveau" className={buttonVariants({ variant: 'primary' })}>
          Nouveau produit
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Aucun produit pour le moment.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {products.map((product) => {
            const prices = product.variants.map((v) => v.priceTtcCents);
            const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

            return (
              <li key={product.id}>
                <Link
                  href={`/admin/produits/${product.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:border-terracotta"
                >
                  <div>
                    <span className="font-medium">{product.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {product.category.name}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {prices.length > 0 ? (
                      <>
                        {formatPriceTtc(Math.min(...prices))}
                        {prices.length > 1 ? ` – ${formatPriceTtc(Math.max(...prices))}` : ''}
                      </>
                    ) : (
                      'Aucune variante'
                    )}
                    {' — '}
                    {totalStock > 0 ? `${totalStock} en stock` : 'Épuisé'}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
