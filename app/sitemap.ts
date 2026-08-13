import type { MetadataRoute } from 'next';

import { prisma } from '@/lib/prisma';
import { getAppUrl } from '@/lib/url';

const STATIC_ROUTES = [
  '',
  '/boutique',
  '/contact',
  '/faq',
  '/cgv',
  '/mentions-legales',
  '/confidentialite',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = getAppUrl();

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true } }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${appUrl}${path}`,
    changeFrequency: path === '' ? 'daily' : 'monthly',
    priority: path === '' ? 1 : 0.6,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${appUrl}/boutique?category=${category.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${appUrl}/produits/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
