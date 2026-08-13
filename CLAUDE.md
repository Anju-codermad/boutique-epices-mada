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

| Couche | Choix |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript strict + Tailwind CSS + shadcn/ui + `next/image` |
| Backend/BDD | Prisma ORM + PostgreSQL via Supabase |
| Stockage images | Supabase Storage (Cloudinary en option) |
| Auth | Auth.js v5 + adapter Prisma (magic link via Resend) |
| Paiement | Stripe Checkout |
| Emails | Resend + React Email |
| Monitoring | Sentry |
| Analytics | Plausible ou Vercel Analytics (sans cookie tiers) |
| Recherche | Filtres + recherche texte Prisma locale (Algolia en option) |
| Hébergement | Vercel Pro |
| Base de données | Supabase Pro |
| i18n | next-intl (FR au lancement, EN + multi-devises en post-lancement) |
| Tests | Vitest (unitaire) + Playwright (E2E) |

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
