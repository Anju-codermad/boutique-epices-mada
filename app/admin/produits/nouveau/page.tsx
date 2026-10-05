import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';

import { createProduct } from '../actions';

export default async function NouveauProduitPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <main className="container max-w-2xl py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Nouveau produit</h1>

      <form action={createProduct} className="mt-8 space-y-6">
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Nom du produit
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
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            rows={4}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="text-sm font-medium">
            Catégorie
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="text-sm font-medium">Certifications</legend>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="certifications" value="BIO" />
              Bio
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="certifications" value="EQUITABLE" />
              Équitable
            </label>
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isNew" />
          Marquer comme nouveauté
        </label>

        <div className="rounded-lg border border-border p-4">
          <h2 className="font-serif text-lg font-semibold text-forest">
            Première variante (obligatoire)
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            D&apos;autres formats pourront être ajoutés une fois le produit créé.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sku" className="text-sm font-medium">
                Référence (SKU)
              </label>
              <input
                id="sku"
                name="sku"
                required
                minLength={2}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="weightGrams" className="text-sm font-medium">
                Poids (g)
              </label>
              <input
                id="weightGrams"
                name="weightGrams"
                type="number"
                min={1}
                required
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="priceTtcEuros" className="text-sm font-medium">
                Prix TTC (€)
              </label>
              <input
                id="priceTtcEuros"
                name="priceTtcEuros"
                type="number"
                min={0.01}
                step={0.01}
                required
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="stock" className="text-sm font-medium">
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min={0}
                required
                defaultValue={0}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <Button type="submit" variant="primary">
          Créer le produit
        </Button>
      </form>
    </main>
  );
}
