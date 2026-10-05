# Boutique d'épices de Madagascar

Boutique en ligne premium d'épices de Madagascar (vanille, poivre sauvage/voatsiperifery,
cannelle, curcuma, gingembre, piment, coffrets cadeaux). Commerce équitable, vente directe,
marché cible France/Europe.

Voir `CLAUDE.md` pour la stack, les conventions et les règles impératives du projet, et
`PROGRESS.md` pour le suivi d'avancement.

## Démarrage

```bash
npm install
cp .env.example .env   # renseigner DATABASE_URL / DIRECT_URL (Supabase)
npx prisma generate
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Commandes

```bash
npm run dev            # serveur de développement
npm run build           # build de production
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm run format            # Prettier (écrit)
npm run format:check      # Prettier (vérifie)
npm test                  # tests unitaires (Vitest)
npm run test:e2e          # tests end-to-end (Playwright — nécessite une base de données)
npx prisma migrate dev    # migrations en développement
npx prisma db seed        # seed — JAMAIS sur la base de production
npm run cf:build           # build pour Cloudflare Workers
npm run cf:preview         # build + wrangler dev (test local du runtime Workers)
npm run cf:deploy          # build + déploiement réel (voir section Déploiement ci-dessous)
```

## ⚠️ Règle importante

Le script `prisma/seed.ts` ne doit **jamais** être exécuté sur la base de données de
production — uniquement en local ou en staging.

## Déploiement (Cloudflare Workers + Supabase)

Le projet est hébergé sur **Cloudflare Workers** via l'adaptateur
[OpenNext](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare`), qui exige
Next.js ≥ 15.5.27. Base de données : Supabase (PostgreSQL + Storage), accédée via Prisma
avec le driver adapter `pg` (le moteur de requête natif ne peut pas s'exécuter dans le
runtime Workers) et **Cloudflare Hyperdrive** pour le pooling de connexions (voir
`CLAUDE.md` pour le détail technique de ces deux contraintes).

### 1. Base de données Supabase

1. Créer un projet Supabase (mode production).
2. Récupérer les deux chaînes de connexion Postgres dans les paramètres du projet : la
   connexion **poolée** (pgBouncer, port 6543) pour `DATABASE_URL`, et la connexion
   **directe** (port 5432) pour `DIRECT_URL` (nécessaire aux migrations Prisma, qui ne
   passent pas par le pooler).
3. Appliquer les migrations contre cette base **avant** ou pendant le premier déploiement :
   `npx prisma migrate deploy` (à lancer manuellement, ou via une étape de CI/CD dédiée —
   Cloudflare n'exécute pas les migrations automatiquement).
4. **Ne jamais exécuter `npx prisma db seed` contre la base de production.**

### 2. Cloudflare Hyperdrive

Un Worker ne peut pas réutiliser une connexion Postgres (socket) ouverte lors d'une requête
précédente — Hyperdrive est la solution Cloudflare pour ce problème : il maintient le pool
de connexions réel à la périphérie, en dehors de l'isolate.

1. Depuis un compte Cloudflare authentifié : `npx wrangler hyperdrive create
   boutique-epices-mada --connection-string="<DATABASE_URL Supabase>"`.
2. Remplacer le `id` placeholder dans `wrangler.jsonc` (section `hyperdrive`) par celui
   renvoyé par la commande ci-dessus.

### 3. Variables d'environnement (secrets Cloudflare Workers)

Toutes les variables listées dans `.env.example` doivent être renseignées en production,
via `npx wrangler secret put <NOM>` (pour les secrets) ou la section `vars` de
`wrangler.jsonc` (pour les valeurs non sensibles) :

| Variable                        | Origine                                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `DATABASE_URL` / `DIRECT_URL`   | Supabase → Project Settings → Database                                                          |
| `AUTH_SECRET`                   | Générer avec `npx auth secret`                                                                  |
| `RESEND_API_KEY` / `EMAIL_FROM` | Compte Resend, domaine d'envoi vérifié                                                          |
| `NEXT_PUBLIC_APP_URL`           | URL publique du site (domaine Workers par défaut ou domaine personnalisé)                       |
| `CONTACT_EMAIL`                 | Adresse recevant les messages du formulaire de contact                                          |
| `STRIPE_SECRET_KEY`             | Compte Stripe (clé **live** en production, clé test en preview)                                 |
| `STRIPE_WEBHOOK_SECRET`         | Voir étape 4 ci-dessous                                                                         |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Project Settings → API                                                               |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase → Project Settings → API (clé `service_role`, secrète)                                 |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Compte Upstash (facultatif : sans ces variables, la limitation de débit sur `/api/checkout` et `/api/contact` est simplement désactivée) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`  | Compte Plausible (facultatif : sans domaine, le script d'analytics ne s'affiche pas)             |

### 4. Webhook Stripe

Dans le dashboard Stripe, créer un endpoint webhook pointant vers
`https://<domaine>/api/webhooks/stripe`, écoutant l'événement `checkout.session.completed`.
Copier le secret de signature généré (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET`.

### 5. Storage Supabase (images produits)

Dans Supabase Storage, créer un bucket **public** nommé exactement `product-images` (utilisé
par `/admin/produits` pour l'upload d'images). Le domaine `*.supabase.co` est déjà autorisé
dans `next.config.mjs` (`images.remotePatterns`).

### 6. Cache incrémental (ISR) — bucket R2

Avant le premier déploiement, créer le bucket R2 utilisé par OpenNext pour le cache
incrémental de Next.js : `npx wrangler r2 bucket create boutique-epices-mada-opennext-cache`.

### 7. Build et déploiement

```bash
npm run cf:deploy   # next build + opennextjs-cloudflare build + wrangler deploy
```

### 8. Après le premier déploiement

- Vérifier `/robots.txt` et `/sitemap.xml`.
- Tester le parcours de paiement complet avec une carte de test Stripe, puis en mode live
  avec un montant réel avant l'ouverture au public.
- Vérifier la réception réelle des emails transactionnels (confirmation de commande, magic
  link de connexion, contact, newsletter).
