import { describe, expect, it } from 'vitest';

import { checkCheckoutRateLimit, checkContactRateLimit, clientIdentifier } from '@/lib/rate-limit';

describe('clientIdentifier', () => {
  it('extrait la première IP de x-forwarded-for', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(clientIdentifier(request)).toBe('1.2.3.4');
  });

  it('retombe sur "unknown" si l’en-tête est absent', () => {
    const request = new Request('http://localhost');
    expect(clientIdentifier(request)).toBe('unknown');
  });
});

describe('limitation de débit sans Upstash configuré (environnement de test)', () => {
  it('checkCheckoutRateLimit autorise toujours (fail-open)', async () => {
    expect(await checkCheckoutRateLimit('test-ip')).toBe(true);
  });

  it('checkContactRateLimit autorise toujours (fail-open)', async () => {
    expect(await checkContactRateLimit('test-ip')).toBe(true);
  });
});
