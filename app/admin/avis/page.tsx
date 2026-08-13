import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';

import { approveReview, rejectReview } from './actions';

export default async function AdminAvisPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  const pendingReviews = await prisma.review.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <main className="container py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Modération des avis</h1>

      {pendingReviews.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Aucun avis en attente de modération.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {pendingReviews.map((review) => (
            <li key={review.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{review.product.name}</span>
                <span className="text-sm text-muted-foreground">{review.rating} / 5</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {review.user.name ?? review.user.email} —{' '}
                {new Date(review.createdAt).toLocaleDateString('fr-FR')}
              </p>
              <p className="mt-2 text-sm">{review.comment}</p>
              <div className="mt-3 flex gap-2">
                <form action={approveReview.bind(null, review.id)}>
                  <Button type="submit" variant="secondary" size="sm">
                    Approuver
                  </Button>
                </form>
                <form action={rejectReview.bind(null, review.id)}>
                  <Button type="submit" variant="ghost" size="sm">
                    Rejeter
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
