import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';

import { createCategory, updateCategory, deleteCategory } from './actions';

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <main className="container max-w-2xl py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Catégories</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Le slug est généré automatiquement à la création et reste fixe ensuite (pour ne pas
        casser les liens existants).
      </p>

      {categories.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Aucune catégorie pour le moment.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {categories.map((category) => (
            <li key={category.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm text-muted-foreground">/{category.slug}</span>
                <span className="text-xs text-muted-foreground">
                  {category._count.products} produit{category._count.products > 1 ? 's' : ''}
                </span>
              </div>

              <form
                action={updateCategory.bind(null, category.id)}
                className="mt-3 space-y-3"
              >
                <div>
                  <label className="text-xs font-medium" htmlFor={`name-${category.id}`}>
                    Nom
                  </label>
                  <input
                    id={`name-${category.id}`}
                    name="name"
                    required
                    minLength={2}
                    defaultValue={category.name}
                    className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" htmlFor={`description-${category.id}`}>
                    Description
                  </label>
                  <textarea
                    id={`description-${category.id}`}
                    name="description"
                    rows={2}
                    defaultValue={category.description ?? ''}
                    className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
                  />
                </div>
                <Button type="submit" size="sm">
                  Enregistrer
                </Button>
              </form>

              <form action={deleteCategory.bind(null, category.id)} className="mt-2">
                <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                  Supprimer
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-10 rounded-lg border border-dashed border-border p-4">
        <h2 className="font-serif text-lg font-semibold text-forest">Nouvelle catégorie</h2>
        <form action={createCategory} className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Nom
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Description (facultatif)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" variant="primary">
            Créer la catégorie
          </Button>
        </form>
      </section>
    </main>
  );
}
