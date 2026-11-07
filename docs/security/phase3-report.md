# Phase 3 - Changement de mot de passe obligatoire

Date : 2026-11-07
Statut : déployé en production
Commits : `da61370`, `c005e9f`, `d15ef52`, `5588b56`

## Objectif

Forcer les utilisateurs qui ont encore un mot de passe de démonstration à définir un mot de passe personnel dès la connexion, sans les bloquer définitivement.

## Fonctionnement

- Le champ `User.mustChangePassword` indique qu'un changement est obligatoire.
- À la connexion, l'application détecte aussi les anciens mots de passe de démonstration encore actifs et active le drapeau automatiquement.
- Un popup bloquant s'affiche sur toutes les pages internes tant que le mot de passe n'a pas été changé.
- Le popup contient :
  - ancien mot de passe ;
  - nouveau mot de passe ;
  - confirmation du nouveau mot de passe.
- La validation vérifie :
  - la présence des trois champs ;
  - la longueur minimale de 8 caractères ;
  - la correspondance des deux nouveaux mots de passe ;
  - l'ancien mot de passe ;
  - que le nouveau mot de passe est différent de l'ancien.
- Après validation :
  - le mot de passe est remplacé ;
  - `mustChangePassword` passe à `false` ;
  - la version de session est incrémentée ;
  - le cookie est supprimé ;
  - l'utilisateur est redirigé vers la page de connexion avec un message de confirmation.
- Après reconnexion avec le nouveau mot de passe, le popup ne revient plus.

## Comptes de démonstration

- Les comptes de démonstration connus du seed ont été recherchés et supprimés s'ils existaient.
- Aucun de ces comptes n'était présent dans la base au moment de l'opération.
- Tous les comptes temporaires de test ont été supprimés.
- Il reste 7 comptes actifs, tous des comptes réels.
- 1 compte actif était encore configuré avec le mot de passe de démonstration et a été marqué pour changement obligatoire.

## Tests effectués

- Popup affiché à la connexion d'un compte marqué : OK.
- Le popup remplace bien l'onboarding pour ne pas superposer deux fenêtres : OK.
- Ancien mot de passe incorrect refusé : couvert par le contrôle serveur.
- Nouveau mot de passe inférieur à 8 caractères refusé : OK.
- Confirmation différente refusée : OK.
- Changement réussi : `mustChangePassword = false`, session invalidée.
- Redirection vers `/login?passwordChanged=1` : OK.
- Connexion avec le nouveau mot de passe : OK.
- Aucun compte de test restant : OK.

## Build

- `npx tsc --noEmit` : OK.
- `npm run build` : OK.
- `npm run check:no-em-dash` : OK.

## Points d'attention

- Un utilisateur qui change son mot de passe est déconnecté et doit se reconnecter. C'est volontaire pour appliquer la révocation de session.
- Le compte de direction encore marqué verra le popup à sa prochaine connexion.
- Le popup ne peut pas être fermé sans changer le mot de passe ; seule la déconnexion est possible.
