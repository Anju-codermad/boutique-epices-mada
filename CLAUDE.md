# CLAUDE.md

Ce fichier guide Claude Code (et tout contributeur) sur les conventions de ce projet.

## Projet

Boutique en ligne premium d'épices de Madagascar (vanille, poivre sauvage/voatsiperifery,
cannelle, curcuma, gingembre, piment, coffrets cadeaux). Commerce équitable, vente directe
depuis Madagascar, marché cible France/Europe, devise euro, **prix affichés et calculés en TTC**
(obligation légale pour la vente aux particuliers en France).

Le déroulé complet du projet (phases, tâches, points de blocage humains) est documenté dans le
plan d'exécution fourni séparément et suivi au fil de l'eau dans `PROGRESS.md`.

## Stack technique (verrouillée)

| Couche          | Choix                                                                                 |
| --------------- | ------------------------------------------------------------------------------------- |
| Frontend        | Next.js 15 (App Router) + TypeScript strict + Tailwind CSS + shadcn/ui + `next/image` |
| Backend/BDD     | Prisma ORM (driver adapter `pg`, moteur wasm) + PostgreSQL via Supabase               |
| Stockage images | Supabase Storage (Cloudinary en option)                                               |
| Auth            | Auth.js v5 + adapter Prisma (magic link via Resend)                                   |
| Paiement        | Stripe Checkout                                                                       |
| Emails          | Resend + React Email                                                                  |
| Monitoring      | Sentry                                                                                |
| Analytics       | Plausible (sans cookie tiers)                                                        |
| Recherche       | Filtres + recherche texte Prisma locale (Algolia en option)                           |
| Hébergement     | Cloudflare Workers (adaptateur OpenNext) + Hyperdrive                                 |
| Base de données | Supabase Pro                                                                          |
| i18n            | next-intl (FR au lancement, EN + multi-devises en post-lancement)                     |
| Tests           | Vitest (unitaire) + Playwright (E2E)                                                  |

**Déviations par rapport au plan d'exécution initial** (décisions utilisateur explicites,
voir `PROGRESS.md` pour le détail) :

- **Hébergement : Cloudflare Workers plutôt que Vercel Pro.** Next.js 15 est requis par
  l'adaptateur OpenNext Cloudflare (`@opennextjs/cloudflare`, nécessite next >=15.5.27) —
  d'où la mise à jour de Next.js 14 vers 15 qui en découle.
- **Prisma s'exécute via un driver adapter (`@prisma/adapter-pg`) et le moteur de requête
  wasm (`engineType = "client"`)**, pas le moteur natif (binaire Rust), incompatible avec le
  runtime Workers (pas de process natif, pas de compilation WASM dynamique). Voir
  `lib/prisma.ts` : deux points d'entrée Prisma selon l'environnement (Node en local,
  point d'entrée "workerd" sous Cloudflare), et un client neuf par requête sous Cloudflare
  (connexion `pg.Pool` non réutilisable entre deux requêtes Workers) plutôt qu'un singleton.
- **Cloudflare Hyperdrive** est nécessaire en production pour que ce client-par-requête
  reste performant (pool de connexions Postgres géré à la périphérie, hors de l'isolate).
  Son identifiant doit être créé depuis un vrai compte Cloudflare authentifié
  (`npx wrangler hyperdrive create ...`) avant tout déploiement réel — voir le commentaire
  dans `wrangler.jsonc`.
- **Analytics : Plausible uniquement** (pas d'option Vercel Analytics, qui ne fonctionne que
  déployé sur Vercel).

## Design system

- Palette : terracotta `#C17A4F`, vert forêt `#2D5A27`, or `#D4A843`
- Typographie : Playfair Display (titres), Inter (corps) — via `next/font`
- Badges produit : Bio, Équitable, Nouveau, **Épuisé** (grisé, non cliquable)

## Structure de dossiers

```
app/                # routes App Router
components/ui/      # composants shadcn/ui et primitives de design system
components/shared/  # composants métier réutilisables (Header, Footer, ProductCard, ...)
hooks/               # hooks React (useCart, useProduct, ...)
lib/                 # utilitaires, clients (Prisma, Supabase, Stripe, Resend, emails)
prisma/              # schema.prisma, migrations, seed.ts
types/               # types partagés
emails/              # templates React Email
```

## Commandes utiles

```
npm run dev            # serveur de développement
npm run build           # build de production
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm test                 # tests Vitest
npm run test:e2e          # tests Playwright
npx prisma migrate dev    # migrations en développement
npx prisma db seed        # seed (JAMAIS en production, voir règle ci-dessous)
npm run cf:build           # build pour Cloudflare Workers (next build + opennextjs-cloudflare)
npm run cf:preview         # build + wrangler dev (test local du runtime Workers)
npm run cf:deploy          # build + déploiement réel (nécessite un compte Cloudflare authentifié)
```

## Règles impératives

- **TypeScript strict** partout, pas de `any` non justifié.
- **`next/image` obligatoire** pour toutes les images (jamais de `<img>` brut).
- **Validation Zod systématique côté serveur** sur toute entrée utilisateur (API routes, Server Actions).
- **Jamais de prix ou de stock accepté tel quel depuis le client** : toujours recalculés/revérifiés
  côté serveur depuis la base de données (Prisma) avant toute écriture ou tout paiement.
- **Tous les prix affichés et calculés doivent être TTC**, et clairement labellisés comme tels
  (obligation légale UE pour la vente aux particuliers).
- **`prisma/seed.ts` ne doit jamais être exécuté sur la base de production** — uniquement en
  local/staging.
- **Une branche par session de travail**, jamais de commit direct sur `main`, une pull request
  à la fin de chaque session.
- Mettre à jour `PROGRESS.md` à la fin de chaque session pour faciliter la reprise.
