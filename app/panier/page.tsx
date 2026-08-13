'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Button, buttonVariants } from '@/components/ui/Button';
import { useCart, useCartTotalTtcCents } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { formatPriceTtc } from '@/lib/format';

export default function PanierPage() {
  const items = useCart((state) => state.items);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);
  const clearCart = useCart((state) => state.clearCart);
  const total = useCartTotalTtcCents();
  const [couponCode, setCouponCode] = useState('');
  const { startCheckout, loading, error } = useCheckout();

  if (items.length === 0) {
    return (
      <main className="container flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="font-serif text-3xl font-bold text-forest">Votre panier est vide</h1>
        <Link
          href="/boutique"
          className={buttonVariants({ variant: 'primary', className: 'mt-6' })}
        >
          Découvrir la boutique
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-12">
      <h1 className="font-serif text-3xl font-bold text-forest">Votre panier</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.variantId}
              className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-serif text-xl text-muted-foreground">
                    {item.productName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Link
                  href={`/produits/${item.productSlug}`}
                  className="font-medium hover:text-terracotta"
                >
                  {item.productName}
                </Link>
                <p className="text-sm text-muted-foreground">{item.weightGrams} g</p>
                <p className="text-sm text-muted-foreground">
                  Prix unitaire : {formatPriceTtc(item.priceTtcCents)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm" htmlFor={`panier-qty-${item.variantId}`}>
                  Quantité
                </label>
                <input
                  id={`panier-qty-${item.variantId}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) =>
                    updateQuantity(item.variantId, Number(event.target.value) || 1)
                  }
                  className="w-16 rounded-md border border-border px-2 py-1.5 text-sm"
                />
              </div>

              <p className="w-28 text-right font-medium">
                {formatPriceTtc(item.priceTtcCents * item.quantity)}
              </p>

              <button
                type="button"
                onClick={() => removeItem(item.variantId)}
                className="text-sm text-muted-foreground hover:text-destructive"
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>

        <div className="h-fit space-y-4 rounded-lg border border-border p-4">
          <h2 className="font-serif text-lg font-semibold">Récapitulatif</h2>
          <div className="flex items-center justify-between text-sm">
            <span>Sous-total TTC</span>
            <span className="font-medium">{formatPriceTtc(total)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Frais de livraison calculés à l&apos;étape suivante (offerts dès 49€ d&apos;achat). Tous
            les prix affichés sont TTC.
          </p>

          <div>
            <label htmlFor="coupon" className="text-sm font-medium">
              Code promo
            </label>
            <input
              id="coupon"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              placeholder="Ex. BIENVENUE10"
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />
          </div>

          <Button
            variant="primary"
            className="w-full"
            disabled={loading}
            onClick={() => startCheckout(couponCode)}
          >
            {loading ? 'Redirection...' : 'Passer commande'}
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <button
            type="button"
            onClick={clearCart}
            className="w-full text-center text-sm text-muted-foreground hover:text-destructive"
          >
            Vider le panier
          </button>
        </div>
      </div>
    </main>
  );
}
