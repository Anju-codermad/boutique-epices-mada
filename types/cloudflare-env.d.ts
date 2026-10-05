// Complète `CloudflareEnv` (déclaré par @opennextjs/cloudflare) avec le binding Hyperdrive
// défini dans wrangler.jsonc, utilisé par lib/prisma.ts pour obtenir une chaîne de connexion
// Postgres par requête. On ne dépend pas de `@cloudflare/workers-types` pour un seul binding :
// seule la forme réellement utilisée (`connectionString`) est déclarée ici.
declare global {
  interface CloudflareEnv {
    HYPERDRIVE?: { connectionString: string };
  }
}

export {};
