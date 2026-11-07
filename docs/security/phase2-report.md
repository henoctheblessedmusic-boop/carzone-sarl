# Phase 2 - Révocation des sessions

Date : 2026-11-07
Statut : déployé en production
Commit : `9fd0b5b`

## Objectif

Faire en sorte qu'une désactivation, une rétrogradation, un changement de permissions ou un changement de mot de passe prenne effet immédiatement, y compris sur les routes API, sans attendre l'expiration du cookie de 14 jours.

## Modifications

- Ajout de `User.sessionVersion` (entier, valeur par défaut 0).
- Le cookie de session contient la version de session.
- `getSession` relit désormais en base :
  - le statut actif ;
  - le rôle courant ;
  - les permissions personnalisées ;
  - la version de session.
- Une session dont la version ne correspond plus est rejetée.
- Le changement de mot de passe incrémente la version de session.
- La désactivation ou la réactivation d'un compte incrémente la version de session.
- Les pages, server actions et routes API utilisent cette session rafraîchie.

## Tests effectués en production

- Connexion normale du DG : OK.
- `/dashboard` : 200.
- `/users` : 200.
- Compte temporaire COMMERCIAL :
  - connexion : 200 ;
  - compte désactivé et version incrémentée ;
  - `/api/notifications` : 401 ;
  - `/api/terminal/meta` : 401.
- Compte temporaire supprimé après le test.

## Build

- `npx tsc --noEmit` : OK.
- `npm run build` : OK.
- `npm run check:no-em-dash` : OK.

## Effets de bord attendus

- Un utilisateur dont le mot de passe est réinitialisé doit se reconnecter.
- Un utilisateur désactivé perd immédiatement l'accès, même avec un ancien cookie.
- Les pages existantes conservent leur logique de permission.
- Le middleware continue d'utiliser le cookie pour le routage initial, mais les pages et API revalident la session en base.

## Prochaine étape

- Traiter le secret VAPI et la rotation des mots de passe par défaut, qui nécessitent une intervention utilisateur.
- Puis mettre à jour Next.js et les dépendances.
