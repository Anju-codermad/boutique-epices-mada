import Link from 'next/link';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  const [ordersToProcess, returnsToProcess, reviewsToModerate, outOfStockProducts] =
    await Promise.all([
      prisma.order.count({ where: { status: 'PAID' } }),
      prisma.order.count({ where: { status: 'RETURN_REQUESTED' } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { variants: { every: { stock: 0 } } } }),
    ]);

  const cards = [
    {
      href: '/admin/commandes',
      label: 'Commandes à traiter',
      description: 'Payées, en attente d’expédition',
      value: ordersToProcess,
    },
    {
      href: '/admin/commandes',
      label: 'Retours à traiter',
      description: 'Demandes de rétractation client',
      value: returnsToProcess,
    },
    {
      href: '/admin/avis',
      label: 'Avis à modérer',
      description: 'En attente de validation',
      value: reviewsToModerate,
    },
    {
      href: '/admin/produits',
      label: 'Produits en rupture',
      description: 'Toutes variantes à stock 0',
      value: outOfStockProducts,
    },
  ];

  return (
    <main className="container py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Tableau de bord</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="h-full transition-colors hover:border-terracotta">
              <CardHeader>
                <CardDescription>{card.label}</CardDescription>
                <CardTitle
                  className={card.value > 0 ? 'text-terracotta' : undefined}
                >
                  {card.value}
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <nav aria-label="Sections admin" className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/admin/produits" className="text-forest hover:text-terracotta">
          Gérer les produits →
        </Link>
        <Link href="/admin/commandes" className="text-forest hover:text-terracotta">
          Gérer les commandes →
        </Link>
        <Link href="/admin/avis" className="text-forest hover:text-terracotta">
          Modérer les avis →
        </Link>
      </nav>
    </main>
  );
}
