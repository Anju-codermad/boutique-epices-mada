'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { formatPriceTtc } from '@/lib/format';

interface Variant {
  id: string;
  weightGrams: number;
  priceTtcCents: number;
  stock: number;
}

interface ProductPurchasePanelProps {
  productSlug: string;
  productName: string;
  image: string | null;
  variants: Variant[];
}

export function ProductPurchasePanel({
  productSlug,
  productName,
  image,
  variants,
}: ProductPurchasePanelProps) {
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(firstAvailable?.id);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const addItem = useCart((state) => state.addItem);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;
  const disponible = variants.some((v) => v.stock > 0);

  function handleAddToCart() {
    if (!selectedVariant) {
      return;
    }
    const result = addItem(
      {
        variantId: selectedVariant.id,
        productSlug,
        productName,
        weightGrams: selectedVariant.weightGrams,
        priceTtcCents: selectedVariant.priceTtcCents,
        image,
        stock: selectedVariant.stock,
      },
      quantity
    );
    setFeedback(result.success ? 'Ajouté au panier.' : (result.error ?? 'Erreur.'));
  }

  if (!disponible) {
    return (
      <div className="space-y-3">
        <Button variant="primary" disabled className="w-full">
          Épuisé — être prévenu du retour
        </Button>
        <p className="text-sm text-muted-foreground">
          <Link href="#newsletter" className="text-terracotta hover:underline">
            Inscrivez-vous à la newsletter
          </Link>{' '}
          pour être informé dès que ce produit est de retour en stock.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <span className="text-sm font-medium">Format</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              disabled={variant.stock === 0}
              onClick={() => setSelectedVariantId(variant.id)}
              className={`rounded-md border px-3 py-2 text-sm ${
                variant.id === selectedVariantId
                  ? 'border-terracotta bg-terracotta/10 text-terracotta'
                  : 'border-border hover:border-terracotta'
              } ${variant.stock === 0 ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              {variant.weightGrams} g — {formatPriceTtc(variant.priceTtcCents)}
              {variant.stock === 0 ? ' (épuisé)' : ''}
            </button>
          ))}
        </div>
      </div>

      {selectedVariant ? (
        <p className="font-serif text-3xl text-terracotta">
          {formatPriceTtc(selectedVariant.priceTtcCents)}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm font-medium">
          Quantité
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
          className="w-20 rounded-md border border-border px-2 py-1.5 text-sm"
        />
      </div>

      <Button variant="primary" className="w-full" onClick={handleAddToCart}>
        Ajouter au panier
      </Button>

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
    </div>
  );
}
