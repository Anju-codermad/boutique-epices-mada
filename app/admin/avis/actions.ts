'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Accès refusé');
  }
}

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
