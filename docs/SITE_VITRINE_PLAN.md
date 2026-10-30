# Refonte vitrine publique CARZONE SARL — plan directeur

Statut : validé par la demande utilisateur du 29/10/2026. Exécution par phases déléguées à Claude Code, vérifiées par l'orchestrateur.

## 1. Objectifs

1. **Vitrine en 4 langues** : français, anglais, espagnol, chinois.
   - L'application interne reste en **3 langues** (fr, en, zh) : ne pas toucher `Locale` de l'app.
   - Nouveau type dédié vitrine : `SiteLocale = "fr" | "en" | "es" | "zh"`.
   - Cookie dédié `carzone-site-locale`, séparé du cookie applicatif `carzone-locale`.
2. **Détection automatique** de la langue du navigateur à la première visite (en-tête `Accept-Language`, pondéré par `q`), avec repli `fr`. Un choix manuel mémorisé dans le cookie prime toujours.
3. **Sélecteur de langue visible** dans l'en-tête (desktop et mobile), 4 langues avec libellés natives (Français, English, Español, 中文).
4. **Multi-pages réelles** (fin des ancres d'une page unique) :
   - `/` Accueil
   - `/vehicules` Stock & showroom (véhicules de la base Neon)
   - `/sur-mesure` Commande usine / import sur mesure
   - `/services` Services & Atelier SAV (entretien, pièces)
   - `/recharge` Bornes & solutions de recharge
   - `/equipe` Notre équipe
   - `/contact` Contact & accès showroom
5. **Page Notre équipe** : présentation du personnel par pôle (direction, commerce/showroom, après-vente/atelier, recharge/énergie, logistique/imports, administration/finance). Aucune identité inventée : cartes de pôle avec initiales, responsabilités et message de la direction. Noms/photos réels à fournir par le client pour finaliser.
6. **Design ultra professionnel et responsive** : direction artistique premium automobile, cohérente avec la marque (Racing Red `#E11D48`, Carbon `#0B0F19`, or `#F59E0B`, glace/textes clairs), typographie fluide `clamp()`, grille maîtrisée, animations discrètes et accessibles, mobile irréprochable (drawer, cibles tactiles ≥ 44px).
7. **Zéro tiret cadratin (—)**, zéro jargon IA, copy factuelle (téléphones, adresse, e-mail, IFU/RCCM, marques, services réels).

## 2. Architecture technique

```
apps/web/src/
  lib/site-prefs.ts            # SiteLocale, SITE_LOCALES, isSiteLocale, parseAcceptLanguageSite,
                               # SITE_LOCALE_COOKIE, cookie options, getSiteLocale() server helper
  lib/i18n/site/{fr,en,es,zh}.ts  # dictionnaires vitrine typés (SiteCopy)
  lib/i18n/site/index.ts       # siteCopy: Record<SiteLocale, SiteCopy>
  app/(site)/layout.tsx        # shell public : en-tête, pied de page, skip-link, métadonnées
  app/(site)/page.tsx          # /
  app/(site)/vehicules/page.tsx
  app/(site)/sur-mesure/page.tsx
  app/(site)/services/page.tsx
  app/(site)/recharge/page.tsx
  app/(site)/equipe/page.tsx
  app/(site)/contact/page.tsx
  app/(site)/site.css          # design system vitrine (tokens + composants + responsive)
  components/site/SiteHeader.tsx        # client : nav, sélecteur langue, CTA, drawer mobile
  components/site/SiteFooter.tsx
  components/site/LanguageSwitcher.tsx  # client : pose le cookie + refresh
  components/site/...                    # blocs réutilisables (Hero, SectionHead, VehicleCard, CTAs)
```

- **Routes existantes conservées** : `/login`, `/dashboard`, etc. (app interne). L'ancienne page vitrine `app/page.tsx` est remplacée par `app/(site)/page.tsx` (suppression de l'ancien fichier pour éviter le conflit de route).
- **Middleware** : ajouter les nouveaux slugs publics à `PUBLIC_PATHS` (sinon redirection login).
- **Détection** : `getSiteLocale()` lit le cookie, sinon `Accept-Language` via `headers()` ; le rendu SSR est donc correct dès la première visite, sans middleware.
- **Données** : réutiliser Prisma (`vehicle`), les photos officielles déjà intégrées (`/images/vehicles/{slug}-*.jpg`), sans modification de schéma ni de données.
- **Aucune dépendance nouvelle** : CSS natif + petits composants client (IntersectionObserver, `matchMedia`, `usePathname`).
- **next/image** pour les visuels (sizes responsive, lazy sous la ligne de flottaison).

## 3. Design system vitrine

Tokens CSS (préfixe `--site-`) :
- Couleurs : fond `#060b12` / surfaces `#0b1420` / carte `rgba(255,255,255,.04)`, accent `#E11D48`, accent hover `#F43F5E`, or `#F59E0B`, texte `#F4F7FA`, muted `#A7B4C2`, bordure `rgba(255,255,255,.10)`.
- Typographie : titres `clamp(2rem, 5vw, 4rem)` poids 750/800, sous-titres `clamp(1rem, 1.6vw, 1.15rem)`, corps 1rem/1.65 ; pas de Google Fonts (perf), pile système premium.
- Espacements : échelle 4/8/12/16/24/32/48/64/96 ; sections `clamp(3.5rem, 8vw, 7rem)` vertical.
- Rayons : 14/18/24 px ; ombres douces ; bordures 1px translucides.
- Grille : conteneur max 1240px, gouttière 24px ; cartes en `grid auto-fit minmax(260px,1fr)`.
- Breakpoints : ≤ 480 (mobile), ≤ 768 (tablette), ≤ 1024 (petit laptop), ≥ 1440 (large).
- Accessibilité : focus-visible visible, skip-link, contrastes AA, `prefers-reduced-motion` respecté, cibles 44px, landmarks sémantiques, `aria-current` sur la nav.
- Micro-interactions : apparition douce des sections (IntersectionObserver, une seule fois), survols cartes discrets, pas de carrousel automatique agressif.

## 4. Contenu par page (4 langues)

Chaque page : titre, chapô, sections, CTA, métadonnées SEO localisées (title/description/canonical/OpenGraph), fil d'ariane léger si utile.
- Accueil : hero (promesse + 2 CTA), chiffres clés factuels (marques distribuées, services), véhicules à la une (base Neon), 3 piliers (showroom, atelier, recharge), preuves/services, bande « Notre équipe » (renvoi), CTA contact.
- Véhicules : catalogue complet avec filtres (marque, énergie, type, disponibilité, budget), tri, états vides, fiche détail en modale ou page ; données réelles uniquement.
- Sur-mesure : processus en étapes (choix du modèle, configuration, devis proforma, commande usine, transit, réception/livraison, immatriculation), délais indicatifs non inventés, CTA WhatsApp/contact.
- Services : atelier SAV, entretien programmé, diagnostic, pièces d'origine, garanties constructeur (formulations factuelles), prise de rendez-vous (contact).
- Recharge : bornes résidentielles/entreprises, installation, abonnements, terminal public ; CTA étude.
- Équipe : pôles, responsabilités, message direction, invitation à rencontrer l'équipe au showroom.
- Contact : adresse Maro-Militaire / Gbèdomidji Cotonou, téléphones officiels, e-mails, horaires (à confirmer), carte/itinéraire (lien Maps officiel), WhatsApp, formulaire accessible (mailto ou endpoint existant minimal, sans stockage non demandé).

## 5. Phases de délégation (Claude Code)

1. **Phase 1 — Fondation + shell + Accueil** : site-prefs, dictionnaires (structure + FR/EN/ES/ZH complets pour shell + accueil), layout `(site)`, header/footer/switcher, CSS design system, page Accueil, middleware, suppression ancienne page. Build vert.
2. **Phase 2 — Véhicules + Sur-mesure** : catalogue filtrable, cartes, fiche détail, page import.
3. **Phase 3 — Services + Recharge**.
4. **Phase 4 — Équipe + Contact + finitions** : SEO, sitemap/robots, og, responsive polish, audit accessibilité, revue indépendante Claude, build, commit, push.

## 6. Critères d'acceptation

- 4 langues commutables partout sur la vitrine ; détection navigateur au premier chargement ; choix persistant.
- 7 pages distinctes accessibles sans JavaScript désactivé (SSR), navigation clavier complète.
- Aucune régression app interne ; `npm run build` exit 0 ; pas de tiret cadratin dans le contenu vitrine.
- Responsive vérifié à 320 / 390 / 768 / 1024 / 1440 / 1920 px.
- Contenu factuel aligné `CLAUDE.md` (coordonnées, fiscalité, marques).
- Commit conventionnel + push `main` (déploiement Vercel).

## 7. Points à fournir par le client (plus tard)

- Noms, fonctions, photos réelles des collaborateurs pour la page Notre équipe.
- Horaires d'ouverture officiels du showroom et de l'atelier.
- Photos d'ambiance du showroom/atelier si disponibles.

---

## État d'avancement (30/10/2026)

- **Phase 1** : livrée — fondation 4 langues, shell premium, accueil (commit `71dc7ba`).
- **Phase 2** : livrée — `/vehicules` (catalogue filtrable + modale 5 photos) et `/sur-mesure`.
- **Phase 3** : livrée — `/nos-services` et `/recharge`, correctif du hero sur-mesure.
- **Phase 4** : livrée — `/equipe` (6 pôles + message direction), `/contact` (canaux + formulaire mailto), SEO (metadata localisées, sitemap.xml, robots.txt, JSON-LD AutomotiveBusiness), `html lang` SSR piloté par la locale vitrine.
- **Nettoyage** : ancienne vitrine mono-page supprimée (`PublicShowcase.tsx`, `public-showcase.css`, dicitonnaire associé).
- **Vérifications** : `tsc --noEmit` + `npm run build` exit 0 ; 7 routes publiques en HTTP 200 ; détection de langue par cookie et `Accept-Language` validée (FR/EN/ES/ZH) ; captures CDP desktop/mobile (320/390/768/1440) sans débordement horizontal.
- **Reste à fournir par le client** : noms/photos des collaborateurs (page Équipe), liens Facebook officiel, horaires d'ouverture confirmés, éventuelle photo d'ambiance du showroom. Une fois ces éléments fournis, la page Équipe pourra passer des cartes de pôles aux portraits individuels.

### Évolutions produit (30/10/2026, 2e itération)
- **Accueil** : ouverture sur un diaporama plein écran des nouveautés (véhicules réels Neon : titre, année/énergie, statut, prix FCFA, CTA), autoplay pausable, flèches, puces, clavier, swipe, `prefers-reduced-motion`. La grille « Nouveautés en showroom » suit immédiatement.
- **Page Véhicules** : hero compacté (moins d'espace avant le titre et avant les filtres), filtres et première rangée de voitures visibles dès le premier écran desktop ; en mobile, recherche visible + bouton « Filtres » repliable (compteur de filtres actifs) pour faire apparaître les voitures immédiatement.
- Vérifications : `tsc` + `build` exit 0 ; captures CDP 1920/1440/390 ; `scrollWidth === viewport` ; diaporama testé (slide 1→2, annonce aria-live) ; bouton Filtres testé (aria-expanded true, panneau 7 champs).
