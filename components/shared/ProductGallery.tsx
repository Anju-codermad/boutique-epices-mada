'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImage {
  url: string;
  alt: string;
}

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {active ? (
          <Image
            src={active.url}
            alt={active.alt}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 40vw, 90vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-serif text-6xl text-muted-foreground">
            {productName.charAt(0)}
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 overflow-hidden rounded-md border-2 ${
                index === activeIndex ? 'border-terracotta' : 'border-transparent'
              }`}
              aria-label={`Voir l'image ${index + 1}`}
            >
              <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
