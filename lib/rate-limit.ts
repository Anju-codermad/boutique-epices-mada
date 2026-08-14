import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Sans identifiants Upstash réels (UPSTASH_REDIS_REST_URL/TOKEN), la limitation est
// désactivée (fail-open) : contrairement à Stripe/Resend, mieux vaut ne pas protéger que
// bloquer tout le monde en l'absence de config — la limitation de débit est une protection
// en plus, pas une dépendance requise pour que le site fonctionne.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

function createLimiter(maxRequests: number, window: `${number} ${'s' | 'm' | 'h'}`) {
  if (!redisUrl || !redisToken) {
    return null;
  }
  return new Ratelimit({
    redis: new Redis({ url: redisUrl, token: redisToken }),
    limiter: Ratelimit.slidingWindow(maxRequests, window),
  });
}

// Checkout : plus permissif (un client légitime peut relancer après un paiement refusé).
const checkoutLimiter = createLimiter(10, '1 m');
// Contact : plus strict (cible fréquente de spam, en plus du honeypot déjà en place).
const contactLimiter = createLimiter(3, '10 m');

async function check(limiter: Ratelimit | null, identifier: string): Promise<boolean> {
  if (!limiter) {
    return true;
  }
  const result = await limiter.limit(identifier);
  return result.success;
}

/** Identifiant client à partir de l'IP transmise par le proxy (Vercel en production). */
export function clientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

export function checkCheckoutRateLimit(identifier: string) {
  return check(checkoutLimiter, `checkout:${identifier}`);
}

export function checkContactRateLimit(identifier: string) {
  return check(contactLimiter, `contact:${identifier}`);
}
