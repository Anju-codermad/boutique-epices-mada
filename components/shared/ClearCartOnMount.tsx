'use client';

import { useEffect } from 'react';

import { useCart } from '@/hooks/useCart';

export function ClearCartOnMount() {
  const clearCart = useCart((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
