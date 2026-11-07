# Audit de sécurité - comparaison Claude et DeepSeek

Date : 2026-11-07
Périmètre : code applicatif, API, server actions, sessions, configuration Vercel, dépendances.
Méthode : deux audits indépendants, puis vérification croisée des constats.

- Rapport Claude : `claude-audit.md`
- Rapport DeepSeek : `deepseek-audit.md`
- Plan commun : `PLAN_CORRECTIF.md`

## 1. Tableau comparatif

| ID | Constat | Claude | DeepSeek | Statut consolidé | Sévérité |
|---|---|---|---|---|---|
| SEC-01 | Élévation de privilèges par les actions utilisateurs | Confirmé | Confirmé | Consensus | CRITIQUE |
| SEC-02 | Routes API hors contrôle de rôle | Confirmé | Confirmé et testé avec COMMERCIAL | Consensus, preuve HTTP | CRITIQUE |
| SEC-03 | Webhook VAPI non authentifié | Confirmé, secret absent en production | Confirmé, POST passif 200 | Consensus | CRITIQUE |
| SEC-04 | Mots de passe par défaut encore actifs | Non couvert | 2 comptes actifs dont 1 DG | DeepSeek, vérifié bcrypt | CRITIQUE |
| SEC-05 | Session non révoquée après désactivation côté API | Non couvert, point positif erroné sur les API | Testé : cookie encore accepté | DeepSeek, vérifié | HAUT |
| SEC-06 | Données clients et atelier accessibles à des rôles non concernés | Confirmé dans le constat API | Testé avec COMMERCIAL | Consensus | HAUT |
| SEC-07 | Écritures terminal et fiche technique accessibles à tout compte | Confirmé | Confirmé | Consensus | HAUT |
| SEC-08 | Dépendances vulnérables | Partiel, xlsx seulement | next 15.2.9 critique, xlsx, zod, sharp, postcss, source-map-js | DeepSeek plus complet | CRITIQUE |
| SEC-09 | Configuration d'images Next ouverte | Risque non confirmé | Risque non confirmé, test 400 sur IP privée | Consensus, à durcir | MOYEN |
| SEC-10 | Fallback AUTH_SECRET codé en dur | Confirmé non exploitable en production | Confirmé, forged cookie rejeté | Consensus | MOYEN |
| SEC-11 | En-têtes de sécurité | CSP et HSTS annoncés absents | HSTS présent, CSP absente | Désaccord corrigé : HSTS présent | MOYEN |
| SEC-12 | Rate limiting public incomplet | Confirmé | Confirmé | Consensus | MOYEN |
| SEC-13 | Mot de passe par défaut à la création | Confirmé | Confirmé | Consensus | MOYEN |
| SEC-14 | Upload de documents sans limite serveur | Non couvert | Confirmé par lecture | DeepSeek | MOYEN |
| SEC-15 | Énumération de comptes au login | Non couvert | Confirmé par lecture | DeepSeek | BAS |
| SEC-16 | Ports et secrets client | Non vérifié en direct | 80/443 seulement, aucun secret dans le bundle | DeepSeek, vérifié | INFO |
| POS-01 | Pas d'injection SQL brute | Confirmé | Confirmé | Consensus | POSITIF |
| POS-02 | Pas de secrets dans Git | Confirmé | Confirmé | Consensus | POSITIF |
| POS-03 | Cookies et HMAC | Confirmé | Confirmé | Consensus | POSITIF |
| POS-04 | Contrôle financier de l'export | Confirmé | Confirmé, test 403 | Consensus | POSITIF |

## 2. Corrections mutuelles après vérification

- Claude annonçait HSTS absent. La vérification HTTP sur la production montre un HSTS présent. Seule la CSP manque.
- Claude indiquait que `requireUser` bloquait immédiatement un compte désactivé. C'est vrai pour les pages et server actions, mais pas pour les routes API qui utilisent `getSession()`. Le test confirme qu'un cookie de compte désactivé reste accepté par `/api/terminal/meta`.
- Claude n'a pas relevé les mots de passe par défaut encore actifs ni les vulnérabilités Next.js autres que celles qu'il avait ciblées.
- Claude n'a pas exécuté `npm audit`; DeepSeek l'a exécuté et a trouvé 6 vulnérabilités de production, dont une critique sur Next 15.2.9.
- DeepSeek confirme la présence de `AUTH_SECRET` en production et le rejet d'une session forgée avec le fallback : ce point n'est pas exploitable actuellement.
- Les deux audits convergent sur le risque SSRF de la configuration d'images, mais aucun test n'a prouvé l'accès à une adresse privée : Next renvoie actuellement `INVALID_IMAGE_OPTIMIZE_REQUEST`.

## 3. Décision commune

Les deux audits recommandent de traiter en priorité :

1. les rôles et permissions des server actions utilisateurs ;
2. le contrôle d'accès des routes API ;
3. l'authentification du webhook VAPI ;
4. la rotation des mots de passe par défaut ;
5. la révocation des sessions après désactivation ou changement de rôle ;
6. les mises à jour de dépendances ;
7. la CSP, le rate limiting partagé et la liste blanche d'images.

Aucun de ces correctifs ne nécessite de casser les fonctionnalités métier s'ils sont déployés par phases avec des tests de non-régression. Le plan détaillé est dans `PLAN_CORRECTIF.md`.
