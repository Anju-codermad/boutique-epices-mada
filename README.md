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
npx prisma migrate dev    # migrations en développement
npx prisma db seed        # seed — JAMAIS sur la base de production
```

## ⚠️ Règle importante

Le script `prisma/seed.ts` ne doit **jamais** être exécuté sur la base de données de
production — uniquement en local ou en staging.
