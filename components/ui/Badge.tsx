import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        bio: 'border-transparent bg-forest text-white',
        equitable: 'border-transparent bg-terracotta text-white',
        nouveau: 'border-transparent bg-gold text-forest-dark',
        epuise: 'border-transparent bg-muted text-muted-foreground cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'bio',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

const badgeLabels: Record<NonNullable<BadgeProps['variant']>, string> = {
  bio: 'Bio',
  equitable: 'Équitable',
  nouveau: 'Nouveau',
  epuise: 'Épuisé',
};

function Badge({ className, variant = 'bio', children, ...props }: BadgeProps) {
  const isEpuise = variant === 'epuise';
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      aria-disabled={isEpuise || undefined}
      {...props}
    >
      {children ?? badgeLabels[variant as NonNullable<BadgeProps['variant']>]}
    </span>
  );
}

export { Badge, badgeVariants };
