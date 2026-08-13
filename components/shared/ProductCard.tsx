'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { useCart } from '@/hooks/useCart';
import type { ProductListItem } from '@/types/product';

function formatPriceTtc(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.', ',')} € TTC`;
}

export function ProductCard({ product }: { product: ProductListItem }) {
  const addItem = useCart((state) => state.addItem);

  function handleQuickAdd() {
    if (!product.defaultVariant) {
      return;
    }
    addItem(
      {
        variantId: product.defaultVariant.id,
        productSlug: product.slug,
        productName: product.name,
        weightGrams: product.defaultVariant.weightGrams,
        priceTtcCents: product.defaultVariant.priceTtcCents,
        image: product.image?.url ?? null,
        stock: product.defaultVariant.stock,
      },
      1
    );
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Link href={`/produits/${product.slug}`} className="block">
        <div className="relative aspect-square bg-muted">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-serif text-2xl text-muted-foreground">
              {product.name.charAt(0)}
            </div>
          )}
          {!product.disponible ? (
            <div className="absolute right-2 top-2">
              <Badge variant="epuise" />
            </div>
          ) : null}
        </div>
      </Link>

      <CardHeader className="flex-1 space-y-1 p-4">
        <div className="flex flex-wrap gap-1">
          {product.certifications.includes('BIO') ? <Badge variant="bio" /> : null}
          {product.certifications.includes('EQUITABLE') ? <Badge variant="equitable" /> : null}
          {product.isNew ? <Badge variant="nouveau" /> : null}
        </div>
        <Link href={`/produits/${product.slug}`}>
          <h3 className="font-serif text-lg font-semibold hover:text-terracotta">{product.name}</h3>
        </Link>
      </CardHeader>

      <CardContent className="px-4 py-0">
        {product.minPriceTtcCents !== null ? (
          <p className="font-medium text-terracotta">
            {product.minPriceTtcCents === product.maxPriceTtcCents
              ? formatPriceTtc(product.minPriceTtcCents)
              : `Dès ${formatPriceTtc(product.minPriceTtcCents)}`}
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="p-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={!product.disponible}
          onClick={handleQuickAdd}
        >
          {product.disponible ? 'Ajout rapide au panier' : 'Épuisé'}
        </Button>
      </CardFooter>
    </Card>
  );
}
