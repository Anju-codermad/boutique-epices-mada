import { describe, expect, it } from 'vitest';

import {
  computeDiscountCents,
  computeOrderTotals,
  computeShippingCents,
  isCouponValid,
} from '@/lib/pricing';
import { FREE_SHIPPING_THRESHOLD_CENTS, SHIPPING_COST_CENTS } from '@/lib/stripe';

describe('computeDiscountCents', () => {
  it('calcule un pourcentage arrondi', () => {
    expect(computeDiscountCents({ type: 'PERCENTAGE', value: 10 }, 1999)).toBe(200);
  });

  it('plafonne un montant fixe au sous-total (jamais de remise négative sur le total)', () => {
    expect(computeDiscountCents({ type: 'FIXED_AMOUNT', value: 5000 }, 1000)).toBe(1000);
  });

  it('applique un montant fixe inférieur au sous-total tel quel', () => {
    expect(computeDiscountCents({ type: 'FIXED_AMOUNT', value: 300 }, 1000)).toBe(300);
  });
});

describe('computeShippingCents', () => {
  it('facture la livraison sous le seuil', () => {
    expect(computeShippingCents(FREE_SHIPPING_THRESHOLD_CENTS - 1)).toBe(SHIPPING_COST_CENTS);
  });

  it('offre la livraison au seuil et au-delà', () => {
    expect(computeShippingCents(FREE_SHIPPING_THRESHOLD_CENTS)).toBe(0);
    expect(computeShippingCents(FREE_SHIPPING_THRESHOLD_CENTS + 1000)).toBe(0);
  });
});

describe('isCouponValid', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('rejette un coupon null', () => {
    expect(isCouponValid(null, now)).toBe(false);
  });

  it('rejette un coupon pas encore valide', () => {
    expect(
      isCouponValid(
        {
          type: 'PERCENTAGE',
          value: 10,
          validFrom: new Date('2026-07-01T00:00:00Z'),
          validUntil: null,
          maxUses: null,
          usedCount: 0,
        },
        now
      )
    ).toBe(false);
  });

  it('rejette un coupon expiré', () => {
    expect(
      isCouponValid(
        {
          type: 'PERCENTAGE',
          value: 10,
          validFrom: new Date('2026-01-01T00:00:00Z'),
          validUntil: new Date('2026-05-01T00:00:00Z'),
          maxUses: null,
          usedCount: 0,
        },
        now
      )
    ).toBe(false);
  });

  it('rejette un coupon ayant atteint son quota d’utilisation', () => {
    expect(
      isCouponValid(
        {
          type: 'PERCENTAGE',
          value: 10,
          validFrom: new Date('2026-01-01T00:00:00Z'),
          validUntil: null,
          maxUses: 5,
          usedCount: 5,
        },
        now
      )
    ).toBe(false);
  });

  it('accepte un coupon valide sans limite de date ni d’usage', () => {
    expect(
      isCouponValid(
        {
          type: 'PERCENTAGE',
          value: 10,
          validFrom: new Date('2026-01-01T00:00:00Z'),
          validUntil: null,
          maxUses: null,
          usedCount: 0,
        },
        now
      )
    ).toBe(true);
  });
});

describe('computeOrderTotals', () => {
  const now = new Date('2026-06-01T00:00:00Z');
  const validCoupon = {
    type: 'PERCENTAGE' as const,
    value: 10,
    validFrom: new Date('2026-01-01T00:00:00Z'),
    validUntil: null,
    maxUses: null,
    usedCount: 0,
  };

  it('sans coupon : total = sous-total + livraison', () => {
    const totals = computeOrderTotals(2000, null, now);
    expect(totals).toEqual({
      discountCents: 0,
      shippingCents: SHIPPING_COST_CENTS,
      totalTtcCents: 2000 + SHIPPING_COST_CENTS,
    });
  });

  it('avec coupon valide : remise appliquée avant livraison', () => {
    const totals = computeOrderTotals(2000, validCoupon, now);
    expect(totals.discountCents).toBe(200);
    expect(totals.totalTtcCents).toBe(2000 - 200 + SHIPPING_COST_CENTS);
  });

  it('un coupon invalide (expiré) n’applique aucune remise, sans faire échouer le calcul', () => {
    const expiredCoupon = { ...validCoupon, validUntil: new Date('2025-01-01T00:00:00Z') };
    const totals = computeOrderTotals(2000, expiredCoupon, now);
    expect(totals.discountCents).toBe(0);
  });

  it('la livraison reste calculée sur le sous-total avant remise', () => {
    // Sous-total tout juste sous le seuil : la remise ne doit pas re-déclencher la livraison offerte.
    const subtotal = FREE_SHIPPING_THRESHOLD_CENTS - 100;
    const totals = computeOrderTotals(subtotal, validCoupon, now);
    expect(totals.shippingCents).toBe(SHIPPING_COST_CENTS);
  });
});
