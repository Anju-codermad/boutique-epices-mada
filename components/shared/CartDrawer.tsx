'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useCart, useCartTotalTtcCents } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { formatPriceTtc } from '@/lib/format';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}

export function CartDrawer({ open, onClose, triggerRef }: CartDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const items = useCart((state) => state.items);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);
  const total = useCartTotalTtcCents();
  const { startCheckout, loading, error } = useCheckout();

  useEffect(() => {
    if (!open) {
      return;
    }

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panel) {
        return;
      }

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    const trigger = triggerRef.current;
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      trigger?.focus();
    };
  }, [open, onClose, triggerRef]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
        className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-background shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-serif text-lg font-semibold">Votre panier</h2>
          <button type="button" onClick={onClose} aria-label="Fermer le panier">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground">Votre panier est vide.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-serif text-muted-foreground">
                        {item.productName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.weightGrams} g</p>
                    <div className="mt-1 flex items-center gap-2">
                      <label className="sr-only" htmlFor={`qty-${item.variantId}`}>
                        Quantité pour {item.productName}
                      </label>
                      <input
                        id={`qty-${item.variantId}`}
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) =>
                          updateQuantity(item.variantId, Number(event.target.value) || 1)
                        }
                        className="w-16 rounded-md border border-border px-2 py-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    {formatPriceTtc(item.priceTtcCents * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="space-y-3 border-t border-border p-4">
            <div className="flex items-center justify-between font-medium">
              <span>Sous-total</span>
              <span>{formatPriceTtc(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Frais de livraison calculés à l&apos;étape suivante. Tous les prix sont TTC.
            </p>
            <Link
              href="/panier"
              onClick={onClose}
              className="block w-full rounded-md border border-terracotta px-4 py-2 text-center text-sm font-medium text-terracotta hover:bg-terracotta/10"
            >
              Voir le panier
            </Link>
            <Button
              variant="primary"
              className="w-full"
              disabled={loading}
              onClick={() => startCheckout()}
            >
              {loading ? 'Redirection...' : 'Passer commande'}
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
