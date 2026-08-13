import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  ALLOWED_SHIPPING_COUNTRIES,
  FREE_SHIPPING_THRESHOLD_CENTS,
  SHIPPING_COST_CENTS,
  stripe,
} from '@/lib/stripe';
import { getAppUrl } from '@/lib/url';

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(99),
      })
    )
    .min(1),
  couponCode: z.string().trim().min(1).max(50).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Panier invalide', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { items, couponCode } = parsed.data;
  const session = await auth();

  // Les prix et le stock ne sont JAMAIS acceptés depuis le client : tout est
  // recalculé et revérifié ici depuis la base de données.
  const variantIds = items.map((item) => item.variantId);
  const variants = await prisma.variant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { select: { name: true } } },
  });

  const variantById = new Map(variants.map((v) => [v.id, v]));
  const missing = items.filter((item) => !variantById.has(item.variantId));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: 'Un ou plusieurs produits sont introuvables' },
      { status: 400 }
    );
  }

  const insufficientStock = items.filter((item) => {
    const variant = variantById.get(item.variantId)!;
    return variant.stock < item.quantity;
  });
  if (insufficientStock.length > 0) {
    return NextResponse.json(
      {
        error: 'Stock insuffisant pour un ou plusieurs produits',
        variantIds: insufficientStock.map((item) => item.variantId),
      },
      { status: 400 }
    );
  }

  const subtotalCents = items.reduce((sum, item) => {
    const variant = variantById.get(item.variantId)!;
    return sum + variant.priceTtcCents * item.quantity;
  }, 0);

  let coupon = null;
  let discountCents = 0;

  if (couponCode) {
    const now = new Date();
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });

    const isValid =
      coupon &&
      coupon.validFrom <= now &&
      (coupon.validUntil === null || coupon.validUntil >= now) &&
      (coupon.maxUses === null || coupon.usedCount < coupon.maxUses);

    if (!isValid) {
      return NextResponse.json({ error: 'Code promo invalide ou expiré' }, { status: 400 });
    }

    discountCents =
      coupon!.type === 'PERCENTAGE'
        ? Math.round((subtotalCents * coupon!.value) / 100)
        : Math.min(coupon!.value, subtotalCents);
  }

  // Le seuil de livraison offerte s'applique au montant des produits avant remise.
  const shippingCents = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_COST_CENTS;
  const totalTtcCents = subtotalCents - discountCents + shippingCents;

  const order = await prisma.order.create({
    data: {
      userId: session?.user?.id,
      status: 'PENDING',
      totalTtcCents,
      shippingCents,
      discountCents,
      couponId: coupon?.id,
      items: {
        create: items.map((item) => {
          const variant = variantById.get(item.variantId)!;
          return {
            variantId: variant.id,
            quantity: item.quantity,
            unitPriceTtcCents: variant.priceTtcCents,
          };
        }),
      },
    },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  try {
    const appUrl = getAppUrl();

    const discounts =
      discountCents > 0
        ? [
            {
              coupon: (
                await stripe.coupons.create({
                  amount_off: discountCents,
                  currency: 'eur',
                  duration: 'once',
                  name: couponCode,
                })
              ).id,
            },
          ]
        : undefined;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: 'eur',
          unit_amount: item.unitPriceTtcCents,
          product_data: {
            name: `${item.variant.product.name} (${item.variant.weightGrams} g)`,
          },
        },
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shippingCents, currency: 'eur' },
            display_name: shippingCents === 0 ? 'Livraison offerte' : 'Livraison standard',
          },
        },
      ],
      discounts,
      shipping_address_collection: { allowed_countries: ALLOWED_SHIPPING_COUNTRIES },
      customer_email: session?.user?.email ?? undefined,
      success_url: `${appUrl}/commande/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/panier`,
      metadata: { orderId: order.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe', error);
    // Ne laisse pas de commande orpheline si la création côté Stripe échoue.
    await prisma.order.delete({ where: { id: order.id } });
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 });
  }
}
