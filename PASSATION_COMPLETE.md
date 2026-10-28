# DOCUMENT DE PASSATION TECHNIQUE & FONCTIONNELLE COMPLÈTE
## CARZONE SARL Ops — Plateforme DMS / ERP Automobile & Mobilité Électrique
**Lieu :** Cotonou, République du Bénin  
**Auteur initial :** Igor GIANI — Ingénieur Systèmes d'Information & Solutions Digitales  
**Destinataire :** Repreneur technique / Équipe de maintenance et d'exploitation CARZONE SARL  
**Date de finalisation :** Octobre 2026  
**Version de l'application :** `0.1.0` (Production Vercel + Neon PostgreSQL)

---

## SOMMAIRE EXÉCUTIF

1. [Fiche d'Identité de l'Entreprise & du Projet](#1-fiche-didentité-de-lentreprise--du-projet)
2. [Notre Parcours & Genèse du Projet](#2-notre-parcours--genèse-du-projet)
3. [Architecture Technique & Stack Logicielle](#3-architecture-technique--stack-logicielle)
4. [État des Lieux Actuel : Où en Sommes-Nous ?](#4-état-des-lieux-actuel--où-en-sommes-nous-)
5. [Toutes les Erreurs du Passé & Pièges à Éviter (CRITIQUE)](#5-toutes-les-erreurs-du-passé--pièges-à-éviter-critique)
6. [Cartographie Détaillée des Modules Opérationnels](#6-cartographie-détaillée-des-modules-opérationnels)
7. [Gestion des Rôles, Permissions & Sécurité](#7-gestion-des-rôles-permissions--sécurité)
8. [Environnements, Base de Données & Secrets (.env)](#8-environnements-base-de-données--secrets-env)
9. [Procédures d'Exploitation (Runbook Développeur)](#9-procédures-dexploitation-runbook-développeur)
10. [Feuille de Route & Prochaines Étapes Prioritaires](#10-feuille-de-route--prochaines-étapes-prioritaires)

---

## 1. FICHE D'IDENTITÉ DE L'ENTREPRISE & DU PROJET

### 1.1. L'Entreprise CARZONE SARL
- **Dénomination :** CARZONE SARL
- **Statut Juridique :** Société à Responsabilité Limitée (SARL)
- **Activité :** Concessionnaire Automobile Multimarques Neufs & Occasions Récentes, Atelier SAV & Entretien Rapide, Déploiement d'Infrastructures de Recharge pour Véhicules Électriques (VE) et Hybrides.
- **Showroom Principal :** Immeuble de la Commission Béninoise des Droits de l'Homme (CBDH), Quartier Gbèdomidji / Zone Maro-Militaire & Saint-Michel, Lot 167, Rue 407, Cotonou, Bénin.
- **Atelier SAV :** Zone dédiée mécanique et carrosserie (Cotonou).
- **Marques Représentées :** Changan, Deepal, Jetour, BYD (électriques), Chery, Geely, Forthing, Toyota, etc.
- **Téléphones Officiels :** +229 01 92 61 61 61 / +229 01 63 70 00 00 / +229 01 92 62 62 62
- **E-mails Institutionnels :** `contact@topcarzone.com` / `direction@topcarzone.com`
- **Site Web Officiel :** [https://www.topcarzone.com](https://www.topcarzone.com)
- **Fiscalité Bénin :**
  - **IFU :** `0202314589201`
  - **RCCM :** `RB/COT/23 B 34567`
  - **NIM e-MECeF DGI :** `MCF01-CARZONE-BJ01`

### 1.2. Objectif du Système "CARZONE Ops"
Remplacer les solutions génériques inadaptées (notamment Djaboo et un site vitrine Webador figé) par une plateforme intégrée **DMS (Dealer Management System) / ERP** répondant aux spécificités du marché automobile béninois :
1. Centralisation complète du cycle de vente (de la cotation proforma 1-clic à la facture normalisée DGI e-MECeF).
2. Traçabilité rigoureuse du stock de véhicules par numéro de châssis (VIN) et statut logistique (commandes usine, production, transit maritime, port de Cotonou, showroom).
3. Gestion avancée du magasin de pièces détachées avec références croisées constructeurs (OEM vs adaptables).
4. Digitalisation de l'Atelier SAV avec fiches d'intervention, fiches d'entretien systématique par palier kilométrique et émargement tactile sur tablette.
5. Écosystème de mobilité électrique : gestion des bornes de recharge, installateurs agréés et terminal de paiement Mobile Money / CB.

---

## 2. NOTRE PARCOURS & GENÈSE DU PROJET

Comprendre comment le projet a été bâti est indispensable pour éviter de réinventer la roue ou de répéter des choix qui ont déjà été invalidés.

```mermaid
timeline
    title Trajectoire de Développement CARZONE Ops
    Audit & Diagnostic : Constat faiblesses Webador / Djaboo : Rédaction contrat & note stratégique
    Socle Fondateur : Next.js 15 App Router : Prisma ORM & Auth HMAC : Design System Dark Prestige
    Modules Vente & Stock : Gestion VIN 5 statuts : Devis Proforma XOF : Catalogue 104 KB specs constructeur
    Intelligence Artificielle : Fiches techniques 3 pages A4 : Dictionnaire Chinois-Français : Vercel AI Gateway
    Dashboard & Finance : 4 graphes financiers 100% réels : Purge des faux badges : Filtrage temporel DG
    Atelier SAV & Tablettes : Fiche Intervention : Fiche Entretien 5k-100k : Signatures manuscrites Canvas
    Déploiement Cloud : Migration SQLite vers Neon Postgres : CI/CD Vercel automatique : Préparation DGI e-MECeF
```

### 2.1. Étape 1 : L'Audit Initial et les Défaillances Constatées
À l'origine, CARZONE disposait d'un site Webador basique (`topcarzone.com`) et testait l'outil SaaS Djaboo.
- **Frein n°1 : Fiches véhicules statiques non cliquables.** Les clients ne pouvaient ni consulter les options, ni demander une offre sur le véhicule ciblé.
- **Frein n°2 : Fuite des prospects (70% d'abandon).** Aucun formulaire contextualisé. Le visiteur devait copier-coller le nom du véhicule sur une page contact générique.
- **Frein n°3 : Rupture avec les habitudes béninoises (WhatsApp).** Au Bénin, 80% des décisions d'achat automobile s'accélèrent par messagerie instantanée. Il n'y avait aucun pont direct WhatsApp pré-rempli.
- **Frein n°4 : Outils déconnectés.** Les demandes atterrissaient dans des boîtes e-mails isolées, sans traçabilité pour la Direction Générale.

### 2.2. Étape 2 : Le Choix d'une Solution Sur-Mesure
Un audit stratégique et un contrat de prestation ont été établis pour créer **CARZONE Ops**, en adoptant les principes clés :
- Un seul référentiel client partagé (Vente, Bornes, SAV).
- Tous les montants strictement en **Francs CFA (XOF / FCFA)**.
- Des fiches techniques de prestige générées automatiquement depuis les specs constructeurs (traduites du chinois vers le français automobile).
- Un tableau de bord basé sur des données **100% réelles**, sans simulation trompeuse.

---

## 3. ARCHITECTURE TECHNIQUE & STACK LOGICIELLE

### 3.1. Technologies Clés

| Composant | Technologie | Version | Rôle / Rationale |
|---|---|---|---|
| **Frontend Framework** | **Next.js (App Router)** | `15.2.9` | Server Components, Server Actions pour mutations rapides sans API boilerplate. |
| **Langage** | **TypeScript** | `^5.0` | Typage strict de bout en bout (modèles, formulaires, états). |
| **UI Library** | **React** | `^19.0.0` | Rendu moderne, gestion d'états réactifs, Canvas API pour signatures. |
| **Styles & Theme** | **Tailwind CSS + CSS Variables** | `^3.4.1` | Palette "Racing Red" (`#E11D48`), Carbone & Onyx (`#0B0F19`), Thème sombre par défaut avec bascule `data-theme`. |
| **Icônes** | **Lucide React** | `^1.41.0` | Pack complet d'icônes vectorielles cohérentes. |
| **ORM** | **Prisma** | `5.22.0` | Schéma relationnel typé, migrations, introspection BDD. |
| **Base de Données Prod** | **Neon Serverless PostgreSQL** | `v16+` | Hébergement cloud managé avec connection pooler PgBouncer. |
| **Base de Données Dev** | **PostgreSQL (Neon)** / SQLite | - | Configuration pooler avec SSL strict (`channel_binding=require`). |
| **Authentification** | **Custom HMAC Cookie Session + bcryptjs** | `^3.0.3` | Cookie de session chiffré (`carzone_session`), validation en base, sans dépendance lourde externe. |
| **Moteur d'IA Fiches** | **Vercel AI Gateway + DeepSeek API** | - | Génération et traduction des fiches techniques de véhicules chinois (Changan, Jetour, BYD). |
| **Hébergement & CI/CD** | **Vercel** | - | Déploiement continu automatisé à chaque `git push origin main`. |
| **Export & Tableur** | **xlsx (SheetJS)** | `^0.18.5` | Import/Export des fiches atelier et catalogues pièces. |

### 3.2. Arborescence du Code Source (`apps/web`)

```text
apps/web/
├── prisma/
│   ├── schema.prisma             # Schéma relationnel global (Users, Stock, SAV, Factures...)
│   └── seed.ts                   # Données initiales et comptes utilisateurs par défaut
├── public/                       # Logos officiels, badges de marques HD, illustrations
├── scripts/                      # 36 scripts utilitaires (scraping propre, sync specs, tests API)
├── src/
│   ├── app/                      # Routes Next.js App Router
│   │   ├── api/                  # Endpoints internes (ai, auth, calls, vapi, workshop...)
│   │   ├── catalog/              # Catalogue interactif vitrine
│   │   ├── charge-requests/      # Demandes d'installation de bornes
│   │   ├── charging/             # Gestion du réseau de bornes et abonnements kWh
│   │   ├── chat/                 # Messagerie interne et journal d'appels
│   │   ├── clients/              # CRM & fiches clients 360°
│   │   ├── dashboard/            # Tableau de bord financier exécutif DG
│   │   ├── expenses/             # Suivi des charges & calcul du bénéfice net
│   │   ├── fleet/                # Gestion de flotte
│   │   ├── hr/                   # Ressources Humaines & personnel
│   │   ├── imports/              # Commandes d'importation & transit portuaire
│   │   ├── installers/           # Réseau d'installateurs de bornes électriques
│   │   ├── invoices/             # Facturation de vente & e-MECeF DGI
│   │   ├── login/                # Interface d'authentification sécurisée
│   │   ├── mailbox/              # Boîtes e-mails pro @topcarzone.com intégrées
│   │   ├── opportunities/        # Pipeline commercial (Kanban leads)
│   │   ├── parts/                # Magasin pièces de rechange & cross-references
│   │   ├── presentation/         # Studio Motion Design 16:9 paysage & mobile
│   │   ├── quotes/               # Générateur de Devis / Proformas officiels
│   │   ├── rentals/              # Location LCD / LLD / LOA
│   │   ├── terminal/             # Terminal de paiement mobile borne (TPE virtuel)
│   │   ├── users/                # Administration des utilisateurs et permissions RBAC
│   │   ├── vehicles/             # Stock véhicules, VIN, fiches 3 pages prestige
│   │   └── workshop/             # Atelier SAV, Ordres de Réparation, Tablettes
│   ├── components/               # Composants UI partagés (AppShell, Nav, Modals, Print...)
│   └── lib/                      # Cœur logique, services métiers, adaptateurs API
│       ├── auth.ts               # Sessions, chiffrement cookies, vérifications
│       ├── brand-logos.tsx       # Logos officiels vectoriels des marques
│       ├── dgi-emecef.ts         # Client API e-MECeF DGI Bénin (Sandbox + Prod)
│       ├── excel-workshop.ts     # Parseur de fichiers Excel de passage atelier
│       ├── openai-tech-sheet.ts  # Passerelle Vercel AI Gateway / OpenAI
│       ├── permissions-config.ts # Définition granulaire des droits par rôle
│       ├── prisma.ts             # Client Prisma singleton
│       ├── rate-limiter.ts       # Protection contre les attaques bruteforce
│       ├── require-user.ts       # Gardien d'accès par rôle pour Server Components
│       ├── role-service.ts       # Résolution dynamique des permissions utilisateur
│       ├── tech-sheet-generator.ts # Générateur fiches techniques + Dictionnaire chinois
│       ├── vehicle-catalog-specs.ts# Base de connaissances de 104 KB des specs modèles
│       └── workshop-checklist-data.ts # Matrice des 17 contrôles par palier km
```

---

## 4. ÉTAT DES LIEUX ACTUEL : OÙ EN SOMMES-NOUS ?

### 4.1. Ce qui est 100% Terminé et Fonctionnel en Production

1. **Socle & Sécurité :**
   - Authentification par cookies chiffrés HMAC + mots de passe hachés avec bcrypt (sel cost 10).
   - Rôles RBAC opérationnels avec rôle invisible de secours (**Stealth Developer**).
   - Système de surveillance des IP avec alertes de sécurité et rate-limiting.
   - Thème sombre d'inspiration sportive "Midnight Carbon & Racing Red" actif par défaut avec switch manuel.

2. **Stock Véhicules & Fiches Techniques :**
   - Référentiel de véhicules neufs (Changan CS35/CS55/CS75, Deepal S07/L07, Jetour Dashing/T2, BYD Yuan/Song/Han, Forthing T5 EVO, etc.).
   - Fiches techniques A4 de 3 pages calibrées au millimètre (`295mm` par page) pour une impression et un export PDF parfaits sans saut de page indésirable.
   - Intégration de visuels constructeur HD 4:3 officiels (cockpit duo, sellerie, face avant studio, face arrière) excluant toute photo de rue ou plaque d'immatriculation civile.
   - Traduction automatique assistée par IA via le Vercel AI Gateway et DeepSeek.

3. **Commerce & Facturation :**
   - Pipeline d'opportunités commerciales (Leads, Essais routiers, Négociations, Gagnés).
   - Générateur de Devis / Proformas en Francs CFA (XOF) avec calcul automatique des remises, acomptes, taxes et conditions générales de vente & d'importation.
   - Transformation en 1 clic d'un devis accepté en facture officielle.
   - Facturation normalisée avec structure e-MECeF (NIM, QR Code DGI, compteurs fiscaux).

4. **Magasin de Pièces Détachées :**
   - Pipeline de stock à 5 statuts : Commandes, Production, Transit, Port de Cotonou, Magasin.
   - Gestion des références croisées équipementiers (référence OEM constructeur vs références adaptables Bosch, Valeo, Denso...).

5. **Tableau de Bord Financier DG :**
   - Graphes analytiques 100% connectés à la base PostgreSQL (Chiffre d'affaires facturé, dépenses réelles, volume d'activité, bénéfice net d'exploitation).
   - Filtre temporel interactif dédié à la Direction : 1 Mois, 6 Mois, 1 An, 2 Ans, 3 Ans.
   - Suppression totale de toute fausse donnée ou mention "mockée".

6. **Studio Motion Design Exécutif :**
   - Module interactif de présentation en 16:9 paysage et format mobile (`PRESENTATION_MOTION_DESIGN.html` et `/presentation`) permettant d'enregistrer des démonstrations vidéos percutantes pour la Direction et les investisseurs.

### 4.2. Chantier Atelier SAV sur Tablettes — Terminé, Commité & Déployé (Octobre 2026)

Le chantier est finalisé et livré en production (commit `97589c6`, build Vercel OK, base Neon synchronisée) :
- **Fiche d'Intervention (Fiche 1) :** panne signalée, diagnostic par compartiment (Moteur/Transmission, Suspension, Électricité & Scanner, Autres), pièces à commander, temps d'intervention, nom du technicien et du responsable d'atelier.
- **Fiche d'Entretien Systématique (Fiche 2) :** matrice de 17 points de contrôle cumulatifs selon le kilométrage du véhicule (5 000 km, 10 000 km, 30 000 km, 50 000 km, 100 000 km).
- **Interface Tablette Tactile (`WorkshopTabletModal.tsx`) :** saisie directe au garage avec émargement par **signatures manuscrites numériques sur Canvas** (Client, Technicien, Responsable Atelier).
- **Impressions A4 Dédiées :** composants `FicheInterventionPrint.tsx` et `FicheEntretienSystematiquePrint.tsx`, routes `/workshop/[id]/fiche-intervention` et `/workshop/[id]/fiche-entretien`.

> [!NOTE]
> **Statut au 23 Octobre 2026 :** les modèles Prisma `WorkshopChecklistItem` et `WorkshopSignature` sont synchronisés sur Neon (`npm run db:push` : base déjà en phase), la compilation `npm run build` passe (48 routes) et le commit `97589c6` est poussé sur `main` → déploiement Vercel automatique. Il reste uniquement la validation physique sur tablette tactile (voir Action 2, section 10).

---

## 5. TOUTES LES ERREURS DU PASSÉ & PIÈGES À ÉVITER (CRITIQUE)

Cette section documente l'ensemble des erreurs rencontrées au cours du développement, leurs causes racines et les règles strictes à observer pour garantir la viabilité et la pérennité du projet.

### Règle n°1 : NE JAMAIS mélanger les véhicules de réparation avec le stock de vente
- **L'Erreur Passée :** Lors de l'import de fichiers Excel de l'atelier SAV, certains scripts ont créé des lignes dans la table `Vehicle` pour chaque voiture cliente entrée en réparation. Résultat : des Toyota Corolla 2012 ou des voitures clients avec plaques d'immatriculation civiles apparaissaient dans le catalogue des véhicules neufs à vendre du showroom !
- **La Solution Appliquée :** Séparation stricte :
  - La table `Vehicle` ne contient **QUE** les véhicules du stock concessionnaire destinés à la vente ou à la location.
  - La table `WorkshopEntry` gère les passages atelier des clients. Elle pointe vers `Customer`, et ne référence un `vehicleId` **QUE** si le véhicule provient historiquement de la flotte vendue par Carzone.
- **Script de secours :** `apps/web/scripts/clean_workshop_from_stock.ts` nettoie toute pollution éventuelle.

### Règle n°2 : NE JAMAIS utiliser de photos de rue ou de plaques d'immatriculation civiles
- **L'Erreur Passée :** Des images récupérées automatiquement sur Internet affichaient des véhicules photographiés dans la rue avec des plaques civiles identifiables ou des angles amateurs, ce qui dégradait l'image haut de gamme de la concession.
- **La Solution Appliquée :** Standard d'imagerie strict :
  - Uniquement des photos de salons automobiles officiels (Auto Shows de Shanghai/Pékin) ou des rendus studio HD constructeurs.
  - Ratio obligatoire 4:3 sans rognage déformant.
  - 4 visuels par véhicule : Face avant 3/4, Face arrière 3/4, Cockpit conducteur/passager, Sellerie arrière.

### Règle n°3 : NE JAMAIS exposer de clés API privées côté Client / Frontend
- **L'Erreur Passée :** Dans une première itération de la fiche technique, un composant client React utilisait directement une clé OpenAI pour formuler des requêtes de traduction, risquant d'exposer la clé dans le bundle JavaScript du navigateur.
- **La Solution Appliquée :** Toutes les interactions avec les LLM (OpenAI, DeepSeek) sont désormais encapsulées côté serveur dans des Server Actions ou des routes sécurisées (`/api/ai`), exploitant le **Vercel AI Gateway** avec variables d'environnement masquées.

### Règle n°4 : NE JAMAIS émettre de fausses données de facturation e-MECeF en Production
- **L'Erreur Passée / Le Risque :** Simuler un QR Code DGI ou un code MECeF arbitraire sur des factures réelles de clients est une infraction fiscale sévère selon la législation béninoise.
- **La Solution Appliquée :**
  - Un mode sandbox simulé existe **uniquement pour les tests de développement**.
  - En production, la certification ne s'active que si un jeton **JWT officiel émis par la DGI** (`DGI_EMECEF_JWT`) est configuré dans l'environnement.
  - Consulter impérativement la documentation [`docs/DGI-EMECEF-COMPTE-DEVELOPPEUR-SANDBOX.md`](file:///c:/Users/IGOR_GIANI/Desktop/Projet%20Carzone%20SARL/docs/DGI-EMECEF-COMPTE-DEVELOPPEUR-SANDBOX.md) pour la procédure d'homologation des 20 cas de tests.

### Règle n°5 : NE JAMAIS ajouter de faux badges ou de données "mockées" dans le Dashboard
- **L'Erreur Passée :** Pour "remplir" visuellement le tableau de bord, des données fictives avaient été injectées avec un badge indiquant maladroitement "Données 100% réelles BDD". La Direction Générale a immédiatement rejeté cet artifice qui faussait l'analyse financière.
- **La Solution Appliquée :** Les 4 graphiques (Ventes, Dépenses, Activités, Bénéfice Net) effectuent de vraies requêtes d'agrégation SQL Prisma sur les tables `Invoice`, `Expense` et `Opportunity`. Si aucune vente n'est enregistrée sur une période, le graphe affiche légitimement 0 FCFA.

### Règle n°6 : Respecter rigoureusement le gabarit A4 de 3 pages pour les Fiches Techniques
- **L'Erreur Passée :** L'impression ou la génération PDF de la fiche technique débordait fréquemment sur une 4ème page avec seulement une ou deux lignes orphelines, rendant le document inexploitable pour les commerciaux.
- **La Solution Appliquée :**
  - Chaque page est calibrée avec une hauteur exacte de `295mm` et un conteneur rigide `box-sizing: border-box`.
  - Des sauts de page forcés en CSS (`page-break-after: always; break-after: page;`) structurent les 3 volets :
    - Page 1 : Couverture de prestige, présentation générale, identité de marque et photo 3/4 avant HD.
    - Page 2 : Galerie 4:3 (cockpit, sellerie, arrière) et tableau synthétique des dimensions & motorisation.
    - Page 3 : Spécifications techniques exhaustives (sécurité, multimédia, aides à la conduite) et mentions légales CARZONE SARL.

### Règle n°7 : Attention au Pooler de Connexions Neon PostgreSQL (Serverless)
- **L'Erreur Passée :** Lors des déploiements Serverless sur Vercel, chaque fonction lambda ouvrait une connexion PostgreSQL directe, causant des erreurs `Too many connections` et des timeouts lors des montées en charge.
- **La Solution Appliquée :**
  - Utiliser l'URL de connexion poolée (`ep-proud-mouse-b8e0zv1p-pooler...`) pour l'exécution courante de l'application via `POSTGRES_PRISMA_URL` avec l'option `&connect_timeout=15`.
  - Réserver l'URL directe non poolée (`DATABASE_URL_UNPOOLED`) uniquement pour les opérations d'administration Prisma CLI (`prisma db push`, `prisma migrate`).

### Règle n°8 : Ne jamais stocker de mots de passe en clair ni contourner le Middleware
- **L'Erreur Passée :** Un ancien endpoint de notification enregistrait temporairement un mot de passe non haché, et certaines sous-routes `/api` n'étaient pas correctement filtrées par le middleware d'authentification.
- **La Solution Appliquée :** Résolue au commit `a81849b`. Tous les mots de passe sont salés et hachés avec `bcryptjs`. Le middleware valide l'empreinte de session et vérifie systématiquement que le compte utilisateur est actif en base de données.

---

## 6. CARTOGRAPHIE DÉTAILLÉE DES MODULES OPÉRATIONNELS

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CARZONE SARL OPS                              │
├───────────────┬────────────────────────┬───────────────────────────────┤
│ CONCESSION    │ SERVICE APRÈS-VENTE   │ MOBILITÉ ÉLECTRIQUE           │
│ • Showroom    │ • Ordres Réparation    │ • Réseau de bornes            │
│ • CRM Leads   │ • Checklists (5k-100k) │ • Demandes d'installation     │
│ • Devis XOF   │ • Signatures Tablettes │ • Abonnements kWh             │
│ • Factures    │ • Magasin Pièces       │ • Terminal de paiement        │
│ • Importations│ • Références croisées  │ • Monétique Mobile Money / CB │
└───────────────┴────────────────────────┴───────────────────────────────┘
```

### 6.1. Module Véhicules & Showroom (`/vehicles`, `/catalog`)
- **Stock Showroom :** Gestion des numéros de châssis (VIN), motorisations (Thermique, Hybride, Électrique pur 100% EV), finitions, couleurs extérieures et intérieures.
- **Fiches Techniques AI :** Génération automatique à partir de la base interne `vehicle-catalog-specs.ts` (104 KB de données techniques vérifiées). Complétion par IA des données manquantes.
- **Catalogue Public (`/catalog`) :** Vitrine consultable par les prospects avec demande de cotation directe et bouton WhatsApp Business configuré avec le numéro de la concession (+229).

### 6.2. Module Commercial & CRM (`/opportunities`, `/clients`, `/quotes`)
- **Pipeline Kanban :** Déplacement fluide des opportunités (Nouveau lead → Qualification → Essai Showroom → Devis transmis → Vente conclue).
- **Générateur de Proformas :**
  - Calcul hors taxe (HT), TVA béninoise 18% (ou exonération), et total TTC en FCFA.
  - Conversion automatique du montant total en toutes lettres selon la grammaire française financière (`number-to-words-fr.ts`).
  - Conditions générales de vente et d'importation intégrées sur la proforma (acomptes à la commande, solde à la livraison, délais d'acheminement maritime).

### 6.3. Module Facturation & Fiscalité e-MECeF (`/invoices`)
- Validation des paiements (Espèces, Chèque, Virement bancaire, Mobile Money MTN/Moov).
- Connexion native au Service de Facturation Électronique (SFE) de la DGI Bénin :
  - Émission de la Facture de Vente (`FV`).
  - Récupération du `codeMECeFDGI`, du numéro machine `nim`, et du compteur fiscal.
  - Génération du QR Code officiel de contrôle DGI.

### 6.4. Module Pièces Détachées & Magasin (`/parts`)
- Suivi logistique en 5 étapes clés indispensables à l'activité import-export de Carzone :
  1. *Commandes Fournisseurs* (Chine, Dubaï, Europe).
  2. *En Production* chez le manufacturier.
  3. *En Transit Maritime* (sur conteneur).
  4. *Au Port de Cotonou* (en cours de dédouanement).
  5. *En Magasin Showroom / Atelier*.
- Croisement des références constructeurs (OEM) et adaptables pour faciliter l'identification rapide des pièces compatibles lors des entretiens.

### 6.5. Module Atelier SAV & Tablettes Tactiles (`/workshop`)
- Suivi de la flotte en réparation : date d'entrée, immatriculation, kilométrage, niveau de carburant, durée d'immobilisation, statut des travaux (En attente, En cours, Terminé, Livré).
- **Fiche d'Intervention :** Répertoire des anomalies constatées et pièces à commander.
- **Fiche d'Entretien Systématique :** Contrôle méthodique par palier de 5 000 km, 10 000 km, 30 000 km, 50 000 km et 100 000 km (vidanges, filtration, freinage, suspension, graissage, pose de la valise diagnostic).
- **Mode Tablette Tactile :** Saisie directe au chevet du véhicule par le mécanicien avec signature électronique du client et du chef d'atelier.

### 6.6. Module Écosystème Mobilité Électrique (`/charging`, `/charge-requests`, `/installers`, `/terminal`)
- Gestion du parc de bornes de recharge rapide déployées à Cotonou et Calavi.
- Tarification différentiée : **90 FCFA/kWh** pour les clients abonnés CARZONE vs **125 FCFA/kWh** pour les usagers publics occasionnels.
- Gestion des demandes d'installation de bornes à domicile ou en entreprise avec assignation aux installateurs partenaires agréés.
- Terminal TPE virtuel pour encaissement des sessions de charge par Mobile Money (MTN Mobile Money, Moov Money) ou carte bancaire.

### 6.7. Module Vocal Téléphonique IA (VAPI.ai) (`/api/vapi`)
- Webhook opérationnel pour connecter un agent téléphonique vocal intelligent.
- Prise en charge des appels entrants pour renseigner sur le stock disponible, fixer un essai routier au showroom ou donner le statut d'une réparation en atelier.

---

## 7. GESTION DES RÔLES, PERMISSIONS & SÉCURITÉ

L'application repose sur un contrôle d'accès basé sur les rôles (**RBAC - Role-Based Access Control**) configuré dans `apps/web/src/lib/permissions-config.ts` et `roles.ts`.

### 7.1. Matrice des Rôles Métiers

| Rôle | Code Système | Périmètre d'Accès Principal |
|---|---|---|
| **Président Directeur Général** | `PDG` | Accès absolu à l'ensemble des modules, validation stratégique et financière. |
| **Directeur Général** | `DG` | Gestion globale, tableau de bord financier, validation des devis et remises. |
| **Secrétaire Général** | `SG` | Supervision administrative, ressources humaines, correspondances. |
| **Directeur Commercial** | `DC` | Gestion du pipeline de vente, des commerciaux, des cotations et clients. |
| **Responsable Financier** | `RF` | Comptabilité, facturation e-MECeF, gestion des dépenses et trésorerie. |
| **Chef Atelier SAV** | `CHEF_ATELIER` | Gestion des ordres de réparation, assignation des techniciens, pièces. |
| **Responsable Tech Atelier** | `RTA` | Diagnostics complexes, validation des fiches techniques d'intervention. |
| **Administration des Ventes** | `ADV` | Suivi des commandes véhicules, importations, immatriculations ANaTT. |
| **Gestionnaire Stock** | `STOCK` | Entrées/sorties véhicules et gestion physique du magasin de pièces. |
| **Commercial Showroom** | `COMMERCIAL` | Accueil prospects, essais routiers, émission des devis proformas. |
| **Technicien Atelier** | `ATELIER` | Exécution des checklists sur tablette tactile, pointage des réparations. |
| **Stealth Developer** | `DEVELOPER` | Rôle technique invisible permettant la maintenance sans impacter les KPI métiers. |

### 7.2. Comptes par Défaut du Seed de Base
Tous les comptes d'amorçage sont configurés avec le mot de passe initial : `carzone2026`

- **Administration / Direction :** `igor@carzone.bj` ou `direction@topcarzone.com`
- **Accueil & Showroom :** `contact@topcarzone.com`
- **Comptabilité & Finances :** `compta@carzone.bj` ou `basile@carzone.bj`
- **Force Commerciale :** `commercial@carzone.bj` ou `jennifer@carzone.bj`
- **Gestionnaire du Stock :** `stock@carzone.bj`
- **Chef Atelier SAV :** `atelier@carzone.bj`
- **Installateur Bornes :** `installateur@volthome.bj`

---

## 8. ENVIRONNEMENTS, BASE DE DONNÉES & SECRETS (.ENV)

Le fichier `.env` de production est localisé dans `apps/web/.env`. Voici la signification et l'utilité de chacune des variables nécessaires :

> [!CAUTION]
> **Secrets masqués volontairement.** Les valeurs réelles (mot de passe Neon, clés Vercel AI Gateway / DeepSeek, secret de session) ne figurent **pas** dans ce document. Elles se récupèrent dans **Vercel → Settings → Environment Variables**, dans la **console Neon** (projet `carzone_db`) et dans le coffre-fort interne CARZONE SARL. Ne jamais committer de valeur réelle dans Git.

```env
# ==============================================================================
# SÉCURITÉ DE SESSION & CHIFFREMENT
# ==============================================================================
AUTH_SECRET="[SECRET_SESSION_MASQUE]"
NEXT_PUBLIC_APP_NAME="CARZONE SARL Ops"

# ==============================================================================
# BASE DE DONNÉES NEON POSTGRESQL (SERVERLESS)
# ==============================================================================
# URL utilisée par l'application Next.js (avec PgBouncer pooler et timeout adapté)
DATABASE_URL="postgresql://neondb_owner:[MOT_DE_PASSE_MASQUE]@ep-proud-mouse-b8e0zv1p-pooler.c-14.us-east-1.aws.neon.tech/carzone_db?channel_binding=require&sslmode=require"
POSTGRES_PRISMA_URL="postgresql://neondb_owner:[MOT_DE_PASSE_MASQUE]@ep-proud-mouse-b8e0zv1p-pooler.c-14.us-east-1.aws.neon.tech/carzone_db?channel_binding=require&connect_timeout=15&sslmode=require"
POSTGRES_URL="postgresql://neondb_owner:[MOT_DE_PASSE_MASQUE]@ep-proud-mouse-b8e0zv1p-pooler.c-14.us-east-1.aws.neon.tech/carzone_db?channel_binding=require&sslmode=require"

# URL DIRECTE SANS POOLER (Indispensable pour prisma db push / prisma migrate)
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:[MOT_DE_PASSE_MASQUE]@ep-proud-mouse-b8e0zv1p.c-14.us-east-1.aws.neon.tech/carzone_db?sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://neondb_owner:[MOT_DE_PASSE_MASQUE]@ep-proud-mouse-b8e0zv1p.c-14.us-east-1.aws.neon.tech/carzone_db?channel_binding=require&sslmode=require"

# Identifiants individuels Neon
POSTGRES_DATABASE="carzone_db"
PGDATABASE="carzone_db"
PGHOST="ep-proud-mouse-b8e0zv1p-pooler.c-14.us-east-1.aws.neon.tech"
PGHOST_UNPOOLED="ep-proud-mouse-b8e0zv1p.c-14.us-east-1.aws.neon.tech"
PGUSER="neondb_owner"
PGPASSWORD="[MASQUÉ_CONFIDENTIEL]"

# ==============================================================================
# MOTEURS D'INTELLIGENCE ARTIFICIELLE (FICHES TECHNIQUES)
# ==============================================================================
# Clé Vercel AI Gateway (pour appels unifiés OpenAI / Anthropic)
VERCEL_API_KEY="[CLE_VERCEL_MASQUEE]"
AI_GATEWAY_API_KEY="[CLE_VERCEL_MASQUEE]"
AI_GATEWAY_BASE_URL="https://ai-gateway.vercel.sh/v1"

# Clé directe DeepSeek (moteur principal pour les véhicules chinois)
DEEPSEEK_API_KEY="[CLE_DEEPSEEK_MASQUEE]"

# ==============================================================================
# FISCALITÉ DGI BÉNIN (e-MECeF / SyGMEF)
# ==============================================================================
# URL Sandbox : https://developper.impots.bj/sygmef-emcf
# URL Prod : https://sygmef.impots.bj/emcf
DGI_EMECEF_BASE_URL="https://developper.impots.bj/sygmef-emcf"
DGI_EMECEF_IFU="0202314589201"
DGI_EMECEF_NIM="MCF01-CARZONE-BJ01"
# Le JWT sera inséré dès validation du compte développeur SyGMEF
DGI_EMECEF_JWT=""
```

---

## 9. PROCÉDURES D'EXPLOITATION (RUNBOOK DÉVELOPPEUR)

### 9.1. Démarrage de l'Environnement Local
Dans le terminal (PowerShell sur Windows ou Bash sur Linux/Mac) :

```powershell
# 1. Se positionner dans l'application web
cd apps/web

# 2. Installer les dépendances si nécessaire
npm install

# 3. Générer le client Prisma typé
npm run db:generate

# 4. Lancer le serveur de développement local
npm run dev
```
L'application est accessible localement sur : `http://localhost:3000`

### 9.2. Mise à Jour du Schéma de Base de Données
Si vous modifiez `apps/web/prisma/schema.prisma` :

```powershell
cd apps/web

# Appliquer les modifications structurelles sur la BDD Neon
npm run db:push

# Régénérer le client Prisma TypeScript
npm run db:generate
```

> [!CAUTION]
> N'exécutez **JAMAIS** `npm run db:reset` sur la base de production Neon, car cette commande exécute un `--force-reset` qui efface toutes les factures, clients et données réelles de CARZONE !

### 9.3. Procédure de Déploiement en Production
Le projet est lié au compte Vercel de CARZONE. Tout push sur la branche `main` déclenche un build de production automatique :

```powershell
# 1. Vérifier le statut des fichiers modifiés
git status

# 2. Ajouter les fichiers au suivi Git
git add .

# 3. Créer un commit explicite
git commit -m "feat(workshop): finaliser les fiches d'intervention et signatures tablettes"

# 4. Déployer en production
git push origin main
```
Le build Vercel exécute automatiquement `prisma generate && next build`.

---

## 10. FEUILLE DE ROUTE & PROCHAINES ÉTAPES PRIORITAIRES

Pour le repreneur, voici les actions classées par ordre d'urgence et d'importance pour assurer la continuité opérationnelle :

```mermaid
graph TD
    A[Action Immédiate 1: db:push Neon] --> B[Action Immédiate 2: Commit & Deploy Atelier SAV]
    B --> C[Action 3: Test sur Tablette Garage]
    C --> D[Action 4: Obtenir JWT Sandbox DGI]
    D --> E[Action 5: Homologation 20 cas de test e-MECeF]
    E --> F[Action 6: Bascule DNS topcarzone.com]
```

### Action 1 (Immédiate) — ✅ FAIT : Synchroniser la BDD Neon pour l'Atelier SAV
- `npm run db:push` : base Neon déjà en phase avec le schéma (tables `WorkshopChecklistItem` et `WorkshopSignature` présentes).
- `npm run build` : compilation Next.js validée (48 routes, dont les 2 pages d'impression atelier).
- Commit `97589c6` poussé sur `main` → déploiement Vercel automatique déclenché.

### Action 2 (Immédiate) : Valider les Signatures Numériques sur Tablette
- Ouvrir le module `/workshop` sur une tablette tactile (iPad ou Samsung Galaxy Tab) au garage.
- Ouvrir la modal d'intervention, remplir une checklist 5 000 km, tester le tracé tactile des 3 signatures (Client, Mécanicien, Responsable).
- Vérifier l'impression A4 de la Fiche d'Intervention et de la Fiche d'Entretien.

### Action 3 (Court Terme) : Finaliser le Compte Développeur DGI e-MECeF
- Consulter le fichier [`docs/DGI-EMECEF-COMPTE-DEVELOPPEUR-SANDBOX.md`](file:///c:/Users/IGOR_GIANI/Desktop/Projet%20Carzone%20SARL/docs/DGI-EMECEF-COMPTE-DEVELOPPEUR-SANDBOX.md).
- Remplir le formulaire sur `https://developper.impots.bj/sygmef-emcf/Registration` avec l'IFU de l'éditeur pour obtenir le JWT de test.
- Renseigner la variable `DGI_EMECEF_JWT` dans le panneau d'environnement Vercel.
- Passer les 20 cas de tests officiels pour recevoir la lettre d'homologation de la DGI Bénin.

### Action 4 (Court Terme) : Bascule DNS du Domaine `topcarzone.com`
- Utiliser la fiche [`docs/FICHE_RECUEIL_ACCES_TECHNIQUES.md`](file:///c:/Users/IGOR_GIANI/Desktop/Projet%20Carzone%20SARL/docs/FICHE_RECUEIL_ACCES_TECHNIQUES.md) pour obtenir les accès registrar (bureau d'enregistrement) auprès de l'ancien webmaster.
- Pointer les enregistrements DNS de type `A` et `CNAME` vers l'infrastructure Vercel.
- Conserver les enregistrements `MX` intacts pour garantir **zéro coupure** sur la réception des e-mails professionnels de CARZONE.

---

## CONTACTS & RESSOURCES COMPLÉMENTAIRES

- **Direction Générale CARZONE SARL :** `direction@topcarzone.com` / +229 01 92 61 61 61
- **Auteur Initial de la Solution :** M. Igor GIANI (`igor@carzone.bj`)
- **Documentation Fiscale DGI Bénin :** [https://developper.impots.bj/sygmef-emcf](https://developper.impots.bj/sygmef-emcf) (Support DGI : 133 / `cdgi@finances.bj`)
- **Documentation Vercel AI Gateway :** [https://vercel.com/docs/ai/ai-gateway](https://vercel.com/docs/ai/ai-gateway)
- **Console Base de Données Neon :** [https://console.neon.tech](https://console.neon.tech) (Projet `carzone_db`)

---
*Ce document fait foi de l'état de l'art technique du projet au 23 Octobre 2026. Toute modification d'architecture ou de règle métier doit être consignée dans ce fichier ou dans les documents afférents du dossier `docs/`.*
