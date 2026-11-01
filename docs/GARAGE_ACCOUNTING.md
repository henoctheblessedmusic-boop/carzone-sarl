# Comptabilité Garage — Rôle COMPTA_GARAGE & Bons de Livraison internes

## 1. Objectif

Séparer la comptabilité de l'atelier (GARAGE) de celle du showroom (SHOWROOM), avec un
rôle dédié **Comptable Garage** (`COMPTA_GARAGE`), supervisé par la comptable principale
(`COMPTA`), et des documents internes de déstockage non fiscaux (BL) distincts des
factures normalisées.

## 2. Rôle COMPTA_GARAGE

| Point | Détail |
|---|---|
| Libellé | "Comptable Garage" |
| Supervision | Champ additif `User.supervisorId` (relation `Supervision`), facultatif, pointant vers un `COMPTA`. Pas d'UI dédiée dans ce lot — à faire dans `/users` si besoin. |
| Périmètre | GARAGE uniquement, sur devis/proformas, factures, BL internes, et le tableau de bord. |
| Accès atelier/pièces | Oui (workshop, parts) — ces modules sont par nature 100% garage, pas de filtre nécessaire. |
| Accès showroom | Non — ne voit jamais les devis/factures/BL `activity = SHOWROOM`. |
| Certification e-MECeF | Autorisée, mais uniquement sur les factures `activity = GARAGE`. |

## 3. Matrice de permissions (implémentée)

| Action | COMPTA_GARAGE (GARAGE) | COMPTA_GARAGE (SHOWROOM) | COMPTA | Super-admin (DEVELOPER/DG/PDG/SG) |
|---|---|---|---|---|
| Créer/éditer/envoyer/confirmer un devis | ✅ | ❌ (403 applicatif) | ✅ (tout) | ✅ |
| Normaliser une facture | ✅ | ❌ | ✅ (tout) | ✅ |
| Certifier e-MECeF | ✅ | ❌ | ✅ (tout) | ✅ |
| Encaisser un paiement | ✅ | ❌ | ✅ (tout) | ✅ |
| Annuler une facture/devis | ✅ | ❌ | ✅ (tout) | ✅ |
| Créer un BL interne | ✅ (BL-GAR) | ❌ | ✅ (BL-GAR ou BL-SHW) | ✅ |
| Annuler un BL interne | ✅ (BL-GAR) | ❌ | ✅ (BL-GAR ou BL-SHW) | ✅ |
| Voir `/dashboard`, `/invoices`, `/quotes` | GARAGE uniquement | — | Consolidé | Consolidé |
| Voir `/workshop`, `/parts` | ✅ (100% garage) | — | ✅ | ✅ |
| Voir `/users`, `/hr`, `/expenses` | ❌ | — | selon rôle existant | ✅ |

La logique centrale vit dans `src/lib/permissions.ts` :
- `ACTIVITY` = `{ SHOWROOM, GARAGE }`
- `activityScopeForRole(role)` → `"ALL"` ou `["GARAGE"]` pour `COMPTA_GARAGE`
- `peutVoirDocuments(role, activity)` — lecture
- `peutGererBL(role, activity)` — création/annulation des BL internes (GARAGE → `COMPTA_GARAGE`/`COMPTA`/super-admin ; SHOWROOM → `COMPTA`/super-admin uniquement)
- `estSuperAdmin(role)`

Les gardes sont appliquées dans les Server Actions (`requireUser([...])` + vérification
`activity` de l'enregistrement ciblé) : `workshop/actions.ts`, `parts/actions.ts`,
`quotes/actions.ts`, `invoices/actions.ts`, `delivery-notes/actions.ts`. La navigation
(`AppShell.tsx`) et le middleware (`src/lib/role-service.ts`) appliquent la même matrice
côté UI/route.

## 4. BL interne vs Facture normalisée

| | BL interne (DeliveryNote) | Facture normalisée (Invoice) |
|---|---|---|
| Valeur fiscale | Aucune | Oui, soumise à e-MECeF |
| Mentions interdites | "facture", "TVA", "normalisée", "e-MECeF" | — |
| Mention imprimée | **DOCUMENT INTERNE NON FISCAL — NE PEUT SERVIR DE FACTURE** | Mentions légales + bloc e-MECeF |
| Numérotation | `BL-GAR-0001…` (garage) / `BL-SHW-0001…` (showroom), séquences séparées | `FAC-年-0001…` (partagé, préfixe `FAC-GAR` possible côté facture normalisée garage) |
| Annulation | Statut `EMIS → ANNULE`, motif ≥ 8 caractères, mouvements de stock inversés | Avoir/annulation DGI — **une facture normalisée certifiée ne s'annule que par avoir justifié DGI**, jamais par simple annulation interne une fois certifiée |
| Création | `createAndIssueDeliveryNote` (création + déstockage en une seule transaction Prisma) | `normalizeInvoice` depuis un devis `COMMANDE_CONFIRMEE` |

### Création + déstockage (`createAndIssueDeliveryNote`)

Action serveur **unique et atomique** (une seule transaction Prisma) : le flux
`createDeliveryNote` puis `issueDeliveryNote` séparé a été supprimé. Si une seule ligne
échoue (stock insuffisant, véhicule indisponible, périmètre d'activité incohérent),
**aucun BL n'est créé** — rollback complet, message d'erreur explicite renvoyé à l'UI.

Validations avant écriture :
- au moins une ligne réelle (véhicule ou pièce) par ligne du BL ;
- véhicule : doit exister et ne pas être déjà `VENDU` ou `ARCHIVE` (vérification +
  bascule à `VENDU` atomiques via `updateMany({ where: { status: { notIn: [...] } } })`,
  robuste en cas de double clic ou de lignes dupliquées sur le même véhicule) ;
- pièce : `stockQuantity >= quantity` vérifié et décrémenté atomiquement de la même façon,
  sinon erreur « Stock insuffisant pour \<pièce\> (disponible X, demandé Y) » ;
- autorisation : `peutGererBL(role, activity)` ;
- devis/facture liés (optionnels) : leur `activity` doit correspondre à celle du BL (un BL
  GARAGE ne peut pas référencer un devis/facture SHOWROOM et inversement).

Déstockage (dans la même transaction) :
- Ligne véhicule → `Vehicle.status = "VENDU"`.
- Ligne pièce → `PartItem.stockQuantity` décrémenté + `PartStockMovement` (`SORTIE_ATELIER`,
  quantité négative, `referenceDoc` = numéro du BL, `performedBy` = email de l'auteur).

### Annulation (`cancelDeliveryNote`)
- Autorisation : `peutGererBL(role, note.activity)`.
- Autorisée uniquement si le BL est `EMIS` (refus explicite si déjà `ANNULE` ou autre statut).
- Transition de statut `EMIS → ANNULE` effectuée via `updateMany({ where: { status: "EMIS" } })`
  dans la transaction : en cas de double clic/annulation concurrente, la seconde tentative
  échoue proprement sans rejouer les mouvements de stock.
- Motif obligatoire ≥ 8 caractères, horodaté, auteur tracé (`cancelledByName`).
- Véhicule → remis à `EN_STOCK` **uniquement si son statut est actuellement `VENDU`**
  (`updateMany({ where: { status: "VENDU" } })`) ; l'état précédent détaillé n'est pas
  conservé dans ce lot (voir "Points restants").
- Pièce → la restitution n'a lieu que si un mouvement `SORTIE_ATELIER` référençant le
  numéro du BL existe pour cette ligne (`PartStockMovement.referenceDoc = note.number`) ;
  sinon la ligne est ignorée (évite un double crédit de stock). Si le mouvement existe :
  `PartStockMovement` inverse (`RETOUR_STOCK`, quantité positive) +
  `PartItem.stockQuantity` réincrémenté.

## 4bis. RH : la comptable principale (COMPTA) cumule la gestion RH

La comptable principale (`COMPTA`) **cumule la gestion RH** en plus de son périmètre
comptable consolidé (showroom + garage). Ce cumul n'est pas une nouveauté de ce lot : les
pages et actions RH (`src/app/hr/page.tsx`, `src/app/hr/actions.ts`, nav `/hr` dans
`AppShell.tsx`, `RoleService.isRouteAllowedForUser`) autorisaient déjà `COMPTA` — ce lot ne
fait que le documenter et clarifier le libellé du rôle (`ROLE_LABELS.COMPTA` =
« Comptabilité & RH (comptable principale) » dans `src/lib/roles.ts`).

- **`COMPTA`** : accès `/hr` (salariés, congés, départements, paie) + accès comptable
  consolidé (showroom + garage).
- **`COMPTA_GARAGE`** (comptable garage) : **aucun accès RH**. Ni dans la liste de rôles
  de `hr/page.tsx` / `CAN_MANAGE_HR` de `hr/actions.ts`, ni dans la nav `/hr` de
  `AppShell.tsx`, ni dans `RoleService.isRouteAllowed`/`isRouteAllowedForUser` (son tableau
  de permissions dans `role-service.ts` ne contient pas `hr:read`/`hr:write`). Son
  périmètre reste strictement limité à GARAGE sur devis/factures/BL + atelier/pièces
  (voir §2-3).

## 5. Schéma de données (additif uniquement)

- `User.supervisorId` (+ relation self `Supervision`, `onDelete: SetNull`).
- `Quote.activity` / `Invoice.activity` / `WorkOrder.activity` : `String @default(...)`
  (`SHOWROOM` pour Quote/Invoice, `GARAGE` pour WorkOrder — un ordre de réparation est par
  nature un acte d'atelier).
- `DeliveryNote` / `DeliveryNoteLine` : nouveaux modèles (voir `prisma/schema.prisma`).

Aucune colonne existante n'a été supprimée, renommée ou retypée. Le diff SQL généré est
strictement additif (`ADD COLUMN`, `CREATE TABLE`, `ADD CONSTRAINT`) — voir rapport de
vérification.

## 6. Numérotation

| Document | Préfixe | Fonction |
|---|---|---|
| Proforma/devis | `PRO-` (partagé showroom/garage) | `nextDocNumber("PRO", count)` |
| Facture normalisée | `FAC-年-...` (showroom), `FAC-GAR-...` (quand le devis source est `activity = GARAGE`) | `nextDocNumber(prefix, count)` dans `normalizeInvoice` |
| BL interne garage | `BL-GAR-0001…` | `nextDeliveryNoteNumber("GARAGE", count)` |
| BL interne showroom | `BL-SHW-0001…` | `nextDeliveryNoteNumber("SHOWROOM", count)` |

Les compteurs BL sont comptés par `activity` (`prisma.deliveryNote.count({ where: { activity } })`),
ce qui garantit deux séquences indépendantes.

## 7. e-MECeF — plan d'intégration garage

Le mode `DGI_EMECEF_MODE` (`LIVE`/`DEMO`, voir `docs/EMECEF_INTEGRATION.md`) s'applique de
façon identique aux factures `activity = GARAGE` et `SHOWROOM` : `certifyInvoiceDgi`
(`src/app/invoices/actions.ts`) ajoute uniquement une garde supplémentaire — un
`COMPTA_GARAGE` ne peut certifier qu'une facture `activity = GARAGE`. Aucune modification
du client e-MECeF (`src/lib/dgi-emecef.ts`) n'était nécessaire : le payload soumis à la DGI
ne distingue pas les deux périmètres (une facture certifiée reste une facture CARZONE SARL
unique du point de vue fiscal).

## 8. Points restants / risques

1. **Pas d'UI de supervision** : `User.supervisorId` est modélisé mais aucun écran
   `/users` ne permet encore de l'éditer — à ajouter si le besoin se confirme.
2. **Bilan financier (onglet `/invoices` → Bilan)** : les dépenses (`Expense`) et salaires
   (`SalaryPayment`) ne portent pas de champ `activity` (jugé hors périmètre pour ce lot —
   ce sont des charges globales d'entreprise, pas des documents clients). Le bilan complet
   reste donc consolidé même pour `COMPTA_GARAGE` ; seules les listes factures/devis/BL et
   les KPI du tableau de bord sont filtrés par activité.
3. **État précédent du véhicule à l'annulation d'un BL** : faute d'un historique de statut
   dédié, un véhicule annulé repasse toujours à `EN_STOCK` (pas de restitution d'un état
   intermédiaire comme `EN_TRANSIT`).
4. **Pas de séquence séparée pour les factures/devis** (`FAC-GAR` reste un préfixe
   cosmétique sur un compteur global partagé) — jugé acceptable car le sujet n'était que
   "recommandé", pas obligatoire.
5. **Double déstockage / double annulation concurrentiels (résolu)** : `createAndIssueDeliveryNote`
   et `cancelDeliveryNote` utilisent chacun un `updateMany` à condition d'état (statut
   véhicule/pièce/BL) à l'intérieur d'une transaction Prisma unique — la création et le
   déstockage ne font plus qu'une seule opération atomique, et l'annulation ne peut pas
   rejouer une restitution de stock déjà effectuée. Pas de verrou explicite au niveau base
   (non nécessaire au volume actuel de CARZONE SARL), mais plus de fenêtre où un BL `EMIS`
   peut exister sans son mouvement de stock associé.
6. **Numéro de BL non garanti sous forte concurrence** : le numéro (`nextDeliveryNoteNumber`)
   est calculé via `count()` dans la transaction ; en cas de création strictement
   simultanée de deux BL sur la même activité, la contrainte `@unique` sur `number` fait
   échouer (et annule) la seconde transaction plutôt que de produire un doublon — l'auteur
   doit alors relancer la création. Acceptable au volume actuel ; à revoir si le volume de
   création simultanée augmente (séquence dédiée en base).
