import { FREE_SHIPPING_THRESHOLD_CENTS, SHIPPING_COST_CENTS } from '@/lib/stripe';

interface CouponLike {
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  validFrom: Date;
  validUntil: Date | null;
  maxUses: number | null;
  usedCount: number;
}

/** Remise en centimes pour un coupon déjà validé, jamais négative ni supérieure au sous-total. */
export function computeDiscountCents(
  coupon: Pick<CouponLike, 'type' | 'value'>,
  subtotalCents: number
): number {
  return coupon.type === 'PERCENTAGE'
    ? Math.round((subtotalCents * coupon.value) / 100)
    : Math.min(coupon.value, subtotalCents);
}

/** Frais de livraison en centimes ; offerts à partir de FREE_SHIPPING_THRESHOLD_CENTS. */
export function computeShippingCents(subtotalCents: number): number {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_COST_CENTS;
}

/** Un coupon est valide s'il existe, si sa période de validité couvre `now`, et s'il n'a pas atteint son quota d'utilisation. */
export function isCouponValid(coupon: CouponLike | null, now: Date): coupon is CouponLike {
  return (
    coupon !== null &&
    coupon.validFrom <= now &&
    (coupon.validUntil === null || coupon.validUntil >= now) &&
    (coupon.maxUses === null || coupon.usedCount < coupon.maxUses)
  );
}

export function computeOrderTotals(
  subtotalCents: number,
  coupon: CouponLike | null,
  now: Date = new Date()
): { discountCents: number; shippingCents: number; totalTtcCents: number } {
  const discountCents =
    coupon && isCouponValid(coupon, now) ? computeDiscountCents(coupon, subtotalCents) : 0;
  // Le seuil de livraison offerte s'applique au montant des produits avant remise.
  const shippingCents = computeShippingCents(subtotalCents);
  const totalTtcCents = subtotalCents - discountCents + shippingCents;

  return { discountCents, shippingCents, totalTtcCents };
}
