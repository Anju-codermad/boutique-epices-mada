'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export async function approveReview(reviewId: string) {
  await requireAdmin();
  await prisma.review.update({ where: { id: reviewId }, data: { status: 'APPROVED' } });
  revalidatePath('/admin/avis');
}

export async function rejectReview(reviewId: string) {
  await requireAdmin();
  await prisma.review.delete({ where: { id: reviewId } });
  revalidatePath('/admin/avis');
}
