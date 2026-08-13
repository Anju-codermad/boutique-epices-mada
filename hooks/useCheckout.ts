import { useState } from 'react';

import { useCart } from '@/hooks/useCart';

export function useCheckout() {
  const items = useCart((state) => state.items);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(couponCode?: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
          couponCode: couponCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Une erreur est survenue.');
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Une erreur est survenue.');
      setLoading(false);
    }
  }

  return { startCheckout, loading, error };
}
