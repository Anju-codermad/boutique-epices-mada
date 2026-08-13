import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  variantId: string;
  productSlug: string;
  productName: string;
  weightGrams: number;
  priceTtcCents: number;
  image?: string | null;
  quantity: number;
}

export interface AddItemInput {
  variantId: string;
  productSlug: string;
  productName: string;
  weightGrams: number;
  priceTtcCents: number;
  image?: string | null;
  /** Stock actuellement connu pour cette variante (recalculé et revérifié côté serveur au checkout). */
  stock: number;
}

export interface AddItemResult {
  success: boolean;
  error?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (input: AddItemInput, quantity?: number) => AddItemResult;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (input, quantity = 1) => {
        if (input.stock <= 0) {
          return { success: false, error: 'Ce produit est épuisé.' };
        }

        const { stock, ...item } = input;
        const items = get().items;
        const existing = items.find((i) => i.variantId === item.variantId);

        set({
          items: existing
            ? items.map((i) =>
                i.variantId === item.variantId ? { ...i, quantity: i.quantity + quantity } : i
              )
            : [...items, { ...item, quantity }],
        });

        return { success: true };
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => set({ items: [] }),
    }),
    { name: 'cart' }
  )
);

export const selectCartTotalTtcCents = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.priceTtcCents * item.quantity, 0);

export const selectCartItemCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const useCartTotalTtcCents = () => useCart(selectCartTotalTtcCents);
export const useCartItemCount = () => useCart(selectCartItemCount);
