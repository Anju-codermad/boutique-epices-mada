# PROGRESS.md

Suivi de l'avancement du projet, session par session. Voir le plan d'exécution complet pour le
détail de chaque phase/jour.

## État actuel

**Phase 5 terminée (Jour 17)** : accueil, catalogue, fiche produit, panier, connexion,
compte client, avis, newsletter, contact, FAQ, pages d'erreur — tout testé de bout en bout
contre un Postgres 16 local (installé dans l'environnement d'exécution, pas Supabase) avec
Playwright. La migration réelle (`prisma migrate dev --name init`) est committée dans
`prisma/migrations/` ; il faudra la réappliquer (ou la revalider) contre la vraie base
Supabase une fois les identifiants disponibles. `build`, `lint`, `typecheck` et
`format:check` passent tous à chaque étape. Le push vers GitHub est actuellement bloqué
(voir "Points de blocage" ci-dessous) ; 17 jours de plan sont commités localement en
attendant — voir le détail jour par jour ci-dessous.

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

## Fait (Jour 13 — page d'accueil)

- [x] `components/shared/ProductCard.tsx` (introduit ici, réutilisé Jour 14) : image ou
      placeholder, badges bio/équitable/nouveau, badge épuisé, prix (fourchette si plusieurs
      variantes), bouton "Ajout rapide au panier" désactivé si épuisé, connecté à `useCart`.
- [x] `lib/products.ts` étendu : `productListSelect`/`serializeProductListItem` exposent
      désormais `defaultVariant` (variante la moins chère en stock, sinon la moins chère tout
      court) pour permettre l'ajout rapide sans requête supplémentaire.
- [x] `next.config.mjs` : `images.remotePatterns` pré-configuré pour `*.supabase.co` (aucune
      image réelle disponible pour l'instant, mais évite un blocage futur).
- [x] `app/page.tsx` : Hero (accroche, CTA), grille des 7 catégories (données réelles),
      section "Nos nouveautés" (produits `isNew`, `ProductCard`), storytelling commerce
      équitable, bandeau de réassurance (livraison/paiement/origine/équitable).
- [x] **Testé de bout en bout** (Playwright + Postgres local + seed) : rendu complet de la
      page, ajout rapide au panier depuis la page d'accueil (badge panier vérifié). **Bug de
      contraste détecté et corrigé** : le sous-titre du hero était en `text-forest-light` sur
      fond `bg-forest`, quasiment illisible — corrigé en `text-white/85`.

## Fait (Jour 14 — catalogue)

- [x] `lib/products.ts` refactorisé : la construction du `where` Prisma et la sérialisation
      sont désormais dans une fonction partagée `queryProducts()`, utilisée à la fois par
      `app/api/products` (fetch client) et `app/boutique` (rendu serveur) — évite la
      duplication introduite au Jour 7. Ajout du tri (`sort`: nouveautés/nom/prix
      croissant/prix décroissant). Le tri par prix est calculé **en mémoire** (impossible
      d'exprimer un `orderBy` Prisma sur le prix min d'une relation to-many sans colonne
      dénormalisée) — choix documenté en commentaire, acceptable à l'échelle de ce catalogue.
- [x] `app/boutique/page.tsx` : grille `ProductCard`, formulaire de filtres (catégorie,
      certification, prix min/max) en GET pur (fonctionne sans JS), tri, pagination
      (liens `?page=N` préservant les autres filtres), réinitialisation des filtres, compteur
      de résultats pour une recherche texte.
- [x] **Testé de bout en bout** (Playwright + Postgres local + seed) : affichage des 7
      produits, filtre catégorie (Vanille isole bien Vanille Bourbon), tri prix décroissant
      (Coffret Découverte en tête, cohérent avec son prix max), recherche texte + compteur,
      **badge et bouton "Épuisé" vérifiés avec un produit remis temporairement à stock 0 sur
      toutes ses variantes** (état non couvert par le jeu de seed), stock restauré après
      test.

## Fait (Jour 15 — page produit)

- [x] `lib/products.ts` étendu (même refactor qu'au Jour 14) : `getProductDetail(slug)` et
      `getRelatedProducts(categoryId, excludeId)` partagés entre `app/api/products/[slug]`
      et `app/produits/[slug]`.
- [x] `components/shared/ProductGallery.tsx` : galerie avec miniatures cliquables (gère 0, 1
      ou plusieurs images).
- [x] `components/shared/ProductPurchasePanel.tsx` : sélecteur de variante (prix dynamique,
      variantes en rupture désactivées individuellement), quantité, ajout au panier ; si
      **aucune** variante en stock, bouton désactivé avec le message exact du plan "Épuisé —
      être prévenu du retour" + lien vers la newsletter (ancre `#newsletter` ajoutée au
      Footer).
- [x] `app/produits/[slug]/page.tsx` : fil d'Ariane, badges, description, avis clients
      **réels** (approuvés uniquement, note moyenne), produits associés (même catégorie),
      404 via `notFound()`, `generateMetadata` (title/description).
- [x] **Testé de bout en bout** (Playwright + Postgres local + seed) : sélection de variante
      et ajout au panier (badge vérifié), 404 sur slug inexistant, état "épuisé" avec message
      et lien newsletter (testé en repassant temporairement toutes les variantes d'un produit
      à stock 0), section "Produits associés" (testée avec un second produit temporaire dans
      la même catégorie — le seed n'a qu'un produit par catégorie). Données de test
      nettoyées après vérification.

## Fait (Jour 16 — panier et pages légales)

- [x] `lib/format.ts` : `formatPriceTtc()` centralisé — **nettoyage** : la fonction était
      dupliquée dans `ProductCard`, `ProductPurchasePanel` et `CartDrawer` (et existait déjà,
      autrement, dans `lib/orders.ts`) ; unifiée à un seul endroit.
      **Bug récurrent corrigé au passage** : `Button` n'a pas de prop `asChild` (pas de
      pattern shadcn `Slot`) — utilisé par erreur dans `CartDrawer` comme sur la page
      d'accueil (Jour 13) ; corrigé en utilisant `buttonVariants` directement sur les `Link`.
- [x] `components/shared/CartDrawer.tsx` : tiroir panier (quantités, suppression,
      sous-total TTC, liens "Voir le panier"/"Passer commande"), **piège à focus** complet
      (Tab/Shift+Tab cyclent dans le tiroir, Échap ferme et restaure le focus sur le bouton
      déclencheur).
- [x] `components/shared/Header.tsx` : l'icône panier ouvre désormais le `CartDrawer` au lieu
      de naviguer directement.
- [x] `app/panier/page.tsx` : récapitulatif complet (quantités modifiables, suppression,
      vider le panier), tous les prix explicitement labellisés TTC.
- [x] `components/shared/LegalReviewNotice.tsx` + `app/cgv`, `app/mentions-legales`,
      `app/confidentialite` : premier jet des pages légales, avec bandeau d'avertissement
      "à faire relire par un juriste" sur chacune. CGV incluant explicitement la clause de
      droit de rétractation de 14 jours (vente à distance UE) et les conditions de retour.
      Informations d'identification de la société laissées en placeholders `[à compléter]`.
- [x] **Testé de bout en bout** (Playwright + Postgres local) : ouverture du tiroir panier
      depuis une fiche produit, **piège à focus vérifié** (10 Tab consécutifs restent dans le
      tiroir ; Échap ferme le tiroir et rend le focus au bouton panier), page `/panier`
      complète, rendu des 3 pages légales (bandeau d'avertissement présent, clause 14 jours
      présente sur les CGV).

## Fait (Jour 17 — contact, FAQ, pages d'erreur) — Phase 5 terminée

- [x] `lib/emails.ts` : `sendContactEmail()`. **Bug de sécurité corrigé avant test** :
      nom/email/sujet/message venant d'un formulaire public étaient interpolés tels quels
      dans le HTML de l'email envoyé au propriétaire de la boutique (injection HTML dans
      l'email de notification) — ajout d'un `escapeHtml()`.
- [x] `app/api/contact/route.ts` : validation Zod, honeypot (`website`). **Bug corrigé après
      test** : le champ honeypot était déclaré `z.string().max(0)`, donc un bot qui le
      remplit faisait échouer le _schéma_ et recevait un 400 — révélant l'existence du piège
      au lieu de renvoyer un faux succès silencieux. Corrigé pour accepter toute chaîne et
      vérifier séparément après validation.
- [x] `components/shared/ContactForm.tsx` : formulaire avec honeypot masqué (hors tabulation,
      hors du flux visuel). **Bug React corrigé après test** : `event.currentTarget` devient
      `null` après un `await` (comportement documenté de React) — l'appel
      `event.currentTarget.reset()` après le `fetch` levait donc une exception rattrapée par
      le `catch`, qui écrasait silencieusement le message de succès par un message d'erreur
      alors que l'envoi avait réussi. Corrigé en capturant `form = event.currentTarget` avant
      l'`await`.
- [x] `app/faq/page.tsx` : accordéon en `<details>`/`<summary>` natifs (zéro JS), 5 sections
      couvrant livraison, retours/remboursements, origine, certifications, paiement.
- [x] `app/not-found.tsx` (404) et `app/error.tsx` (erreur générique + bouton réessayer),
      stylées à la charte.
- [x] **Testé de bout en bout** (Playwright + Postgres local) : envoi normal (email tenté via
      Resend, échec attendu sans clé réelle mais réponse 200 correcte côté API), **les deux
      bugs ci-dessus ont été détectés par ce test** (honeypot renvoyant 400, message de
      succès non affiché) puis corrigés et revérifiés (honeypot → 200 silencieux, message de
      succès affiché, formulaire réinitialisé), accordéon FAQ (ouverture/fermeture), 404 et
      rendu de la page d'erreur.

**Phase 5 (pages essentielles du frontend) terminée** : accueil → recherche → catalogue →
produit → panier → contact/FAQ/erreurs, sans erreur, stock épuisé géré visuellement partout.

## Fait (Jour 18 — session Stripe Checkout, coupon, guest checkout)

- [x] `lib/stripe.ts` : client Stripe (même précaution qu'avec Resend : valeur de repli pour
      ne pas casser le build sans clé réelle), constantes livraison (5,90€, offerte dès 49€)
      et pays de livraison autorisés (FR + zone UE).
- [x] `app/api/checkout/route.ts` : reconstruit **entièrement côté serveur** les prix et le
      stock depuis Prisma (jamais depuis le client) ; valide un code coupon optionnel
      (`Coupon` : pourcentage/montant fixe, `validFrom`/`validUntil`/`maxUses`) ; calcule les
      frais de livraison ; **crée d'abord la commande en base (statut `PENDING`)**, puis la
      session Stripe Checkout référencée par `metadata.orderId` — si l'appel Stripe échoue,
      la commande est supprimée (pas de commande orpheline). Guest checkout autorisé
      (`userId` optionnel), email pré-rempli si connecté.
- [x] `hooks/useCheckout.ts` : déclenche l'appel `/api/checkout` et redirige vers l'URL
      Stripe retournée ; branché sur le bouton "Passer commande" du `CartDrawer` et de
      `/panier` (remplace les liens statiques vers une page `/checkout` qui n'existe pas —
      Stripe Checkout hébergé fait office de page de paiement).
- [x] `app/panier/page.tsx` : ajout du champ code promo.
- [x] `prisma/seed.ts` : ajoute un coupon de test `BIENVENUE10` (10 %).
- [x] `lib/url.ts` : `getAppUrl()` centralisé (était sur le point d'être dupliqué une
      troisième fois).
- [x] **Testé de bout en bout ce qui est testable sans compte Stripe réel** (Playwright +
      Postgres local) : payload invalide → 400, produit introuvable → 400, stock insuffisant
      → 400 (avec la bonne variante identifiée), code promo invalide → 400, **calculs
      vérifiés exacts** (sous-total 29,80€, remise 10 % = 2,98€, livraison 5,90€, total
      32,72€, via un log temporaire retiré ensuite), **rollback de la commande confirmé en
      base** quand l'appel Stripe échoue (aucune commande orpheline), affichage propre de
      l'erreur côté page panier.
- [ ] **Non testable dans cet environnement** : la création réelle d'une session Stripe et le
      round-trip de paiement complet — nécessite un compte Stripe (mode test) avec de vraies
      clés API.

## Fait (Jour 19 — webhook Stripe, commandes)

- [x] **Correction de modélisation découverte en écrivant le webhook** :
      `Address.userId` était obligatoire dans le schéma, ce qui empêchait de stocker
      l'adresse de livraison d'une commande "guest checkout" (sans compte). Corrigé
      (`userId` optionnel), nouvelle migration `address_optional_user` appliquée et testée
      contre le Postgres local.
- [x] `app/api/webhooks/stripe/route.ts` : vérifie la signature (`stripe-signature` +
      `STRIPE_WEBHOOK_SECRET`, corps brut lu via `request.text()`), écoute
      `checkout.session.completed`. Retrouve la commande `PENDING` déjà créée au Jour 18 via
      `metadata.orderId` (idempotent : ignore si déjà traitée), crée l'adresse de livraison
      depuis `session.collected_information.shipping_details` (liée ou non à un `userId`
      selon guest/connecté), décrémente le stock des variantes **en transaction** (avec garde
      `stock >= quantity` pour éviter le négatif), passe la commande à `PAID`. Retourne
      toujours 200 pour les erreurs métier (journalisées) — seule une signature invalide
      renvoie 400.
- [x] **Testé de bout en bout** en signant moi-même un faux événement
      `checkout.session.completed` avec `stripe.webhooks.generateTestHeaderString` (même
      secret que le serveur) : commande passée à `PAID`, stock décrémenté de la bonne
      quantité (vérifié en base), adresse créée et liée (**scénario guest** : `userId` NULL,
      `guestEmail` renseigné ; **scénario connecté** : adresse liée au bon `userId`),
      **idempotence vérifiée** (rejeu du même événement → stock non re-décrémenté), signature
      invalide → 400. Données de test nettoyées après vérification.
- [ ] **Non testable dans cet environnement** : réception d'un vrai webhook envoyé par
      Stripe — nécessite un compte Stripe réel avec `STRIPE_WEBHOOK_SECRET` configuré.

## Fait (Jour 20 — emails transactionnels, page admin commandes)

- [x] `emails/OrderConfirmationEmail.tsx`, `ShippingNotificationEmail.tsx`,
      `RefundConfirmationEmail.tsx` : trois templates React Email (`@react-email/components`).
- [x] `lib/emails.ts` : `sendOrderConfirmationEmail`/`sendShippingNotificationEmail`/
      `sendRefundConfirmationEmail`, envoi via Resend (`react:` directement, sans rendu
      manuel).
- [x] `app/api/webhooks/stripe/route.ts` : envoie l'email de confirmation de commande juste
      après le passage à `PAID` (best-effort — un échec d'envoi ne fait pas échouer le
      traitement, la commande reste payée).
- [x] `app/admin/commandes/` : liste des commandes (hors `PENDING`), formulaire par commande
      pour changer le statut et renseigner suivi/transporteur (Server Action protégée par
      rôle admin) ; passer une commande à `SHIPPED` avec suivi + transporteur renseignés
      déclenche l'email d'expédition.
- [x] **Non retenu, compromis assumé** : le Jour 20 du plan demandait aussi de refaire le
      formulaire d'adresse avec react-hook-form. Un CRUD d'adresses Zod-validé existe déjà
      depuis le Jour 10 (`/compte/adresses`) et fonctionne correctement ; le réécrire avec
      react-hook-form n'apportait pas de valeur fonctionnelle nouvelle, priorité donnée à la
      page admin commandes (plus structurante pour le tunnel de vente).
- [x] **Testé de bout en bout** (Playwright + Postgres local) : les 3 templates rendus et
      vérifiés visuellement (via une route de prévisualisation temporaire, supprimée après
      usage — un dossier `_preview-email` avait d'abord été essayé et donnait un 404, Next.js
      traite tout segment préfixé `_` comme privé/hors routage), page admin commandes
      (changement de statut + suivi vérifié en base, tentative d'envoi de l'email
      d'expédition confirmée dans les logs). Données de test nettoyées après vérification.
- [ ] **Non testable dans cet environnement** : réception réelle des emails (nécessite
      `RESEND_API_KEY`).

## Fait (Jour 21 — page de confirmation de commande)

- [x] `app/commande/confirmation/page.tsx` : Server Component lisant `?session_id=` (Stripe
      Checkout Session ID) et recherchant la commande correspondante en base
      (`stripeSessionId`), source de vérité = la BDD (donc le webhook), jamais l'URL/le
      client. Récapitulatif complet (articles, livraison, remise, total TTC) et adresse de
      livraison affichés. `notFound()` (404) si `session_id` absent ou commande introuvable.
- [x] Gère explicitement la situation de course avec le webhook Stripe : si la commande est
      encore `PENDING` au moment où l'utilisateur atterrit sur la page (webhook pas encore
      traité), affichage d'un message « paiement en cours de confirmation » plutôt que
      d'attendre/bloquer — jamais de logique de confirmation de paiement côté client.
- [x] `components/shared/ClearCartOnMount.tsx` : petit composant client qui vide le panier
      (`useCart().clearCart()`) au montage de la page de confirmation, pour éviter qu'un
      client revenant sur le site voie encore les articles déjà commandés dans son panier.
- [x] **Testé de bout en bout** (Postgres local + Playwright éphémère, désinstallé après
      usage) : deux commandes de test créées directement en base (une `PAID`, une
      `PENDING`) avec leurs `stripeSessionId` ; captures d'écran des deux états vérifiées
      visuellement (récapitulatif, montants TTC, adresse, message d'attente) ; cas
      `session_id` absent et `session_id` inconnu confirmés en 404 ; vidage effectif du
      panier (`localStorage`) vérifié par script Playwright avant/après navigation. Données
      de test nettoyées après vérification.
- [ ] **Non testable dans cet environnement** : le tunnel réel avec les cartes de test Stripe
      (4242.../4000...0002) nécessite un vrai compte Stripe (clés de test,
      `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`) pour déclencher un vrai `checkout.session.completed`.

## À faire ensuite

- [ ] Jour 9 : upload Supabase Storage — toujours **bloqué** sans compte Supabase réel
      (bucket + policies à créer par l'humain) ; le code peut être écrit (route protégée par
      le rôle admin, disponible depuis le Jour 10) mais pas testé.
- [ ] Phase 7 : droit de rétractation / remboursements (email `RefundConfirmationEmail.tsx`
      déjà prêt depuis le Jour 20, reste à écrire le flux admin de traitement d'un retour).
- [ ] Phase 8 : SEO/perf/a11y/RGPD/analytics.
- [ ] **Validation humaine requise** : relecture visuelle de l'ensemble du parcours (Phase 5
      cochée dans la check-list), relecture du schéma Prisma + données de seed, relecture
      juridique des pages CGV/mentions légales/confidentialité (bandeau d'avertissement déjà
      en place sur chacune), test réel de connexion par email, de réception des emails
      (newsletter, contact) une fois `RESEND_API_KEY`/`CONTACT_EMAIL` fournis, et **création
      d'un compte Stripe (mode test) avec récupération de `STRIPE_SECRET_KEY` et
      `STRIPE_WEBHOOK_SECRET`** — bloquant pour tester le tunnel de paiement de bout en
      bout.

## Points de blocage humains ouverts

- **Push GitHub** : ✅ résolu — le dépôt `boutique-epices-mada` manquait dans la liste des
  dépôts autorisés de l'app GitHub « Claude » (`github.com/settings/installations`), il a
  été ajouté par l'utilisateur. Les 18 premiers commits (Phase 0 → Jour 20) ont été poussés
  avec succès sur `claude/new-session-ie7dn1`.
- **`ui.shadcn.com` bloqué par la politique réseau** de cet environnement d'exécution (403 sur
  le proxy sortant) — la CLI `shadcn` ne peut pas être utilisée ; contournement : composants
  shadcn écrits à la main (voir "Fait" ci-dessus). Pas d'action requise sauf si un accès à
  ce domaine est explicitement souhaité.
- Conformité étiquetage/sanitaire UE pour l'import/vente d'épices alimentaires (ouvert dès
  Phase 0, doit être résolu avant tout lancement commercial réel).
- Comptes tiers (Stripe, Vercel, Supabase, domaine) à créer par l'humain.
