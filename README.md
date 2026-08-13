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
```

## ⚠️ Règle importante

Le script `prisma/seed.ts` ne doit **jamais** être exécuté sur la base de données de
production — uniquement en local ou en staging.

## Déploiement (Vercel + Supabase)

Le projet est conçu pour Vercel (hébergement) + Supabase (PostgreSQL + Storage), sans
configuration Vercel particulière au-delà des variables d'environnement — Next.js 14 est
détecté automatiquement (build command `next build`, `postinstall` régénère le client Prisma
à chaque install).

### 1. Base de données Supabase

1. Créer un projet Supabase (mode production).
2. Récupérer les deux chaînes de connexion Postgres dans les paramètres du projet : la
   connexion **poolée** (pgBouncer, port 6543) pour `DATABASE_URL`, et la connexion
   **directe** (port 5432) pour `DIRECT_URL` (nécessaire aux migrations Prisma, qui ne
   passent pas par le pooler).
3. Appliquer les migrations contre cette base **avant** ou pendant le premier déploiement :
   `npx prisma migrate deploy` (Vercel n'exécute pas les migrations automatiquement — à
   lancer manuellement, ou via une étape de CI/CD dédiée).
4. **Ne jamais exécuter `npx prisma db seed` contre la base de production.**

### 2. Variables d'environnement (paramètres du projet Vercel)

Toutes les variables listées dans `.env.example` doivent être renseignées en production :

| Variable                        | Origine                                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `DATABASE_URL` / `DIRECT_URL`   | Supabase → Project Settings → Database                                                          |
| `AUTH_SECRET`                   | Générer avec `npx auth secret`                                                                  |
| `RESEND_API_KEY` / `EMAIL_FROM` | Compte Resend, domaine d'envoi vérifié                                                          |
| `NEXT_PUBLIC_APP_URL`           | URL publique du site (ex. `https://boutique-epices-mada.vercel.app` ou le domaine personnalisé) |
| `CONTACT_EMAIL`                 | Adresse recevant les messages du formulaire de contact                                          |
| `STRIPE_SECRET_KEY`             | Compte Stripe (clé **live** en production, clé test en preview)                                 |
| `STRIPE_WEBHOOK_SECRET`         | Voir étape 3 ci-dessous                                                                         |

### 3. Webhook Stripe

Dans le dashboard Stripe, créer un endpoint webhook pointant vers
`https://<domaine>/api/webhooks/stripe`, écoutant l'événement `checkout.session.completed`.
Copier le secret de signature généré (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET`.

### 4. Storage Supabase (images produits)

Créer un bucket public dans Supabase Storage pour les images produits ; le domaine
`*.supabase.co` est déjà autorisé dans `next.config.mjs` (`images.remotePatterns`).

### 5. Après le premier déploiement

- Vérifier `/robots.txt` et `/sitemap.xml`.
- Tester le parcours de paiement complet avec une carte de test Stripe, puis en mode live
  avec un montant réel avant l'ouverture au public.
- Vérifier la réception réelle des emails transactionnels (confirmation de commande, magic
  link de connexion, contact, newsletter).
