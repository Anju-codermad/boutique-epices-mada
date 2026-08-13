# PROGRESS.md

Suivi de l'avancement du projet, session par session. Voir le plan d'exécution complet pour le
détail de chaque phase/jour.

## État actuel

Phase 1 (stack technique & fondations) terminée. `build`, `lint`, `typecheck` et `format:check`
passent tous. Le push vers GitHub est actuellement bloqué (voir "Points de blocage" ci-dessous) ;
le travail est commité localement en attendant.

## Fait

- [x] `CLAUDE.md` créé (stack, palette, structure de dossiers, règles impératives).
- [x] `PROGRESS.md` créé (ce fichier).
- [x] Projet Next.js 14.2.35 initialisé (App Router, TypeScript strict, Tailwind CSS 3,
      ESLint) — **volontairement pinné en v14**, `create-next-app@latest` installe du Next 16
      par défaut, non conforme au choix de stack verrouillé.
- [x] Structure de dossiers créée : `app/`, `components/ui/`, `components/shared/`, `hooks/`,
      `lib/`, `prisma/`, `types/`, `emails/`.
- [x] Prettier configuré (`prettier-plugin-tailwindcss`), scripts `format` / `format:check`.
- [x] Palette de marque (terracotta/forêt/or) et polices Playfair Display / Inter (`next/font/google`)
      intégrées dans `tailwind.config.ts` et `app/layout.tsx`.
- [x] Fondations shadcn/ui posées manuellement (`components.json`, `lib/utils.ts`, variables CSS
      thème, `tailwindcss-animate`) — **la CLI `shadcn init` est inutilisable dans cet
      environnement**, `ui.shadcn.com` est bloqué par la politique réseau (403 proxy). Les
      composants seront donc écrits à la main dans le style shadcn (Phase 2).
- [x] Prisma configuré (`prisma/schema.prisma` avec `DATABASE_URL`/`DIRECT_URL`), **pinné en
      Prisma 6** (`prisma@latest` = v7, incompatible avec le schéma classique `url`/`directUrl`,
      qui exigerait de migrer vers `prisma.config.ts`).
- [x] `.env.example` créé ; `.gitignore` durci pour ignorer tout `.env` (pas seulement
      `.env*.local`).
- [x] CI GitHub Actions (`.github/workflows/ci.yml`) : lint, typecheck, build sur chaque PR.
- [x] `README.md` réécrit pour le projet.

## À faire ensuite (Phase 1 → Phase 2)

- [ ] Résoudre le blocage de push GitHub (voir ci-dessous), ouvrir la PR de cette session.
- [ ] Créer les comptes Vercel / Supabase (humain).
- [ ] Récupérer la chaîne de connexion Supabase et renseigner `.env` (humain).
- [ ] Vérifier TVA/OSS auprès d'un comptable (humain).
- [ ] Ouvrir la démarche de conformité étiquetage/sanitaire UE pour l'import d'épices (humain,
      délai long — ne bloque pas le dev mais bloque le lancement commercial).
- [ ] Choisir le nom de domaine (humain).
- [ ] Phase 2 : `components/ui/Badge.tsx`, `Button.tsx`, `Card.tsx` (écrits à la main, style
      shadcn) + page `/design-system`.

## Points de blocage humains ouverts

- **Push GitHub bloqué** : l'app GitHub connectée à cette session n'a pas la permission
  d'écriture ("Contents") sur `Anju-codermad/boutique-epices-mada` (`403 Resource not
accessible by integration`). À corriger dans les paramètres de l'app GitHub /
  intégration côté claude.ai pour permettre les push et PR.
- **`ui.shadcn.com` bloqué par la politique réseau** de cet environnement d'exécution (403 sur
  le proxy sortant) — la CLI `shadcn` ne peut pas être utilisée ; contournement : composants
  shadcn écrits à la main (voir "Fait" ci-dessus). Pas d'action requise sauf si un accès à
  ce domaine est explicitement souhaité.
- Conformité étiquetage/sanitaire UE pour l'import/vente d'épices alimentaires (ouvert dès
  Phase 0, doit être résolu avant tout lancement commercial réel).
- Comptes tiers (Stripe, Vercel, Supabase, domaine) à créer par l'humain.
