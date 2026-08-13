'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { eurosToCentsSchema } from '@/lib/money';

const CODE_REGEX = /^[A-Z0-9_-]+$/i;

const createSchema = z.object({
  code: z.string().trim().min(3).max(30).regex(CODE_REGEX, 'Lettres, chiffres, - et _ uniquement'),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  percentValue: z.string().optional(),
  fixedValueEuros: z.string().optional(),
  validFrom: z.coerce.date(),
  validUntil: z.string().optional(),
  maxUses: z.string().optional(),
});

function parseOptionalDate(value: string | undefined) {
  return value ? new Date(value) : null;
}

function parseOptionalMaxUses(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : NaN;
}

export async function createCoupon(formData: FormData) {
  await requireAdmin();

  const parsed = createSchema.safeParse({
    code: formData.get('code'),
    type: formData.get('type'),
    percentValue: formData.get('percentValue') || undefined,
    fixedValueEuros: formData.get('fixedValueEuros') || undefined,
    validFrom: formData.get('validFrom'),
    validUntil: formData.get('validUntil') || undefined,
    maxUses: formData.get('maxUses') || undefined,
  });
  if (!parsed.success) {
    throw new Error('Formulaire invalide');
  }

  let value: number;
  if (parsed.data.type === 'PERCENTAGE') {
    const percent = Number(parsed.data.percentValue);
    if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
      throw new Error('Pourcentage invalide (1 à 100)');
    }
    value = percent;
  } else {
    const cents = eurosToCentsSchema.safeParse(parsed.data.fixedValueEuros);
    if (!cents.success) {
      throw new Error('Montant invalide');
    }
    value = cents.data;
  }

  const maxUses = parseOptionalMaxUses(parsed.data.maxUses);
  if (Number.isNaN(maxUses)) {
    throw new Error("Nombre d'utilisations maximum invalide");
  }

  try {
    await prisma.coupon.create({
      data: {
        code: parsed.data.code.toUpperCase(),
        type: parsed.data.type,
        value,
        validFrom: parsed.data.validFrom,
        validUntil: parseOptionalDate(parsed.data.validUntil),
        maxUses,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('Ce code coupon existe déjà.');
    }
    throw error;
  }

  revalidatePath('/admin/coupons');
}

const updateSchema = z.object({
  validUntil: z.string().optional(),
  maxUses: z.string().optional(),
});

export async function updateCoupon(couponId: string, formData: FormData) {
  await requireAdmin();

  const parsed = updateSchema.safeParse({
    validUntil: formData.get('validUntil') || undefined,
    maxUses: formData.get('maxUses') || undefined,
  });
  if (!parsed.success) {
    throw new Error('Formulaire invalide');
  }

  const maxUses = parseOptionalMaxUses(parsed.data.maxUses);
  if (Number.isNaN(maxUses)) {
    throw new Error("Nombre d'utilisations maximum invalide");
  }

  await prisma.coupon.update({
    where: { id: couponId },
    data: { validUntil: parseOptionalDate(parsed.data.validUntil), maxUses },
  });

  revalidatePath('/admin/coupons');
}

export async function deactivateCoupon(couponId: string) {
  await requireAdmin();

  await prisma.coupon.update({ where: { id: couponId }, data: { validUntil: new Date() } });

  revalidatePath('/admin/coupons');
}

export async function deleteCoupon(couponId: string) {
  await requireAdmin();

  try {
    await prisma.coupon.delete({ where: { id: couponId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new Error(
        'Impossible de supprimer : ce coupon est associé à des commandes existantes. Désactivez-le plutôt.'
      );
    }
    throw error;
  }

  revalidatePath('/admin/coupons');
}
