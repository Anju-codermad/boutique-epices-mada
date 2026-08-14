'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { uniqueSlug } from '@/lib/slugify';

const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(1000).optional()
  ),
});

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });
}

async function isSlugTaken(candidate: string) {
  return (
    (await prisma.category.findUnique({ where: { slug: candidate }, select: { id: true } })) !==
    null
  );
}

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    throw new Error('Formulaire invalide');
  }

  const slug = await uniqueSlug(parsed.data.name, isSlugTaken);

  await prisma.category.create({
    data: { name: parsed.data.name, description: parsed.data.description ?? null, slug },
  });

  revalidatePath('/admin/categories');
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireAdmin();

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    throw new Error('Formulaire invalide');
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: { name: parsed.data.name, description: parsed.data.description ?? null },
  });

  revalidatePath('/admin/categories');
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();

  try {
    await prisma.category.delete({ where: { id: categoryId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new Error(
        'Impossible de supprimer : cette catégorie contient encore des produits. Déplacez-les ou supprimez-les d’abord.'
      );
    }
    throw error;
  }

  revalidatePath('/admin/categories');
}
