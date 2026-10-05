import type { Metadata } from 'next';

export const SITE_NAME = "Boutique d'épices de Madagascar";
export const SITE_DESCRIPTION =
  'Épices premium de Madagascar — vanille, poivre sauvage, cannelle, curcuma, gingembre, piment. Commerce équitable, vente directe.';

/** À réutiliser sur toute page privée ou sans intérêt pour l'indexation (compte, admin, panier...). */
export const NOINDEX_ROBOTS: Metadata['robots'] = { index: false, follow: false };
