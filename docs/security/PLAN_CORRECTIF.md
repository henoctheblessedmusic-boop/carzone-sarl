# Plan de remédiation sécurité CARZONE SARL Ops

## Statut d'avancement

- Phase 1 : déployée le 2026-11-07, commit `487229b`. Détail : `phase1-report.md`.
- En attente d'intervention : secret VAPI et rotation des mots de passe par défaut.
- À programmer : révocation des sessions, dépendances, CSP, rate limiting, images.

Objectif : supprimer les risques critiques et hauts sans casser les parcours métier existants.
Principe : corriger d'abord les autorisations et les accès, puis les dépendances et la configuration, ensuite les contrôles préventifs.

## Phase 0 - Gel et vérification immédiate (0 à 24 h)

### 0.1 Sauvegarde et gel des accès à risque

- Faire une sauvegarde Neon avant toute modification.
- Relever les comptes actifs et les sessions sensibles.
- Ne pas exécuter de script de seed contre la production.
- Prévenir les utilisateurs concernés par une future rotation de mot de passe.

### 0.2 Rotation des comptes à mot de passe par défaut

- Identifier les comptes actifs qui utilisent encore le mot de passe de démonstration.
- Générer un mot de passe temporaire aléatoire pour chacun.
- Forcer le changement à la première connexion.
- Invalider les sessions existantes.
- Ne jamais réutiliser `[MOT DE PASSE DE DEMONSTRATION MASQUE]` en production.

Critère d'acceptation : aucun compte actif ne correspond au mot de passe par défaut.

## Phase 1 - Autorisations critiques (24 à 72 h)

### 1.1 Corriger la gestion des rôles

Fichier principal : `apps/web/src/app/users/actions.ts`.

Actions :

- Définir une matrice d'assignation :
  - DEVELOPER : réservé au DEVELOPER.
  - PDG, DG, SG, ADMIN : réservés aux super-admins actuels.
  - RH, ADV, RTA, DC : ne peuvent attribuer que les rôles opérationnels autorisés par leur périmètre.
- Interdire l'auto-modification de son propre rôle.
- Interdire l'auto-attribution de permissions supplémentaires.
- Valider le rôle contre la liste `Role` avant écriture.
- Bloquer la création d'un compte DEVELOPER par un non-DEVELOPER.
- Bloquer la modification d'un compte DEVELOPER par un non-DEVELOPER.
- Ajouter un contrôle de cible pour `toggleUserActive` et `deleteUser` : un rôle intermédiaire ne doit pas désactiver ou supprimer un rôle supérieur.
- Ajouter un journal d'audit avec acteur, cible, ancien rôle, nouveau rôle et décision.

Tests de non-régression :

- Un PDG peut créer un commercial et un chef d'atelier.
- Un RH ne peut pas créer un DG.
- Un ADV ne peut pas s'attribuer PDG.
- Un ADMIN ne peut pas modifier un DEVELOPER.
- Les invitations et l'interface Utilisateurs continuent de fonctionner.

### 1.2 Autoriser explicitement les routes API sensibles

Ajouter un helper serveur commun, par exemple `requireApiPermission(user, permission)`.

Routes à corriger :

| Route | Permission attendue |
|---|---|
| `GET /api/terminal/meta` | `charging:read` ou rôle bornes autorisé |
| `POST /api/terminal/pay` | `charging:write` ou rôle bornes autorisé |
| `GET /api/workshop/export` | `workshop:read` ou rôle atelier autorisé |
| `POST /api/ai/tech-sheet` | `vehicles:write` et vérification du véhicule |
| `GET /api/ai/settings` | rôle de configuration uniquement |
| `POST /api/ai/settings` | rôle super-admin ou administrateur d'application |
| `GET /api/calls/conference` | session participant ou rôle autorisé, sans données d'autres salles |
| `POST /api/vapi/webhook` | secret obligatoire, sinon 401 |

Règles :

- Vérifier le rôle effectif en base, pas seulement le rôle du cookie.
- Vérifier l'appartenance ou la portée métier quand un identifiant est fourni.
- Garder les routes chat, notifications et appels filtrées par `session.id`.
- Ne pas bloquer les routes nécessaires aux communications internes.

Tests :

- COMMERCIAL : 403 sur terminal/meta, terminal/pay, workshop/export, ai/tech-sheet.
- BORNES_OPS : 200 sur terminal/meta et terminal/pay.
- CHEF_ATELIER ou RTA : 200 sur workshop/export.
- Rôle véhicule autorisé : 200 sur ai/tech-sheet uniquement pour un véhicule de son périmètre.
- Notifications, chat et appels : aucun changement fonctionnel.

### 1.3 Protéger le webhook VAPI

- Créer `VAPI_SECRET` ou `VAPI_WEBHOOK_SECRET` dans Vercel.
- Configurer le même secret dans VAPI.ai.
- Rendre la vérification obligatoire : si le secret est absent, retourner 401 et journaliser l'erreur.
- Comparer le secret en temps constant.
- Limiter les tailles de payload et les types d'événements acceptés.
- Ajouter un rate limit et un journal d'audit.
- Vérifier qu'aucun test de création réel n'est effectué en production.

Critère d'acceptation : une requête sans secret retourne 401 ; une requête signée VAPI continue de créer les devis attendus.

### 1.4 Révoquer les sessions côté API

- Ajouter un champ `sessionVersion` ou `tokenVersion` au modèle `User`.
- Inclure cette version dans le cookie de session.
- Vérifier la version et le rôle en base dans `getSession` ou dans un helper API.
- Incrémenter la version lors de :
  - désactivation ;
  - changement de rôle ;
  - changement de mot de passe ;
  - suppression ;
  - réinitialisation de permissions.
- Prévoir un cache court pour ne pas interroger la base à chaque requête si nécessaire.

Tests :

- Session valide avant désactivation.
- Session refusée après désactivation, y compris sur les routes API.
- Session refusée après changement de rôle.
- Session refusée après changement de mot de passe.

## Phase 2 - Dépendances et en-têtes (3 à 7 jours)

### 2.1 Mettre à jour les dépendances

- Mettre Next.js à une version 15.x corrigée, au minimum 15.5.29, dans une branche de test.
- Mettre zod à 4.6.6 ou supérieur.
- Mettre sharp et postcss via la version Next corrigée.
- Mettre à jour source-map-js.
- Remplacer xlsx ou isoler son usage :
  - option recommandée : bibliothèque Excel maintenue ;
  - option intermédiaire : limite de taille, validation MIME et import réservé aux administrateurs.
- Exécuter `npm audit --omit=dev` après chaque mise à jour.
- Tester build, imports Excel, exports Excel, images Next et routes API.

Critère d'acceptation : audit de production sans vulnérabilité critique ou haute non acceptée, build et tests de parcours passants.

### 2.2 Ajouter la CSP

- Démarrer en `Content-Security-Policy-Report-Only`.
- Recenser les domaines de scripts, styles, images, polices et connexions.
- Ajouter des nonces pour les scripts inline Next.js.
- Passer en mode bloquant après une semaine sans violation critique.
- Conserver HSTS déjà présent et le rendre explicite dans le middleware.
- Garder X-Frame-Options, X-Content-Type-Options, Referrer-Policy et Permissions-Policy.

### 2.3 Restreindre les images distantes

- Remplacer `hostname: "**"` par une liste blanche des domaines réellement utilisés.
- Refuser les schémas `http` non nécessaires.
- Bloquer les adresses privées et les plages de métadonnées.
- Vérifier les photos véhicules, logos et imports avant déploiement.

## Phase 3 - Rate limiting, uploads et conformité (7 à 14 jours)

- Utiliser un stockage partagé pour les rate limits publics, par exemple Vercel KV ou Upstash Redis.
- Ajouter un rate limit à `/api/public/rental-request`.
- Valider l'IP réelle fournie par Vercel et ne pas faire confiance au premier `x-forwarded-for` client.
- Limiter la taille des documents clients, valider le MIME et le type d'extension.
- Ne pas stocker de gros fichiers en data URL dans Postgres.
- Chiffrer ou externaliser les clés API stockées en base.
- Ajouter une politique de mot de passe minimale et un changement forcé à la première connexion.
- Éviter les messages qui distinguent compte inactif, compte inexistant et identifiants invalides au login.

## Phase 4 - Contrôles permanents

- Ajouter des tests d'autorisation par rôle dans la CI.
- Ajouter un test qui vérifie que chaque route API a un contrôle d'authentification et de permission.
- Ajouter un test qui interdit l'assignation de rôles supérieurs par un rôle intermédiaire.
- Ajouter un scan de secrets dans la CI.
- Ajouter `npm audit --omit=dev` dans la CI avec seuil bloquant pour critical et high.
- Revoir les nouvelles routes API à chaque pull request.
- Mettre en place un journal d'accès administrateur et une alerte sur les changements de rôle.
- Faire un test d'intrusion externe après les phases 1 et 2.

## Matrice de décision et de rollback

| Changement | Impact métier | Rollback |
|---|---|---|
| Restriction des rôles | Empêche les promotions non autorisées | Rétablir l'ancien code si un cas métier légitime casse |
| Contrôles API | Bloque les rôles non autorisés | Ajuster la permission ou le rôle dans le helper |
| Secret VAPI | Coupe VAPI si le secret n'est pas synchronisé | Configurer le secret avant de déployer |
| Révocation session | Déconnecte les utilisateurs après changement | Version de session réversible par migration additive |
| Next update | Risque de régression UI/API | Déployer sur preview, rollback Vercel |
| CSP report-only | Pas de blocage initial | Retirer l'en-tête si bruit excessif |
| Images allowlist | Photos externes non listées invisibles | Élargir la liste des domaines légitimes |

## Ordre de livraison recommandé

1. Rotation des mots de passe et secret VAPI.
2. Correctif des rôles et permissions des actions utilisateurs.
3. Correctif des routes API sensibles.
4. Révocation des sessions.
5. Mise à jour Next.js et dépendances.
6. CSP et images.
7. Rate limiting partagé et uploads.
8. Tests d'intrusion et surveillance continue.

## Critères de sortie

- Aucun compte actif avec le mot de passe de démonstration.
- Aucun rôle intermédiaire ne peut créer ou promouvoir un super-admin.
- Un rôle non autorisé reçoit 403 sur les API sensibles.
- Le webhook VAPI est refusé sans secret.
- Une session désactivée ne donne plus accès aux API.
- `npm audit --omit=dev` ne remonte plus de vulnérabilité critique ou haute non acceptée.
- CSP en mode bloquant ou report-only validé.
- Tous les parcours métier critiques passent après correction.
