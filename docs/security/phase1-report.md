# Phase 1 - Durcissement des rôles et des API

Date : 2026-11-07
Statut : déployé en production
Commit : `487229b`

## Corrections appliquées

### Gestion des rôles

- Les rôles `PDG`, `DG`, `SG`, `ADMIN` et les rôles financiers `RF`, `COMPTA`, `ASSISTANTE_COMPTABLE`, `COMPTA_GARAGE` sont protégés.
- Seuls les super-admins peuvent attribuer ou gérer ces comptes.
- Le rôle `DEVELOPER` reste réservé au DEVELOPER.
- Un utilisateur ne peut plus modifier son propre rôle.
- Un utilisateur non super-admin ne peut plus modifier ses propres permissions.
- Les permissions personnalisées d'un utilisateur non super-admin doivent rester dans le périmètre du rôle cible.
- La création d'un compte exige un mot de passe de 8 caractères minimum.
- L'interface masque les rôles protégés pour les gestionnaires non super-admins.

### Routes API sensibles

Ajout de `api-auth.ts`, qui relit le rôle, le statut actif et les permissions en base à chaque requête API.

Routes corrigées :

- `GET /api/terminal/meta` : permission `charging:read`.
- `POST /api/terminal/pay` : permission `charging:write`.
- `GET /api/workshop/export` : permission `workshop:read`.
- `POST /api/ai/tech-sheet` : permission `vehicles:write`.
- `GET /api/reports/financial-excel` : permission `financial_report:export` avec utilisateur rechargé en base.

## Tests effectués en production

### COMMERCIAL

- `/api/terminal/meta` : 403.
- `/api/workshop/export` : 403.
- `/api/reports/financial-excel` : 403.

### BORNES_OPS

- `/api/terminal/meta` : 200, accès légitime conservé.
- `/api/workshop/export` : 403.
- `/api/reports/financial-excel` : 403.

### Comptes de test

Deux comptes temporaires ont été créés pour ces tests, puis supprimés. Aucun compte de test actif ne reste.

### Build

- `npx tsc --noEmit` : OK.
- `npm run build` : OK.
- `npm run check:no-em-dash` : OK.
- Tests unitaires des gardes de rôle : OK.

## Revue Claude

Claude a rendu un verdict GO avec réserves avant correction de REV-01. La réserve principale concernait l'absence d'appel à `assertCanAssignPermissions`. Cette fonction est maintenant utilisée dans la création, la modification et la personnalisation des permissions.

## Points restant à traiter

### Intervention utilisateur requise

1. **Secret VAPI** : définir `VAPI_SECRET` ou `VAPI_WEBHOOK_SECRET` dans Vercel et dans VAPI.ai. Ensuite, rendre le contrôle obligatoire dans le handler.
2. **Rotation des mots de passe par défaut** : deux comptes actifs utilisent encore le mot de passe de démonstration documenté, dont un DG. Il faut prévenir les utilisateurs concernés et invalider leurs sessions.

### Corrections à programmer

- Révocation des sessions après désactivation ou changement de rôle.
- Mise à jour de Next.js et des dépendances vulnérables.
- CSP.
- Rate limiting partagé.
- Liste blanche des domaines d'images.
- Contrôle central des nouvelles routes API.
- Validation du périmètre véhicule sur les fiches techniques.
