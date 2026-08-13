# PROGRESS.md

Suivi de l'avancement du projet, session par session. Voir le plan d'exécution complet pour le
détail de chaque phase/jour.

## État actuel

Phase 3 (Jour 5 et 6) terminée. Un Postgres 16 local (installé dans l'environnement
d'exécution, pas Supabase) a permis de réellement exécuter `prisma migrate dev --name init`
et `prisma db seed` de bout en bout — la migration réelle est committée dans
`prisma/migrations/`. Il faudra la réappliquer (ou la revalider) contre la vraie base
Supabase une fois les identifiants disponibles. `build`, `lint`, `typecheck` et
`format:check` passent tous. Le push vers GitHub est actuellement bloqué (voir "Points de
blocage" ci-dessous) ; le travail est commité localement en attendant.

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

## Fait (Phase 2)

- [x] `components/ui/Badge.tsx` (variantes bio / équitable / nouveau / épuisé — épuisé grisé,
      non cliquable, `<span>` pas `<button>`).
- [x] `components/ui/Button.tsx` (variantes primary/secondary/outline/ghost, tailles sm/md/lg).
- [x] `components/ui/Card.tsx` (Card, CardHeader, CardTitle, CardDescription, CardContent,
      CardFooter).
- [x] `app/design-system/page.tsx` : page de validation visuelle de la palette, typographie,
      badges, boutons, exemple de carte produit.

## Fait (Phase 3, partiel)

- [x] `prisma/schema.prisma` complet : `User`/`Account`/`Session`/`VerificationToken`
      (Auth.js, `User.role`), `Category`, `Product` (+ `certifications: CertificationType[]`,
      `isNew`), `Variant` (poids, `priceTtcCents`, stock, `sku`), `ProductImage`, `Review`
      (statut pending/approved), `Address`, `Coupon` (pourcentage/montant fixe, validité),
      `Order` (statuts incluant `RETURN_REQUESTED`/`RETURNED`/`REFUNDED`, `trackingNumber`,
      `carrier`, guest checkout via `guestEmail`/`userId` optionnel), `OrderItem` (prix figé
      à l'achat), `NewsletterSubscriber` (statut pending/confirmed).
      Prix et montants stockés en **centimes** (entiers) pour éviter les erreurs d'arrondi.
- [x] `prisma validate` + `prisma generate` OK. Migration réelle générée et appliquée
      (`prisma migrate dev --name init`) contre un Postgres 16 local temporaire →
      `prisma/migrations/20260813062148_init/` committée.
- [x] `lib/prisma.ts` : client Prisma singleton (pattern standard Next.js dev/hot-reload).
- [x] `prisma/seed.ts` (Jour 6) : 7 familles de produits (Vanille, Poivre sauvage/
      voatsiperifery, Cannelle, Curcuma, Gingembre, Piment, Coffrets cadeaux), 2-3 variantes
      chacune, descriptions FR, badges bio/équitable, prix TTC en centimes. `upsert`
      idempotent (testé : deux exécutions successives → toujours 7 produits / 16 variantes,
      aucun doublon). Un produit (Piment oiseau séché 50g) volontairement à stock 0 pour
      tester l'état "épuisé" en Phase 5. `package.json#prisma.seed` configuré (`tsx`).

## Fait (Jour 7)

- [x] `app/api/products/route.ts` : liste paginée (`page`/`pageSize`), filtres
      `category`/`certification`/`minPrice`/`maxPrice`, recherche texte `q` (nom +
      description, insensible à la casse). Validation Zod des query params, 400 si invalides.
- [x] `app/api/products/[slug]/route.ts` : détail avec variantes, avis **approuvés**
      uniquement, note moyenne, champ calculé `disponible` (stock total des variantes > 0),
      404 si introuvable.
- [x] `lib/products.ts` : sérialisation partagée de la liste (prix min/max, image
      principale, disponibilité).
- [x] Testé de bout en bout contre le Postgres local + seed : liste, filtre catégorie,
      recherche texte, filtre certification (+ 400 sur certification invalide), filtre prix,
      détail produit (y compris le produit avec une variante à stock 0 →
      `disponible: true` car une autre variante reste en stock), 404 sur slug inexistant.

## Fait (Jour 8)

- [x] `hooks/useCart.ts` (Zustand + `persist` localStorage) : `addItem`, `removeItem`,
      `updateQuantity`, `clearCart`, sélecteurs `selectCartTotalTtcCents`/
      `selectCartItemCount` (+ hooks `useCartTotalTtcCents`/`useCartItemCount`). `addItem`
      refuse l'ajout si `stock <= 0` et retourne `{ success: false, error }` exploitable par
      l'UI. Logique vérifiée par un script ad hoc (refus stock 0, ajout, cumul de quantité,
      total/count, suppression via quantité 0) — pas encore de suite Vitest (prévue Jour 26).
- [x] `hooks/useProduct.ts` : fetch `/api/products/[slug]`, états loading/error/404.
- [x] `types/product.ts` : types partagés `ProductDetail`/`ProductVariant`/etc.

## Fait (Jour 10 — Auth.js, avant Jour 9 car l'upload en dépend)

- [x] Auth.js v5 configuré : `auth.config.ts` (config compatible Edge — sans adapter Prisma
      ni provider Resend, utilisée par le middleware) + `auth.ts` (config complète, adapter
      Prisma + provider `Resend` pour le magic link) — **découplage nécessaire** : mettre
      Prisma/Resend directement dans le middleware casse le build (APIs Node.js absentes du
      runtime Edge de Next.js).
- [x] `middleware.ts` : protège `/compte/*` (redirection `/connexion` si non connecté) et
      `/admin/*` (redirection si non connecté **ou** rôle ≠ `ADMIN`, + re-authentification
      forcée après 2h via `session.iat`, plus stricte que la zone client standard).
- [x] `app/connexion/page.tsx` : formulaire magic link (Server Action `signIn("resend", ...)`).
- [x] `app/compte/` : layout + 3 sous-pages avec Server Actions Zod-validées —
      `commandes` (historique + suivi de colis si renseigné), `adresses` (CRUD complet),
      `informations` (modification du nom).
- [x] `types/next-auth.d.ts` : augmentation de types (`role` sur `User`/`AdapterUser`/`JWT`,
      `Session.user.id`/`role`/`iat`).
- [x] **Testé de bout en bout** contre le Postgres local avec un utilisateur de test et un
      cookie de session JWT signé manuellement (pas de vrai Resend disponible) : middleware
      (redirections `/compte` et `/admin`), page connexion (capture d'écran), commandes
      (affichage tracking), adresses (création **et** suppression confirmées en base), mise à
      jour des informations personnelles. Données de test nettoyées après vérification.
- [ ] **Non testable dans cet environnement** : l'envoi réel du magic link (nécessite un vrai
      `RESEND_API_KEY`) et donc la connexion "pour de vrai" par un humain.

## Fait (Jour 11 — avis clients et newsletter)

- [x] `app/api/products/[slug]/reviews/route.ts` : soumission d'avis (connexion requise, 401
      sinon), statut `PENDING`, validation Zod (note 1-5, commentaire).
- [x] `app/admin/avis/` : page de modération (protégée par rôle admin, défense en profondeur
      en plus du middleware) + Server Actions `approveReview`/`rejectReview`.
- [x] `lib/resend.ts` + `lib/emails.ts` : client Resend, `sendNewsletterConfirmationEmail`.
      Le SDK Resend lève une erreur **à l'instanciation** si la clé est absente (casse le
      build) — corrigé par une valeur de repli qui ne permet aucun envoi réel.
- [x] `app/api/newsletter/subscribe/route.ts` : double opt-in RGPD, statut `PENDING` →
      email de confirmation → `app/newsletter/confirmation/page.tsx` passe le statut à
      `CONFIRMED`. `app/newsletter/desinscription/page.tsx` : désinscription (suppression)
      avec confirmation explicite (Server Action, pas d'action sur simple GET).
- [x] **Testé de bout en bout** contre le Postgres local (utilisateurs client + admin,
      sessions JWT signées manuellement) : avis refusé sans connexion (401), soumis
      connecté (201, PENDING), visible en modération admin, approuvé (vérifié en base :
      passé à `APPROVED`), remonté par l'API produit avec la bonne note moyenne ; non-admin
      redirigé hors de `/admin/avis` par le middleware. Newsletter : inscription crée bien le
      `NewsletterSubscriber` en `PENDING` avec jeton (l'envoi Resend échoue, attendu, sans
      clé réelle — géré sans casser le flux), confirmation passe à `CONFIRMED` et invalide le
      jeton (réutilisation → "lien invalide"), désinscription supprime l'abonné. Données de
      test nettoyées après vérification.
- [ ] **Non testable dans cet environnement** : l'envoi réel de l'email de confirmation
      (nécessite un vrai `RESEND_API_KEY`).

## À faire ensuite (Phase 4 → Phase 5)

- [ ] Résoudre le blocage de push GitHub (voir ci-dessous), ouvrir la PR de cette session.
- [ ] **Validation humaine requise** : relecture visuelle de `/design-system` (Phase 2),
      relecture du schéma Prisma + données de seed (Phase 3), test réel de connexion par
      email et de réception de l'email de confirmation newsletter une fois `RESEND_API_KEY`
      fourni (Phase 4).
- [ ] Créer les comptes Vercel / Supabase (humain).
- [ ] Récupérer la chaîne de connexion Supabase, renseigner `.env`, puis rejouer
      `npx prisma migrate dev` contre la vraie base (bloqué tant que non fourni).
- [ ] Créer un compte Resend, récupérer `RESEND_API_KEY`, vérifier le domaine d'envoi
      (nécessaire pour que le magic link et les emails newsletter partent réellement).
- [ ] Vérifier TVA/OSS auprès d'un comptable (humain).
- [ ] Ouvrir la démarche de conformité étiquetage/sanitaire UE pour l'import d'épices (humain,
      délai long — ne bloque pas le dev mais bloque le lancement commercial).
- [ ] Choisir le nom de domaine (humain).
- [ ] Jour 9 : upload Supabase Storage — **bloqué** sans compte Supabase réel (bucket +
      policies à créer par l'humain) ; le code peut être écrit (route protégée par le rôle
      admin, maintenant disponible via Auth.js) mais pas testé.

## Fait (Jour 12 — layout global)

- [x] `components/shared/Header.tsx` : logo, méga-menu catégories (données réelles depuis
      Prisma), `SearchBar` connectée à `/api/products` (suggestions live + lien "voir tous les
      résultats"), icône panier avec compteur (`useCartItemCount`), état de connexion
      (nom + déconnexion, ou lien connexion), menu burger responsive.
- [x] `components/shared/Footer.tsx` : formulaire newsletter (`NewsletterForm`, appelle
      `/api/newsletter/subscribe`), liens légaux (CGV, mentions légales, confidentialité, FAQ,
      contact — pages pas encore créées, Jours 16-17), réseaux sociaux.
      **Icônes Facebook/Instagram indisponibles** : `lucide-react` a retiré les icônes de
      marques ; remplacées par des liens texte.
- [x] `app/actions/auth-actions.ts` : `signOutAction` (Server Action, utilisée par le bouton
      déconnexion dans un composant client).
- [x] `app/layout.tsx` : Header/Footer intégrés au layout racine (récupère `session` via
      `auth()` et `categories` via Prisma). **Effet de bord accepté** : le layout devient
      async et utilise `cookies` (via `auth()`), donc **toutes les pages passent en rendu
      dynamique** (plus de génération statique) — compromis normal pour un header conscient
      de la session, à revisiter en Phase 8 (perf) si besoin.
- [x] **Testé de bout en bout** avec le Postgres local + Playwright : méga-menu (7
      catégories réelles), recherche live (suggestions + lien vers résultats), menu mobile
      responsive, état connecté (nom affiché) et déconnexion (cookie de session supprimé,
      vérifié après rechargement), rendu du footer. Données de test nettoyées après
      vérification.

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
