import { PrismaPg } from '@prisma/adapter-pg';
import type { PrismaClient as PrismaClientConstructor } from '@prisma/client';

// Deux points d'entrée Prisma selon l'environnement d'exécution (voir next.config.mjs pour
// l'externalisation webpack correspondante) :
// - Node (local, `next start`) : point d'entrée par défaut `@prisma/client`, qui charge le
//   moteur wasm via `fs.readFileSync` + `WebAssembly.compile()` dynamique — fonctionne car
//   Node autorise la compilation WASM dynamique.
// - Cloudflare Workers (`wrangler.jsonc` définit `BUILD_TARGET=cloudflare`) : point d'entrée
//   `wasm.js`, qui charge le même moteur via un `import()` statique du fichier .wasm — seule
//   méthode autorisée par le runtime Workers, qui interdit la compilation WASM dynamique.
// require() plutôt qu'un import ESM conditionnel : les deux chemins restent des chaînes
// littérales détectables statiquement par webpack/esbuild, tout en ne résolvant qu'un seul
// des deux à l'exécution.
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = (
  process.env.BUILD_TARGET === 'cloudflare'
    ? require('.prisma/client/wasm.js')
    : require('@prisma/client')
) as { PrismaClient: typeof PrismaClientConstructor };
/* eslint-enable @typescript-eslint/no-require-imports */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientConstructor };

// Driver adapter (pg) plutôt que le moteur de requête natif : fonctionne aussi bien en local
// que dans le runtime Cloudflare Workers (nodejs_compat), qui ne peut pas exécuter le binaire
// Rust du moteur natif. `DATABASE_URL` reste la connexion poolée Supabase (pgBouncer).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
