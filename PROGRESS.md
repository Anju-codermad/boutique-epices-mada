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

## Fait (Phase 7 — droit de rétractation, remboursements)

- [x] `prisma/schema.prisma` : ajout de `Order.stripePaymentIntentId` (nécessaire pour émettre
      un vrai remboursement Stripe) et `Order.deliveredAt` (point de départ du délai légal de
      rétractation de 14 jours, vente à distance UE). Migration
      `20260813114052_order_refund_tracking`.
- [x] `app/api/webhooks/stripe/route.ts` : capture `session.payment_intent` à la confirmation
      du paiement et le stocke sur la commande.
- [x] `lib/orders.ts` : `returnDeadline()`/`isReturnEligible()`, calcul serveur de
      l'éligibilité au retour (jamais fait confiance à un statut envoyé par le client).
      `RETURN_WINDOW_DAYS = 14` centralisé dans `lib/stripe.ts`.
- [x] `app/compte/commandes/` : bouton « Demander un retour » (Server Action `requestReturn`)
      visible uniquement si la commande est `DELIVERED` et dans les 14 jours suivant
      `deliveredAt` — revérifié côté serveur à chaque appel, pas seulement à l'affichage.
      Passage à `RETURN_REQUESTED`. Messages d'état pour chaque statut (délai dépassé, retour
      demandé, retour reçu).
- [x] `app/admin/commandes/actions.ts` : passage à `DELIVERED` horodate automatiquement
      `deliveredAt`. Passage à `REFUNDED` déclenche un **vrai remboursement Stripe**
      (`stripe.refunds.create`, jamais un simple changement de statut) puis, seulement si
      l'appel réussit, restocke les variantes retournées et met à jour la commande dans une
      transaction ; garde d'idempotence (`existing.status !== 'REFUNDED'`) pour ne jamais
      rembourser/restocker deux fois. Email de remboursement envoyé en best-effort (comme les
      autres emails transactionnels).
- [x] **Testé de bout en bout** (Postgres local, sessions JWT signées manuellement pour un
      compte client et un compte admin, Playwright éphémère) : affichage correct des 3 états
      (éligible avec échéance affichée, délai dépassé, retour déjà demandé) ; clic réel sur
      « Demander un retour » vérifié en base (transition `DELIVERED` → `RETURN_REQUESTED`) ;
      tentative de remboursement admin avec un faux `payment_intent` confirmée en échec
      propre (l'appel Stripe échoue, l'erreur remonte via `error.tsx`, **aucune mutation en
      base n'a lieu** — statut et stock inchangés, vérifié directement en base) ; logique de
      transaction (restock + passage à `REFUNDED`) rejouée isolément avec succès ; ré-soumission
      d'un remboursement déjà effectué confirmée sans nouvel appel Stripe ni double restock
      (idempotence). Données de test nettoyées après vérification.
- [ ] **Non testable dans cet environnement** : le vrai appel `stripe.refunds.create` échoue
      systématiquement ici faute de clé Stripe réelle (erreur réseau/format de réponse) — la
      logique métier autour de l'appel est entièrement vérifiée, mais l'appel lui-même
      nécessitera un vrai compte Stripe (clés de test) pour être validé en conditions réelles.

## Fait (Phase 8 — SEO, accessibilité, RGPD, analytics)

- [x] **SEO** : `metadataBase` + template de titre (`%s — Boutique d'épices de Madagascar`)
      centralisés dans `app/layout.tsx` (`lib/seo.ts` pour les constantes partagées),
      Open Graph/Twitter card par défaut. Toutes les pages qui avaient déjà un titre complet
      manuel (`cgv`, `confidentialite`, `contact`, `faq`, `mentions-legales`,
      `produits/[slug]`) adaptées au template pour éviter le double suffixe. Métadonnées
      (titre + description) ajoutées aux pages qui n'en avaient aucune (`boutique`) ;
      `robots: { index: false, follow: false }` ajouté sur les pages privées/sans intérêt
      SEO (`panier` via un nouveau `layout.tsx` — page client, `connexion`,
      `commande/confirmation`, tout `/compte/*` via `compte/layout.tsx`, tout `/admin/*` via
      un nouveau `admin/layout.tsx`, `newsletter/confirmation`,
      `newsletter/desinscription`, `design-system`).
- [x] `app/robots.ts` et `app/sitemap.ts` (dynamiques, App Router) : sitemap listant les
      pages statiques, les catégories et tous les produits (avec `lastModified`) ; robots.txt
      excluant `/admin`, `/compte`, `/panier`, `/connexion`, `/commande/confirmation`, `/api`.
- [x] Données structurées JSON-LD `Product` (schema.org) sur la fiche produit — nom,
      description, images, `AggregateOffer` (prix min/max TTC, disponibilité),
      `AggregateRating` si des avis existent.
- [x] **Accessibilité** : lien d'évitement (« Aller au contenu principal ») ajouté dans
      `app/layout.tsx`. Audit automatisé (axe-core via Playwright, éphémère) sur les pages
      clés (accueil, boutique, fiche produit, panier, contact, FAQ) : 2 violations réelles
      trouvées et corrigées — hiérarchie de titres cassée sur `/boutique` (H1 suivi
      directement d'un H3 dans `ProductCard`, sans H2 intermédiaire : ajout d'un H2
      `sr-only`), et landmarks `<nav>` non uniques (plusieurs zones de navigation sans nom
      accessible : `aria-label` ajouté sur la navigation principale et mobile du `Header`, le
      fil d'ariane de la fiche produit, et la pagination de `/boutique`). Audit rejoué après
      correction : 0 violation sur les 6 pages testées.
- [x] **Analytics** : `@vercel/analytics` (composant `<Analytics />` dans `app/layout.tsx`) —
      cookieless par nature, correspond au choix « Plausible ou Vercel Analytics (sans cookie
      tiers) » de `CLAUDE.md`. Fonctionne automatiquement une fois déployé sur Vercel, no-op
      en local.
- [x] **RGPD** : la page `/confidentialite` mentionnait un bandeau de consentement cookies et
      des « cookies de mesure d'audience » qui n'existaient pas dans le code. Corrigée pour
      refléter la réalité technique : seuls des cookies strictement nécessaires (session)
      sont utilisés, la mesure d'audience est anonymisée et sans cookie (exemptée de
      consentement selon les recommandations CNIL), donc pas de bandeau cookies affiché —
      cohérence entre le texte légal et l'implémentation plutôt que l'ajout d'un bandeau
      superflu.
- [x] **Testé** : `npm run typecheck`/`lint`/`build` (build de prod confirme la génération
      statique de `/robots.txt` et `/sitemap.xml`) ; vérifié en local que `/sitemap.xml`
      liste bien produits/catégories/pages statiques, que `/robots.txt` exclut les bonnes
      routes, que le JSON-LD et les balises `<title>`/`<meta description>`/OG s'affichent
      correctement sur une fiche produit réelle, et que `<meta name="robots" content="noindex,
nofollow">` est bien présent sur une page admin même authentifiée (session admin
      simulée par JWT signé).

## Fait (Phase 9, 1/3 — tests automatisés)

- [x] **Vitest** (`vitest.config.ts`, environnement `jsdom`, alias `@/*`) : 30 tests
      unitaires sur la logique pure la plus sensible du projet.
  - `lib/format.test.ts` : `formatPriceTtc`.
  - `lib/orders.test.ts` : `returnDeadline`/`isReturnEligible` (délai de rétractation de 14
    jours), avec horloge simulée (`vi.useFakeTimers`) pour tester les bornes exactement.
  - `lib/pricing.test.ts` : nouveau module `lib/pricing.ts`, **extrait de
    `app/api/checkout/route.ts`** pour le rendre testable en isolation — calcul de remise
    (pourcentage arrondi, montant fixe jamais négatif ni supérieur au sous-total), frais de
    livraison (seuil d'offre), validité d'un coupon (dates, quota d'usage), et le calcul du
    total combinant les trois (y compris le cas d'un coupon invalide qui ne doit jamais faire
    échouer le calcul, et la livraison qui doit rester basée sur le sous-total **avant**
    remise). `app/api/checkout/route.ts` réécrit pour utiliser ce module au lieu de calculs
    en ligne, revérifié par un test manuel du endpoint (commande créée avec le bon total,
    puis correctement supprimée quand l'appel Stripe échoue faute de vraies clés — même
    garantie qu'avant le refactor).
  - `hooks/useCart.test.ts` : store Zustand testé directement (`useCart.getState()`), sans
    rendu React — refus d'ajout à stock nul, cumul de quantité, suppression, mise à jour de
    quantité (y compris retrait automatique à 0), vidage du panier, sélecteurs de total/count.
  - `npm test` ajouté aux scripts et à la CI (`.github/workflows/ci.yml`).
- [x] **Playwright** (`playwright.config.ts`, `tests/e2e/`) : suite E2E désormais **committée
      dans le dépôt** (contrairement aux scripts Playwright ad hoc utilisés jusqu'ici pour
      les vérifications ponctuelles en session, toujours installés puis désinstallés).
      Volontairement limitée aux parcours qui ne dépendent d'aucune API externe
      (Stripe/Resend indisponibles en CI) :
  - `navigation.spec.ts` : accueil (héro, familles d'épices), catalogue (liste, filtre
    catégorie, recherche texte), fiche produit (affichage, 404 sur slug inconnu).
  - `cart.spec.ts` : ajout au panier depuis la fiche produit (badge du header, tiroir
    panier), page `/panier` (modification de quantité, retrait d'un article).
  - `npm run test:e2e` ajouté aux scripts. Nouveau job CI `e2e` avec un vrai service
    PostgreSQL (migrations + seed réels, pas de placeholder), installation des navigateurs
    Playwright (`playwright install --with-deps chromium` — cet environnement de session a
    un Chromium préinstallé à une version différente, `playwright.config.ts` expose donc une
    option `PLAYWRIGHT_CHROMIUM_EXECUTABLE` pour pointer dessus sans jamais lancer
    `playwright install` en session), rapport uploadé en artefact en cas d'échec.
  - **Testé** : les 6 tests passent en local contre le Postgres de session (deux bugs réels
    trouvés et corrigés dans les tests eux-mêmes en cours d'écriture — sélecteurs `getByRole`
    ambigus entre le bouton panier du header et le bouton « Ajouter au panier », et entre le
    nom du produit dans le tiroir et son label de quantité — corrigés avec `exact: true`).

## Fait (Phase 9, 2/3 — sécurité)

- [x] **Faille XSS trouvée et corrigée** : le JSON-LD `Product` ajouté en Phase 8
      (`app/produits/[slug]/page.tsx`) sérialisait `product.description` sans échappement
      dans un `dangerouslySetInnerHTML`. Une description contenant littéralement `</script>`
      aurait pu casser hors de la balise et injecter du JS arbitraire (XSS stocké, exploitable
      par quiconque peut écrire une description produit). Corrigé en remplaçant tout
      caractère `<` par sa séquence d'échappement Unicode dans le JSON sérialisé.
- [x] **En-têtes de sécurité** (`next.config.mjs`, `headers()`, appliqués à toutes les
      routes) : `Content-Security-Policy`, `X-Content-Type-Options: nosniff`,
      `X-Frame-Options: DENY` (anti-clickjacking), `Referrer-Policy:
    strict-origin-when-cross-origin`, `Permissions-Policy` (caméra/micro/géoloc désactivés,
      non utilisés par le site), `Strict-Transport-Security`.
  - **CSP** : `object-src none`, `frame-ancestors none`, `base-uri self`, `form-action self`
    apportent une protection réelle immédiate. `script-src`/`style-src` gardent
    `'unsafe-inline'` (pas de nonce) — un CSP strict à base de nonce demanderait d'étendre le
    `matcher` du middleware à toutes les routes et de le valider contre un vrai déploiement
    Vercel ; noté comme durcissement post-lancement plutôt que livré sans pouvoir le tester
    en conditions réelles.
  - **Testé** : `npm run build && npm run start` (mode production, pas `next dev` — le mode
    dev échoue sous cette CSP à cause de `eval()` utilisé par le HMR de webpack, un faux
    positif propre au dev qui ne se produit pas en production) + Playwright éphémère
    vérifiant l'absence d'erreur console/page sur les pages clés et **le parcours complet
    d'ajout au panier fonctionnant toujours sous la CSP** (aucune fonctionnalité cassée).
- [x] **Revue ciblée** (grep + relecture) : aucun SQL brut (`$queryRaw`/`$executeRaw`,
      tout passe par le query builder Prisma paramétré), aucun `console.log` (seul
      `console.error` sur des objets d'erreur génériques, pas de token/donnée sensible),
      jeton de confirmation newsletter généré via `randomUUID()` (imprévisible), CSRF sur les
      Server Actions géré nativement par Next.js 14 (vérification de l'en-tête `Origin`), pas
      de secret commité (`.env.example` ne contient que des placeholders vides).
- [x] **Constaté, non corrigé — arbitrages documentés plutôt que actions unilatérales** :
  - `npm audit` : 5 vulnérabilités de niveau élevé, toutes dans Next 14.2.35/postcss/glob ;
    corrigées seulement par une montée vers Next 16, qui casserait le choix de stack
    verrouillé dans `CLAUDE.md`.
  - Pas de rate limiting sur `/api/contact`, `/api/newsletter/subscribe` ni `/connexion` : un
    limiteur en mémoire serait trompeur (Vercel exécute des fonctions serverless sans état
    partagé entre instances, donc inefficace en production) ; une vraie protection
    nécessiterait Vercel Firewall ou un store partagé (Upstash Redis) — décision
    d'infrastructure pour l'humain, pas quelque chose à simuler ici. Le formulaire de contact
    a déjà un honeypot (Jour 17).
  - `next start` (mode production) local échoue avec `UntrustedHost` d'Auth.js — Vercel
    détecte et fait confiance à l'hôte automatiquement en production (comportement documenté
    Auth.js v5), donc sans impact sur le déploiement cible ; non corrigé pour éviter
    d'affaiblir la validation d'hôte (`trustHost: true`) sans besoin réel.

## À faire ensuite

- [ ] Jour 9 : upload Supabase Storage — toujours **bloqué** sans compte Supabase réel
      (bucket + policies à créer par l'humain) ; le code peut être écrit (route protégée par
      le rôle admin, disponible depuis le Jour 10) mais pas testé.
- [ ] Phase 9, 3/3 — déploiement (préparation Vercel : documentation, variables
      d'environnement requises ; la création du compte/projet reste un point de blocage
      humain).
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
