'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { slugify } from '@/lib/slugify';
import { eurosToCentsSchema } from '@/lib/money';
import { uploadProductImage, deleteProductImage } from '@/lib/supabase-storage';

const CERTIFICATIONS = ['BIO', 'EQUITABLE'] as const;

const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(5000),
  categoryId: z.string().min(1),
  certifications: z.array(z.enum(CERTIFICATIONS)),
  isNew: z.boolean(),
});

const variantSchema = z.object({
  sku: z.string().trim().min(2).max(50),
  weightGrams: z.coerce.number().int().min(1).max(100_000),
  priceTtcCents: eurosToCentsSchema,
  stock: z.coerce.number().int().min(0).max(1_000_000),
});

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    categoryId: formData.get('categoryId'),
    certifications: formData.getAll('certifications'),
    isNew: formData.get('isNew') === 'on',
  });
}

function parseVariantForm(formData: FormData) {
  return variantSchema.safeParse({
    sku: formData.get('sku'),
    weightGrams: formData.get('weightGrams'),
    priceTtcCents: formData.get('priceTtcEuros'),
    stock: formData.get('stock'),
  });
}

/** Slug unique : ajoute un suffixe numérique si le slug de base est déjà pris. */
async function uniqueSlug(base: string): Promise<string> {
  const slug = slugify(base);
  let candidate = slug;
  let suffix = 2;
  while (await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const parsed = parseProductForm(formData);
  const variantParsed = parseVariantForm(formData);

  if (!parsed.success || !variantParsed.success) {
    throw new Error('Formulaire invalide');
  }

  const slug = await uniqueSlug(parsed.data.name);

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      slug,
      variants: { create: variantParsed.data },
    },
  });

  revalidatePath('/admin/produits');
  redirect(`/admin/produits/${product.id}`);
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    throw new Error('Formulaire invalide');
  }

  await prisma.product.update({ where: { id: productId }, data: parsed.data });

  revalidatePath('/admin/produits');
  revalidatePath(`/admin/produits/${productId}`);
}

export async function deleteProduct(productId: string) {
  await requireAdmin();

  try {
    await prisma.product.delete({ where: { id: productId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new Error(
        'Impossible de supprimer : ce produit a des commandes associées à son historique.'
      );
    }
    throw error;
  }

  revalidatePath('/admin/produits');
  redirect('/admin/produits');
}

export async function addVariant(productId: string, formData: FormData) {
  await requireAdmin();

  const parsed = parseVariantForm(formData);
  if (!parsed.success) {
    throw new Error('Variante invalide');
  }

  await prisma.variant.create({ data: { ...parsed.data, productId } });

  revalidatePath(`/admin/produits/${productId}`);
}

export async function updateVariant(productId: string, variantId: string, formData: FormData) {
  await requireAdmin();

  const parsed = parseVariantForm(formData);
  if (!parsed.success) {
    throw new Error('Variante invalide');
  }

  await prisma.variant.update({ where: { id: variantId }, data: parsed.data });

  revalidatePath(`/admin/produits/${productId}`);
}

export async function deleteVariant(productId: string, variantId: string) {
  await requireAdmin();

  try {
    await prisma.variant.delete({ where: { id: variantId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new Error(
        'Impossible de supprimer : cette variante a des commandes associées à son historique.'
      );
    }
    throw error;
  }

  revalidatePath(`/admin/produits/${productId}`);
}

const imageUploadSchema = z.object({
  alt: z.string().trim().min(1).max(200),
});

export async function uploadImage(productId: string, formData: FormData) {
  await requireAdmin();

  const file = formData.get('file');
  const parsed = imageUploadSchema.safeParse({ alt: formData.get('alt') });

  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Fichier image manquant');
  }
  if (!parsed.success) {
    throw new Error("Texte alternatif manquant ou invalide");
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image');
  }

  const { url, path } = await uploadProductImage(productId, file);

  const lastImage = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { position: 'desc' },
  });

  await prisma.productImage.create({
    data: {
      productId,
      url,
      path,
      alt: parsed.data.alt,
      position: (lastImage?.position ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/produits/${productId}`);
}

export async function deleteImage(productId: string, imageId: string) {
  await requireAdmin();

  const image = await prisma.productImage.findUniqueOrThrow({ where: { id: imageId } });

  if (image.path) {
    await deleteProductImage(image.path);
  }
  await prisma.productImage.delete({ where: { id: imageId } });

  revalidatePath(`/admin/produits/${productId}`);
}
