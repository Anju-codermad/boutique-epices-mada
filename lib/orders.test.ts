import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isReturnEligible, returnDeadline } from '@/lib/orders';

describe('returnDeadline', () => {
  it('retourne null si la commande n’est pas livrée', () => {
    expect(returnDeadline({ status: 'PAID', deliveredAt: null })).toBeNull();
    expect(returnDeadline({ status: 'DELIVERED', deliveredAt: null })).toBeNull();
  });

  it('ajoute 14 jours à la date de livraison', () => {
    const deliveredAt = new Date('2026-01-01T10:00:00Z');
    const deadline = returnDeadline({ status: 'DELIVERED', deliveredAt });
    expect(deadline?.toISOString()).toBe('2026-01-15T10:00:00.000Z');
  });
});

describe('isReturnEligible', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('est éligible dans les 14 jours suivant la livraison', () => {
    const deliveredAt = new Date('2026-01-05T00:00:00Z');
    expect(isReturnEligible({ status: 'DELIVERED', deliveredAt })).toBe(true);
  });

  it('n’est plus éligible après 14 jours', () => {
    const deliveredAt = new Date('2025-12-20T00:00:00Z');
    expect(isReturnEligible({ status: 'DELIVERED', deliveredAt })).toBe(false);
  });

  it('n’est pas éligible pour une commande non livrée', () => {
    expect(isReturnEligible({ status: 'RETURN_REQUESTED', deliveredAt: null })).toBe(false);
  });
});
