import type { MetadataRoute } from 'next';

import { getAppUrl } from '@/lib/url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/compte', '/panier', '/connexion', '/commande/confirmation', '/api'],
    },
    sitemap: `${getAppUrl()}/sitemap.xml`,
  };
}
