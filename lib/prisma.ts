import { getCloudflareContext } from '@opennextjs/cloudflare';
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
const isCloudflare = process.env.BUILD_TARGET === 'cloudflare';

/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = (
  isCloudflare ? require('.prisma/client/wasm.js') : require('@prisma/client')
) as { PrismaClient: typeof PrismaClientConstructor };
/* eslint-enable @typescript-eslint/no-require-imports */

function createClient(connectionString: string | undefined) {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClientConstructor = isCloudflare
  ? // Cloudflare Workers interdit de réutiliser une connexion (socket pg.Pool) ouverte lors
    // d'une requête précédente : une requête qui tente de le faire reste bloquée jusqu'à
    // l'annulation par le watchdog du runtime, au lieu d'échouer immédiatement. Un client
    // Prisma singleton (fonctionnant très bien en local) provoque donc ce blocage dès la
    // deuxième requête Workers. On crée ici un client neuf à chaque accès à une propriété du
    // proxy (`prisma.category`, `prisma.$transaction`, ...), c'est-à-dire une fois par appel de
    // requête — bon marché grâce à Hyperdrive, qui maintient le vrai pool de connexions Postgres
    // en dehors de l'isolate (voir wrangler.jsonc). `env.HYPERDRIVE.connectionString` est lu de
    // façon synchrone via `getCloudflareContext()` : en production comme sous `wrangler dev`, le
    // contexte Cloudflare est déjà déposé sur le scope global avant que ce code ne s'exécute.
    new Proxy({} as PrismaClientConstructor, {
      get(_target, prop, receiver) {
        const { env } = getCloudflareContext();
        const client = createClient(env.HYPERDRIVE?.connectionString ?? process.env.DATABASE_URL);
        return Reflect.get(client, prop, receiver);
      },
    })
  : // Node (local) : un singleton global est sûr et évite de rouvrir une connexion à chaque
    // requête ; mis en cache sur `globalThis` pour survivre au rechargement à chaud de `next dev`.
    ((globalThis as unknown as { prisma?: PrismaClientConstructor }).prisma ??=
      createClient(process.env.DATABASE_URL));
