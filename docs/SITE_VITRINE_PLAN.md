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

### Évolutions produit (itération 3)
- **Diaporama d'accueil** : uniquement les marques chinoises, CHANGAN UNI-K 2026 2.0T AWD forcée en première position ; prix retirés ; CTA « Demander une cotation » (modale de capture) + « Cotation WhatsApp » préremplie.
- **Prix masqués sur toute la vitrine** : plus aucun montant affiché sur l'accueil, le catalogue ou la fiche détail ; le filtre budget et le tri par prix ont été retirés côté public.
- **Flux de cotation** : modale accessible (nom, téléphone, e-mail, message prérempli avec le véhicule), enregistrement en base via `POST /api/public/lead` (lead + notification admin, validation Zod, rate limiting 5/10 min/IP), état de succès, alternative WhatsApp 1 clic avec message prérempli (véhicule, année, énergie, statut, lien).
- **Bloc intro accueil** : espacements réduits et alignement compact (une information par ligne).
- Vérifications : `tsc` + `build` exit 0 ; premier slide = CHANGAN UNI-K ; 0 nœud prix visible ; 7 boutons cotation sur l'accueil et 13 sur le catalogue ; modale testée (ouverture, champs, Échap) ; lien WhatsApp prérempli vérifié ; API testée (succès + 400 + 429) ; lead de test créé puis supprimé de la base ; `scrollWidth == viewport` desktop/mobile.

### Correction ordre accueil (itération 4)
- Ordre imposé par le client : diaporama plein écran → bloc « Concessionnaire multimarques à Cotonou / Un showroom, un atelier, une équipe » → section « Véhicules à la une » → piliers → chiffres → équipe → FAQ → CTA.
- Style du diaporama conservé tel que validé : image plein écran (pas de voiture encadrée), textes par-dessus à gauche, flèches + puces.

### Itération 5 : priorité WhatsApp & statut masqué
- Boutons voiture réordonnés : **« Cotation en 1 clic » (WhatsApp) en premier**, en **vert WhatsApp (#25D366)**, puis **« Cotation par e-mail »** (modale de capture).
- Libellés mis à jour en FR/EN/ES/ZH.
- **Statut retiré du public** : plus de badge « Arrivé au port / En transit / En production / Disponible en showroom » sur le diaporama, les cartes ou la fiche détail ; filtre « Disponibilité » supprimé ; mention de statut retirée du message WhatsApp (le statut est communiqué lors de l'échange commercial).
- Vérifications : `tsc` + `build` exit 0 ; capture 1440/mobile ; href WhatsApp sans statut ; modale e-mail testée ; Échap ferme.

### Itération 6 : couleurs d'action et alignement des CTA du diaporama
- « Cotation par e-mail » reprend la **couleur de marque (rouge/cramoisi)** ; « Cotation en 1 clic » (WhatsApp) reste en **vert WhatsApp #25D366**.
- Les trois actions du diaporama (WhatsApp, e-mail, « Voir tout le showroom ») sont **alignées sur une même ligne** en desktop, avec retour à la ligne puis empilement plein largeur en mobile.
- Vérifications : tsc/build exit 0 ; captures 1440 et 390 ; ordre WhatsApp → e-mail → showroom.

### Sprint 1 (itération 7) : conversion, conformité, accessibilité, performance
- **Barre WhatsApp collante mobile** : bouton vert fixe en bas de page (toutes pages vitrine), lien WhatsApp prérempli + event analytics `cotation_whatsapp` (source barre_mobile).
- **Analytics Vercel** : `@vercel/analytics` installé, composant `Analytics` dans le layout vitrine ; events `cotation_ouverture`, `cotation_envoi`, `cotation_whatsapp`. À activer dans le dashboard Vercel (Web Analytics) pour voir les données.
- **Conformité** : pages `/confidentialite` et `/mentions-legales` (FR), liens dans le footer + sitemap, routes rendues publiques dans le middleware ; **case de consentement obligatoire** dans la modale de cotation + lien vers la politique.
- **Accessibilité WCAG 2.2.2** : bouton pause/lecture visible du diaporama (`aria-pressed`, labels SR), autoplay respecte prefers-reduced-motion.
- **Nettoyage** : suppression de 4 images inutilisées (~10,8 Mo) dans `public/images/vehicles`.
- Vérifications : build/tsc exit 0 ; tests CDP : barre mobile visible (href WA), pause `aria-pressed=true`, consentement requis (erreur sans case), envoi avec consentement = SUCCESS, pages légales accessibles (h1 + 9 sections + liens footer), sitemap OK ; lead de test créé puis supprimé.
- Reste à faire (dépend des accès client) : alerte e-mail/SMS instantanée à chaque lead (SMTP non fourni par la direction pour l'instant).

### Identité visuelle : logo officiel CARZONE (itération 8)
- Logo officiel fourni (emblème Z + lettrage CARZONE doré) décliné en : logo web transparent (`public/brand/carzone-logo.png`), version impression fond noir (`carzone-logo-print.png`), badge carré (`carzone-badge.png`), image OpenGraph 1200x630, `icon.png` 512, `apple-icon.png` 180 et `favicon.ico` multi-tailles (16/32/48/64/128/256).
- Site vitrine : en-tête = emblème officiel + **CARZONE entièrement jaune** (plus de blanc mélangé), pied de page = logo complet ; image de partage og:image/twitter:image sur toutes les pages.
- Application interne : page de connexion, AppShell et documents imprimés (devis, factures, reçus, fiches atelier, fiche technique) utilisent le logo officiel (version fond noir pour l'impression).
- Ancien logo vectoriel `carzone-logo.svg` supprimé ; copie du fichier source officiel conservée dans `docs/brand/carzone-logo-officiel.png`.
- Vérifications : endpoints `/brand/carzone-logo.png`, `/icon.png`, `/apple-icon.png`, `/favicon.ico` en 200 ; balises og:image/twitter:image présentes ; captures header desktop/mobile + login.

### Identité visuelle : affinage du lockup d'en-tête (itération 9)
- Emblème régénéré en version resserrée (`public/brand/carzone-mark.png`) et transparence nettoyée (suppression du liseré/ombre grise issue du logo source).
- En-tête vitrine : emblème + **CARZONE entièrement jaune**, tagline retirée pour un rendu plus propre, hauteur de header ajustée (46 px desktop / 36 px mobile), espacement et alignement revus.
- Logo complet officiel conservé en pied de page, connexion, AppShell et documents imprimés ; icône/favicon et OpenGraph régénérés avec la transparence propre.
- Vérifications : build/tsc exit 0 ; captures DPR2 header desktop, header mobile, login ; aucun débordement.

### Identité visuelle : lockups header vitrine + application (itération 10)
- Header vitrine : emblème agrandi (46/40/36 px) + CARZONE jaune + **tagline « Drive your dream » visible sur tous les écrans** (y compris mobile, ancienne règle qui la masquait neutralisée).
- Application de gestion / connexion : composant `CarzoneLogo` transformé en lockup **emblème officiel + CARZONE entièrement jaune (#F5B301)** au lieu du logo complet réduit (lettrage illisible). La tagline de l'app reste affichée sous le lockup.
- Vérifications : build/tsc exit 0 ; captures header desktop DPR2 + mobile + login ; contrôle DOM du composant app : `CARZONE` couleur `rgb(245,179,1)`, poids 900, emblème `carzone-mark.png`.

### Identité visuelle : logo officiel complet partout (itération 11)
- Règle client : le logo officiel CARZONE (emblème + lettrage CARZONE) doit être affiché **en entier, d'un seul bloc, partout**. Plus de découpage emblème / texte séparé.
- Vitrine : en-tête = image officielle complète (hauteur 76 px desktop / 58 px tablette / 50 px mobile) + tagline « Drive your dream » **en blanc**, centrée sous le logo ; pied de page = logo complet.
- Application de gestion / connexion / documents : composant `CarzoneLogo` = logo officiel complet (tailles 52/64/84/96 px), tagline applicative conservée.
- Vérifications : build/tsc exit 0 ; captures header desktop (logo entier + tagline blanche), header mobile, login.

### Identité visuelle : lockup d'en-tête conforme à la maquette client (itération 12)
- Maquette Photoshop fournie : emblème officiel à gauche, CARZONE en gros jaune, DRIVE YOUR DREAM en dessous en blanc/gris clair.
- Recréé en HTML/CSS (pas d'image collée) : police géométrique **Poppins** (800/900) chargée via `next/font/google` pour la vitrine ; emblème `carzone-mark.png` ; CARZONE jaune `#F5B301` ; tagline `#E6EDF7` avec letter-spacing.
- Header desktop 88 px (emblème 68 px) et mobile 50 px (emblème 44 px) ; lockup horizontal corrigé.
- Vérifications : build/tsc exit 0 avec téléchargement Poppins OK ; captures desktop DPR2 et mobile.

### Identité visuelle : correction définitive du lockup (itération 13)
- Cause racine corrigée : l'emblème détouré était rogné (les arcs officiels passent derrière le lettrage, impossible à séparer proprement) → le header utilise désormais **l'image officielle complète** (jamais rognée) comme élément de gauche, avec CARZONE + tagline à droite.
- Cause racine application : sélecteurs CSS globaux erronés `.carzone-logo, .oxcar-logo--sm { max-width:132px }` qui coupaient le logo dans la sidebar → sélecteurs corrigés (`.carzone-logo--sm` etc.), `max-width: none` sur le composant.
- Site + application + connexion : même lockup (logo officiel complet + CARZONE jaune Poppins 900 + DRIVE YOUR DREAM clair), plus de tagline dupliquée (retirée de AppShell et du login).
- Tailles : header 79 px (logo 56 px desktop / 42 px mobile), app sm/md/lg/xl (38/44/60/74 px).
- Vérifications : tsc/build exit 0 ; captures header desktop DPR2, mobile, login ; aucun rognage.
