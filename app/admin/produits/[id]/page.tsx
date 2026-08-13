import { notFound } from 'next/navigation';
import Image from 'next/image';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { formatPriceTtc } from '@/lib/format';

import {
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  uploadImage,
  deleteImage,
} from '../actions';

export default async function EditProduitPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        variants: { orderBy: { weightGrams: 'asc' } },
        images: { orderBy: { position: 'asc' } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="container max-w-2xl py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">{product.name}</h1>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold text-forest">Informations générales</h2>
        <form action={updateProduct.bind(null, product.id)} className="mt-4 space-y-6">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Nom du produit
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              defaultValue={product.name}
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
              defaultValue={product.description}
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
              defaultValue={product.categoryId}
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
                <input
                  type="checkbox"
                  name="certifications"
                  value="BIO"
                  defaultChecked={product.certifications.includes('BIO')}
                />
                Bio
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="certifications"
                  value="EQUITABLE"
                  defaultChecked={product.certifications.includes('EQUITABLE')}
                />
                Équitable
              </label>
            </div>
          </fieldset>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isNew" defaultChecked={product.isNew} />
            Marquer comme nouveauté
          </label>

          <Button type="submit" variant="primary">
            Enregistrer
          </Button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl font-semibold text-forest">Variantes</h2>
        <ul className="mt-4 space-y-3">
          {product.variants.map((variant) => (
            <li key={variant.id} className="rounded-lg border border-border p-4">
              <form
                action={updateVariant.bind(null, product.id, variant.id)}
                className="grid grid-cols-2 gap-3 sm:grid-cols-4"
              >
                <div>
                  <label className="text-xs font-medium" htmlFor={`sku-${variant.id}`}>
                    SKU
                  </label>
                  <input
                    id={`sku-${variant.id}`}
                    name="sku"
                    required
                    defaultValue={variant.sku}
                    className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" htmlFor={`weight-${variant.id}`}>
                    Poids (g)
                  </label>
                  <input
                    id={`weight-${variant.id}`}
                    name="weightGrams"
                    type="number"
                    min={1}
                    required
                    defaultValue={variant.weightGrams}
                    className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" htmlFor={`price-${variant.id}`}>
                    Prix TTC (€)
                  </label>
                  <input
                    id={`price-${variant.id}`}
                    name="priceTtcEuros"
                    type="number"
                    min={0.01}
                    step={0.01}
                    required
                    defaultValue={(variant.priceTtcCents / 100).toFixed(2)}
                    className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium" htmlFor={`stock-${variant.id}`}>
                    Stock
                  </label>
                  <input
                    id={`stock-${variant.id}`}
                    name="stock"
                    type="number"
                    min={0}
                    required
                    defaultValue={variant.stock}
                    className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="col-span-2 flex items-end gap-2 sm:col-span-4">
                  <Button type="submit" size="sm">
                    Enregistrer
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {formatPriceTtc(variant.priceTtcCents)}
                  </span>
                </div>
              </form>
              <form action={deleteVariant.bind(null, product.id, variant.id)} className="mt-2">
                <Button type="submit" variant="ghost" size="sm">
                  Supprimer cette variante
                </Button>
              </form>
            </li>
          ))}
        </ul>

        <form
          action={addVariant.bind(null, product.id)}
          className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-4"
        >
          <div>
            <label className="text-xs font-medium" htmlFor="new-sku">
              SKU
            </label>
            <input
              id="new-sku"
              name="sku"
              required
              minLength={2}
              className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium" htmlFor="new-weight">
              Poids (g)
            </label>
            <input
              id="new-weight"
              name="weightGrams"
              type="number"
              min={1}
              required
              className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium" htmlFor="new-price">
              Prix TTC (€)
            </label>
            <input
              id="new-price"
              name="priceTtcEuros"
              type="number"
              min={0.01}
              step={0.01}
              required
              className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium" htmlFor="new-stock">
              Stock
            </label>
            <input
              id="new-stock"
              name="stock"
              type="number"
              min={0}
              required
              defaultValue={0}
              className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
            />
          </div>
          <div className="col-span-2 sm:col-span-4">
            <Button type="submit" variant="secondary" size="sm">
              Ajouter une variante
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl font-semibold text-forest">Images</h2>
        {product.images.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Aucune image pour le moment.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
            {product.images.map((image) => (
              <li key={image.id} className="space-y-2">
                <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                  <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="120px" />
                </div>
                <form action={deleteImage.bind(null, product.id, image.id)}>
                  <Button type="submit" variant="ghost" size="sm" className="w-full">
                    Supprimer
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form
          action={uploadImage.bind(null, product.id)}
          className="mt-4 space-y-3 rounded-lg border border-dashed border-border p-4"
        >
          <div>
            <label htmlFor="file" className="text-sm font-medium">
              Nouvelle image
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/*"
              required
              className="mt-1 w-full text-sm"
            />
          </div>
          <div>
            <label htmlFor="alt" className="text-sm font-medium">
              Texte alternatif (accessibilité)
            </label>
            <input
              id="alt"
              name="alt"
              required
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Envoyer l&apos;image
          </Button>
        </form>
      </section>

      <section className="mt-12 border-t border-border pt-6">
        <form action={deleteProduct.bind(null, product.id)}>
          <Button type="submit" variant="ghost" className="text-destructive">
            Supprimer ce produit
          </Button>
        </form>
      </section>
    </main>
  );
}
