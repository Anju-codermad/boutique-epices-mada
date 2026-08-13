import { describe, expect, it } from 'vitest';

import { formatPriceTtc } from '@/lib/format';

describe('formatPriceTtc', () => {
  it('formate des centimes ronds', () => {
    expect(formatPriceTtc(1490)).toBe('14,90 € TTC');
  });

  it('formate zéro', () => {
    expect(formatPriceTtc(0)).toBe('0,00 € TTC');
  });

  it('arrondit et complète les centimes manquants', () => {
    expect(formatPriceTtc(500)).toBe('5,00 € TTC');
  });
});
