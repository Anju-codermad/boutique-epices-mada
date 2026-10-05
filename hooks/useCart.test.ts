import { beforeEach, describe, expect, it } from 'vitest';

import { selectCartItemCount, selectCartTotalTtcCents, useCart } from '@/hooks/useCart';

const baseItem = {
  variantId: 'v1',
  productSlug: 'vanille-bourbon',
  productName: 'Vanille Bourbon',
  weightGrams: 15,
  priceTtcCents: 1490,
};

beforeEach(() => {
  useCart.setState({ items: [] });
});

describe('addItem', () => {
  it('refuse un produit sans stock', () => {
    const result = useCart.getState().addItem({ ...baseItem, stock: 0 });
    expect(result).toEqual({ success: false, error: 'Ce produit est épuisé.' });
    expect(useCart.getState().items).toHaveLength(0);
  });

  it('ajoute un nouvel article', () => {
    const result = useCart.getState().addItem({ ...baseItem, stock: 10 });
    expect(result).toEqual({ success: true });
    expect(useCart.getState().items).toEqual([{ ...baseItem, quantity: 1 }]);
  });

  it('cumule la quantité si l’article est déjà dans le panier', () => {
    useCart.getState().addItem({ ...baseItem, stock: 10 }, 2);
    useCart.getState().addItem({ ...baseItem, stock: 10 }, 3);
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].quantity).toBe(5);
  });
});

describe('removeItem', () => {
  it('retire uniquement l’article ciblé', () => {
    useCart.getState().addItem({ ...baseItem, stock: 10 });
    useCart.getState().addItem({ ...baseItem, variantId: 'v2', stock: 10 });
    useCart.getState().removeItem('v1');
    expect(useCart.getState().items.map((i) => i.variantId)).toEqual(['v2']);
  });
});

describe('updateQuantity', () => {
  it('met à jour la quantité', () => {
    useCart.getState().addItem({ ...baseItem, stock: 10 });
    useCart.getState().updateQuantity('v1', 7);
    expect(useCart.getState().items[0].quantity).toBe(7);
  });

  it('retire l’article si la quantité tombe à zéro ou moins', () => {
    useCart.getState().addItem({ ...baseItem, stock: 10 });
    useCart.getState().updateQuantity('v1', 0);
    expect(useCart.getState().items).toHaveLength(0);
  });
});

describe('clearCart', () => {
  it('vide le panier', () => {
    useCart.getState().addItem({ ...baseItem, stock: 10 });
    useCart.getState().clearCart();
    expect(useCart.getState().items).toHaveLength(0);
  });
});

describe('sélecteurs', () => {
  it('calcule le total TTC et le nombre d’articles', () => {
    useCart.getState().addItem({ ...baseItem, stock: 10 }, 2);
    useCart.getState().addItem({ ...baseItem, variantId: 'v2', priceTtcCents: 2000, stock: 10 }, 1);

    expect(selectCartTotalTtcCents(useCart.getState())).toBe(1490 * 2 + 2000);
    expect(selectCartItemCount(useCart.getState())).toBe(3);
  });
});
