import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendOrderConfirmationEmail } from '@/lib/emails';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    );
  } catch (error) {
    console.error('Signature Stripe invalide', error);
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
  }

  // Toujours 200 pour les erreurs métier (journalisées) : un statut d'erreur
  // ferait réessayer Stripe indéfiniment un événement qu'un retry ne réglera pas.
  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error('checkout.session.completed sans orderId en metadata', session.id);
    return;
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });

    if (!order) {
      console.error('Commande introuvable pour la session Stripe', orderId);
      return;
    }

    if (order.status !== 'PENDING') {
      // Idempotence : Stripe peut renvoyer le même événement plusieurs fois.
      return;
    }

    const shippingDetails = session.collected_information?.shipping_details;
    const customerDetails = session.customer_details;

    let addressId: string | undefined;
    if (shippingDetails) {
      const address = await prisma.address.create({
        data: {
          userId: order.userId,
          fullName: shippingDetails.name ?? '',
          line1: shippingDetails.address.line1 ?? '',
          line2: shippingDetails.address.line2 ?? undefined,
          postalCode: shippingDetails.address.postal_code ?? '',
          city: shippingDetails.address.city ?? '',
          country: shippingDetails.address.country ?? 'FR',
          phone: customerDetails?.phone ?? undefined,
        },
      });
      addressId = address.id;
    }

    await prisma.$transaction([
      ...order.items.map((item) =>
        prisma.variant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })
      ),
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          guestEmail: order.userId ? undefined : (customerDetails?.email ?? undefined),
          addressId,
        },
      }),
    ]);

    const recipientEmail = customerDetails?.email;
    if (recipientEmail) {
      const subtotalTtcCents = order.totalTtcCents - order.shippingCents + order.discountCents;
      await sendOrderConfirmationEmail(recipientEmail, {
        orderId: order.id,
        items: order.items.map((item) => ({
          name: item.variant.product.name,
          weightGrams: item.variant.weightGrams,
          quantity: item.quantity,
          unitPriceTtcCents: item.unitPriceTtcCents,
        })),
        subtotalTtcCents,
        shippingCents: order.shippingCents,
        discountCents: order.discountCents,
        totalTtcCents: order.totalTtcCents,
      });
    }
  } catch (error) {
    console.error('Erreur lors du traitement du webhook Stripe checkout.session.completed', error);
  }
}
