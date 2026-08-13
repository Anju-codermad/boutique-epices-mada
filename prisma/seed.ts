/**
 * Seed de développement — 7 familles de produits, 2-3 variantes chacune.
 *
 * ⚠️ Ne JAMAIS exécuter ce script sur la base de données de production.
 * Réservé au local/staging (`npx prisma db seed`).
 */
import { CertificationType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedVariant = {
  sku: string;
  weightGrams: number;
  priceTtcCents: number;
  stock: number;
};

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  certifications: CertificationType[];
  isNew?: boolean;
  variants: SeedVariant[];
};

type SeedCategory = {
  name: string;
  slug: string;
  description: string;
  products: SeedProduct[];
};

const categories: SeedCategory[] = [
  {
    name: 'Vanille',
    slug: 'vanille',
    description: 'Gousses de vanille Bourbon de Madagascar, récoltées et préparées artisanalement.',
    products: [
      {
        name: 'Vanille Bourbon',
        slug: 'vanille-bourbon',
        description:
          'Gousses de vanille Bourbon grand cru, charnues et parfumées, récoltées à la main sur les hauts plateaux malgaches.',
        certifications: [CertificationType.BIO, CertificationType.EQUITABLE],
        isNew: true,
        variants: [
          { sku: 'VAN-BOU-3', weightGrams: 15, priceTtcCents: 1490, stock: 40 },
          { sku: 'VAN-BOU-6', weightGrams: 30, priceTtcCents: 2690, stock: 25 },
          { sku: 'VAN-BOU-12', weightGrams: 60, priceTtcCents: 4990, stock: 10 },
        ],
      },
    ],
  },
  {
    name: 'Poivre sauvage',
    slug: 'poivre-sauvage',
    description: 'Voatsiperifery, poivre sauvage endémique de Madagascar, cueilli en forêt.',
    products: [
      {
        name: 'Voatsiperifery noir',
        slug: 'voatsiperifery-noir',
        description:
          'Poivre sauvage grimpant, cueilli à la main en forêt primaire. Arômes boisés et fruités, rare et recherché des grands chefs.',
        certifications: [CertificationType.EQUITABLE],
        variants: [
          { sku: 'POI-VOA-50', weightGrams: 50, priceTtcCents: 1890, stock: 30 },
          { sku: 'POI-VOA-100', weightGrams: 100, priceTtcCents: 3390, stock: 15 },
        ],
      },
    ],
  },
  {
    name: 'Cannelle',
    slug: 'cannelle',
    description: 'Cannelle de Madagascar, écorce fine et parfum intense.',
    products: [
      {
        name: 'Bâtons de cannelle',
        slug: 'batons-de-cannelle',
        description:
          'Bâtons de cannelle roulés à la main, séchés au soleil. Parfait pour infusions et pâtisseries.',
        certifications: [CertificationType.BIO],
        variants: [
          { sku: 'CAN-BAT-100', weightGrams: 100, priceTtcCents: 890, stock: 60 },
          { sku: 'CAN-BAT-250', weightGrams: 250, priceTtcCents: 1790, stock: 35 },
        ],
      },
    ],
  },
  {
    name: 'Curcuma',
    slug: 'curcuma',
    description: 'Curcuma frais séché et moulu, cultivé sans intrants chimiques.',
    products: [
      {
        name: 'Curcuma en poudre',
        slug: 'curcuma-en-poudre',
        description:
          'Rhizomes de curcuma séchés puis moulus finement. Couleur intense, saveur légèrement poivrée.',
        certifications: [CertificationType.BIO, CertificationType.EQUITABLE],
        variants: [
          { sku: 'CUR-POU-100', weightGrams: 100, priceTtcCents: 690, stock: 80 },
          { sku: 'CUR-POU-250', weightGrams: 250, priceTtcCents: 1390, stock: 45 },
          { sku: 'CUR-POU-500', weightGrams: 500, priceTtcCents: 2490, stock: 20 },
        ],
      },
    ],
  },
  {
    name: 'Gingembre',
    slug: 'gingembre',
    description: 'Gingembre séché, récolté à maturité pour un maximum de piquant.',
    products: [
      {
        name: 'Gingembre en poudre',
        slug: 'gingembre-en-poudre',
        description:
          "Racines de gingembre séchées et moulues, au piquant franc et à l'arôme citronné.",
        certifications: [CertificationType.BIO],
        variants: [
          { sku: 'GIN-POU-100', weightGrams: 100, priceTtcCents: 650, stock: 55 },
          { sku: 'GIN-POU-250', weightGrams: 250, priceTtcCents: 1290, stock: 30 },
        ],
      },
    ],
  },
  {
    name: 'Piment',
    slug: 'piment',
    description: 'Piments malgaches séchés, du plus doux au plus relevé.',
    products: [
      {
        name: 'Piment oiseau séché',
        slug: 'piment-oiseau-seche',
        description:
          'Petits piments oiseau séchés au soleil, intensité relevée, idéal pour rehausser sauces et marinades.',
        certifications: [CertificationType.EQUITABLE],
        variants: [
          { sku: 'PIM-OIS-50', weightGrams: 50, priceTtcCents: 590, stock: 0 },
          { sku: 'PIM-OIS-100', weightGrams: 100, priceTtcCents: 990, stock: 20 },
        ],
      },
    ],
  },
  {
    name: 'Coffrets cadeaux',
    slug: 'coffrets-cadeaux',
    description: "Sélections d'épices en coffrets, pour offrir ou se faire plaisir.",
    products: [
      {
        name: 'Coffret Découverte Madagascar',
        slug: 'coffret-decouverte-madagascar',
        description:
          "Un coffret réunissant vanille, poivre sauvage, cannelle et curcuma pour découvrir l'essentiel des épices malgaches.",
        certifications: [CertificationType.BIO, CertificationType.EQUITABLE],
        isNew: true,
        variants: [
          { sku: 'COF-DEC-1', weightGrams: 400, priceTtcCents: 3990, stock: 18 },
          { sku: 'COF-DEC-2', weightGrams: 700, priceTtcCents: 6490, stock: 8 },
        ],
      },
    ],
  },
];

async function main() {
  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });

    for (const product of category.products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {
          name: product.name,
          description: product.description,
          certifications: product.certifications,
          isNew: product.isNew ?? false,
          categoryId: createdCategory.id,
          variants: {
            deleteMany: {},
            create: product.variants,
          },
        },
        create: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          certifications: product.certifications,
          isNew: product.isNew ?? false,
          categoryId: createdCategory.id,
          variants: {
            create: product.variants,
          },
        },
      });
    }
  }

  await prisma.coupon.upsert({
    where: { code: 'BIENVENUE10' },
    update: {},
    create: {
      code: 'BIENVENUE10',
      type: 'PERCENTAGE',
      value: 10,
      validFrom: new Date('2024-01-01'),
    },
  });

  console.log(`Seed terminé : ${categories.length} catégories, 1 coupon.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
