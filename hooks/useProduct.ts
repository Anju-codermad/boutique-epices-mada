import { useEffect, useState } from 'react';

import type { ProductDetail } from '@/types/product';

interface UseProductResult {
  product: ProductDetail | null;
  loading: boolean;
  error: string | null;
}

export function useProduct(slug: string): UseProductResult {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${slug}`);

        if (!response.ok) {
          if (!cancelled) {
            setProduct(null);
            setError(response.status === 404 ? 'Produit introuvable' : 'Erreur de chargement');
          }
          return;
        }

        const data: ProductDetail = await response.json();
        if (!cancelled) {
          setProduct(data);
        }
      } catch {
        if (!cancelled) {
          setError('Erreur de chargement');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { product, loading, error };
}
