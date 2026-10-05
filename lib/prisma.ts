import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Driver adapter (pg) plutôt que le moteur de requête natif : fonctionne aussi bien en local
// que dans le runtime Cloudflare Workers (nodejs_compat), qui ne peut pas exécuter le binaire
// Rust du moteur natif. `DATABASE_URL` reste la connexion poolée Supabase (pgBouncer).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
