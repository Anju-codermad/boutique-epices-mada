# Fiche de cadrage produit — Boutique d'épices de Madagascar

Document de référence issu de la Phase 0 du plan d'exécution (Jour 1). Sert de rappel du
positionnement et du cadre commercial ; ne remplace pas un conseil comptable ou juridique.

## Positionnement

Boutique en ligne premium d'épices de Madagascar, vendues en direct depuis Madagascar (vente
directe producteur → consommateur, sans intermédiaire grossiste), avec un positionnement
**commerce équitable** et **qualité premium** (récolte artisanale, petites séries).

## Les 7 familles de produits

| Famille | Description courte |
|---|---|
| **Vanille** | Gousses de vanille Bourbon de Madagascar, récoltées et préparées artisanalement. |
| **Poivre sauvage** | Voatsiperifery, poivre sauvage endémique de Madagascar, cueilli en forêt. |
| **Cannelle** | Écorce fine et parfum intense. |
| **Curcuma** | Frais séché et moulu, cultivé sans intrants chimiques. |
| **Gingembre** | Séché, récolté à maturité pour un maximum de piquant. |
| **Piment** | Piments malgaches séchés, du plus doux au plus relevé. |
| **Coffrets cadeaux** | Sélections d'épices en coffrets, pour offrir ou se faire plaisir. |

Chaque famille décline 2 à 3 variantes (poids différents), avec badges **Bio** et/ou
**Équitable** selon le produit. Détail complet et à jour : `prisma/seed.ts`.

## Marché cible

France en priorité, extensible au reste de l'Union européenne (zone de livraison actuellement
configurée dans `lib/stripe.ts` : France + UE). Clientèle particulière (B2C), recherchant des
produits d'épicerie fine, engagée sur l'origine et le commerce équitable.

## Devise et prix

Euro (EUR) exclusivement au lancement. Tous les prix sont **affichés et calculés en TTC**
(obligation légale française pour la vente aux particuliers), jamais de prix HT visible côté
client — voir la règle correspondante dans `CLAUDE.md`. Le multi-devises (GBP, CHF) est prévu
en post-lancement (Phase 10 du plan), pas au lancement.

## TVA applicable — vente à distance vers des particuliers dans l'UE

⚠️ **À faire vérifier par un comptable avant tout lancement commercial réel** — ce qui suit est
un rappel du mécanisme général, pas un conseil fiscal.

- Pour la vente à distance de biens (B2C) au sein de l'UE, le principe général est la taxation
  au **taux de TVA du pays de destination** du client (et non celui du vendeur), au-delà d'un
  seuil annuel de 10 000 € de ventes à distance intracommunautaires cumulées.
- Le régime **OSS (One-Stop-Shop, "guichet unique")** permet de déclarer et payer en une seule
  fois, via l'administration fiscale française, la TVA due dans les différents pays de l'UE où
  des ventes ont eu lieu — évite de s'immatriculer à la TVA dans chaque pays de destination.
- Les denrées alimentaires bénéficient en France de taux de TVA réduits selon leur nature
  (produits alimentaires courants à 5,5 %, certains produits à taux intermédiaire ou normal
  selon leur classification) — la classification exacte des épices vendues (import hors UE
  depuis Madagascar) doit être confirmée par un comptable, de même que son incidence sur les
  ventes à distance vers d'autres pays UE (chaque pays de destination applique ses propres
  taux et catégories).
- Cette question est distincte de la conformité étiquetage/sanitaire à l'import (voir point de
  blocage ouvert dès la Phase 0 dans `PROGRESS.md`), qui doit être traitée séparément auprès
  d'un organisme spécialisé.

## Points de blocage humains liés à ce cadrage

Voir `PROGRESS.md` → section « Points de blocage humains ouverts » pour le suivi à jour
(comptes tiers, conformité sanitaire, TVA/OSS, relectures juridiques).
