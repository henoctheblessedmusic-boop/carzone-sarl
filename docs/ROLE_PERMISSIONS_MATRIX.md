# Matrice des permissions par rôle - CARZONE SARL Ops

> Générée le 2026-11-02 suite à l'audit COMPTA_GARAGE + traçabilité.
> Source de vérité par couche (voir aussi mémoire `carzone-rbac-architecture`) :
> - **Middleware** : `src/middleware.ts` + `RoleService.isRouteAllowed` (`src/lib/role-service.ts`)
> - **Garde de page** : `requireUser([...])` dans chaque `page.tsx`
> - **Server actions** : `requireUser([...])` dans chaque `actions.ts`
> - **Menu** : `navDefs` dans `src/components/AppShell.tsx`
> - **Capacités cochables** : `DEFAULT_ROLE_CAPABILITIES` (`src/lib/permissions-config.ts`)
> - **Cloisonnement SHOWROOM/GARAGE** : `src/lib/permissions.ts` (`peutVoirDocuments`, `peutGererBL`, `activityScopeForRole`)

Ces 5 couches sont **indépendantes** et doivent être maintenues manuellement en cohérence :
un rôle peut voir un lien de menu, être bloqué par le middleware, ou voir la page mais pas
l'action serveur qui la sert. `scripts/audit-navigation.mjs` et
`scripts/audit-role-coherence.mjs` vérifient automatiquement une partie de cette cohérence.

## Rôles super-administrateurs (bypass total)

`DEVELOPER`, `PDG`, `SG`, `DG` contournent toutes les gardes de page et server actions
(`requireUser`). **`DEVELOPER` est en plus invisible du journal d'audit** (`lib/audit.ts`
ignore silencieusement toute action de ce rôle).

## Cloisonnement SHOWROOM / GARAGE

| Rôle | Périmètre comptable | BL qu'il peut émettre/annuler |
|---|---|---|
| DEVELOPER / DG / PDG / SG | Les deux (consolidé) | Les deux |
| ADV, RF, COMPTA, ADMIN | Les deux (consolidé) | COMPTA et super-admins seulement (`peutGererBL`) |
| **COMPTA_GARAGE** | **GARAGE uniquement** | **GARAGE uniquement** |
| Tous les autres rôles | Pas de restriction d'activité historique (voir note) | Aucun (pas de rôle BL) |

Note : seul `COMPTA_GARAGE` a une restriction d'activité stricte et vérifiable (`activityScopeForRole`
retourne `["GARAGE"]`). Les autres rôles n'ont pas de notion d'activité car ils ne touchent pas aux
documents comptables showroom/garage côté transcription BL/facture.

## COMPTA_GARAGE - accès détaillé (périmètre garage uniquement, jamais showroom/RH)

| Module | Page | Server actions | Activité forcée |
|---|---|---|---|
| `/workshop` | ✅ (page + fiche-intervention + fiche-entretien) | create/update/delete/import (`WORKSHOP_ALLOWED_ROLES`) | GARAGE (nature du module) |
| `/parts` | ✅ (`canManage` = false : lecture + mouvements, pas de suppression de référence) | create/update/record-movement/assign (`AUTHORIZED_ROLES`) ; `deletePart` exclu | - |
| `/delivery-notes` | ✅, filtré `activity=GARAGE` | create/cancel (`peutGererBL` → GARAGE uniquement) | GARAGE forcé serveur |
| `/quotes` | ✅, filtré `activity=GARAGE` | create/update/send/confirm/normalize/transcribe/void/delete - chacun vérifie `quote.activity === GARAGE` | GARAGE forcé serveur |
| `/invoices` | ✅, filtré `activity=GARAGE` | addPayment/void/certifyDgi/sendEmail - chacun vérifie `invoice.activity === GARAGE` | GARAGE forcé serveur |
| `/clients` | ✅ (pas de restriction d'activité : les clients sont transverses) | create/update (pas delete, pas import) | - |
| `/audit` (nouveau) | ✅, filtré `activity=GARAGE` | lecture uniquement | GARAGE forcé serveur |
| `/hr`, `/users`, `/expenses`, `/vehicles` (stock showroom), `/opportunities`, `/leads` | ❌ | ❌ | Hors périmètre garage par design |

**Correction du 2026-11-02** : `fiche-intervention` et `fiche-entretien` (`/workshop/[id]/...`)
n'autorisaient pas `COMPTA_GARAGE` ni `ASSISTANTE_COMPTABLE` - bug corrigé (ajout aux deux
`requireUser([...])`). `sendProforma` (quotes) avait aussi une liste de rôles plus étroite que
ses fonctions sœurs (`createProformaWithLines`, `confirmOrder`, etc.), détecté par le nouveau
script et corrigé pour inclure `ASSISTANTE_COMPTABLE`, `HOTESSE`, `RTA`, `DC`, `CHEF_ATELIER`,
`ADV`, `RF`.

## Matrice synthétique par rôle × module

Légende : `L`=lecture, `E`=écriture/création, `S`=suppression, `-`=aucun accès.
Les super-admins (DEVELOPER/PDG/SG/DG) ont toujours `L/E/S` partout (non répété ci-dessous).

| Rôle | Clients | Véhicules (stock) | Devis/Proformas | Factures | Atelier (SAV) | Pièces | BL internes | RH | Utilisateurs | Journal d'audit |
|---|---|---|---|---|---|---|---|---|---|---|
| ADV | L/E | L/E | L/E/S | L/E/S | L | L/E/S | - | - | L/E | - |
| RF | L/E | L/E | L/E/S | L/E/S | L | L | - | L/E | L | - |
| RTA | L/E | L/E | L/E/S | L | L/E/S | L/E | - | - | L/E | - |
| DC | L/E | L/E | L/E/S | L | L | L/E | - | - | L/E | - |
| COMMERCIAL | L/E | L | L/E | L/E | - | - | - | - | - | - |
| HOTESSE | L/E | L | L/E | L/E | - | - | - | - | - | - |
| CHEF_ATELIER | L/E | L | L/E | L/E | L/E | L/E | - | - | - | - |
| ASSISTANTE_COMPTABLE | L/E | L | L/E | L/E | L/E | - | - | L/E | - | - |
| RH | L (lecture) | - | - | - | - | - | - | L/E | L/E | - |
| ADMIN | L/E/S | L/E/S | L/E | L/E | L/E/S | L/E/S | L/E | L/E | L/E | L |
| COMPTA | L/E | L | L/E/S (2 périmètres) | L/E/S (2 périmètres) | L | L | L/E (2 périmètres) | L/E | - | L (2 périmètres) |
| **COMPTA_GARAGE** | L/E | - (showroom interdit) | **L/E/S (GARAGE uniquement)** | **L/E (GARAGE uniquement)** | **L/E/S (tout l'atelier)** | **L/E (hors suppression réf.)** | **L/E (GARAGE uniquement)** | - | - | **L (GARAGE uniquement)** |
| STOCK | - | L/E/S | - | - | L | L/E/S | - | - | - | - |
| ATELIER | - | L | - | - | L/E | L | - | - | - | - |
| BORNES_OPS | - | - | - | - | - | - | - | - | - | - |
| INSTALLATEUR | - | - | L (ses devis bornes) | - | - | - | - | - | - | - |

## Journal d'audit (traçabilité)

- Modèle Prisma additif `AuditLog` (`actorId`, `actorName`, `actorEmail`, `actorRole`, `action`,
  `entityType`, `entityId`, `entityLabel`, `activity`, `details`, `createdAt`).
- Helper `src/lib/audit.ts::logAudit()` : écrit une ligne, **jamais pour `DEVELOPER`**, et
  n'échoue jamais l'action métier appelante (erreur seulement loguée côté serveur).
- Instrumenté sur : véhicules (create/update/delete/force-delete/status), devis (create/update/
  send/confirm/normalize/transcribe/void/delete), factures (payment/void/certify-dgi/send-email),
  BL internes (create/cancel), atelier (create/update/delete/import-excel), pièces (create/update/
  delete/movement/assign), clients (create/update/delete/import).
- Page `/audit` : accessible à DEVELOPER, PDG, SG, DG, COMPTA, COMPTA_GARAGE, ADMIN ;
  `COMPTA_GARAGE` ne voit que `activity=GARAGE` (filtre forcé serveur, non dérivé de l'URL) ;
  aucune ligne `actorRole=DEVELOPER` ne peut exister (garde défensive en plus du skip à l'écriture).

## Incohérences résiduelles connues (hors scope de cette passe)

Signalées par `scripts/audit-role-coherence.mjs` en avertissement (non bloquant), déjà notées
dans la mémoire `carzone-rbac-architecture` avant cette intervention :

- `/catalog` n'autorise que `["DG","STOCK"]` alors que le menu liste ADV, RF, RTA, DC, ADMIN.
- `/imports` n'autorise que `["DG","STOCK","COMPTA"]` alors que le menu liste ADV, RF, ADMIN.
- `/opportunities` et `/leads` excluent ADV, RF, DC malgré le menu.

Ces trois points touchent des rôles de direction/commerciaux hors du périmètre demandé
(COMPTA_GARAGE et traçabilité) et n'ont pas été corrigés pour ne pas élargir le scope sans
validation métier explicite.
