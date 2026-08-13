import type { CertificationType } from '@prisma/client';

export interface ProductVariant {
  id: string;
  sku: string;
  weightGrams: number;
  priceTtcCents: number;
  stock: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  position: number;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string | null };
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  certifications: CertificationType[];
  isNew: boolean;
  disponible: boolean;
  minPriceTtcCents: number | null;
  maxPriceTtcCents: number | null;
  category: { name: string; slug: string };
  image: { url: string; alt: string } | null;
  defaultVariant: {
    id: string;
    priceTtcCents: number;
    stock: number;
    weightGrams: number;
  } | null;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  certifications: CertificationType[];
  isNew: boolean;
  category: { name: string; slug: string };
  variants: ProductVariant[];
  images: ProductImage[];
  reviews: ProductReview[];
  disponible: boolean;
  averageRating: number | null;
}
