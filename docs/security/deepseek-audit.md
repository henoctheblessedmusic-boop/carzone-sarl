# Audit de sécurité CARZONE SARL Ops - DeepSeek

Date : 2026-11-07
Périmètre : application Next.js 15, API routes, server actions, middleware, sessions, Prisma/Neon, configuration Vercel, dépendances.
Mode : lecture de code, tests HTTP en lecture seule, vérification de configuration et de dépendances. Aucun test destructif, aucune écriture métier, aucun brute force.
Comparaison : voir `comparaison-claude-deepseek.md` et le rapport indépendant `claude-audit.md`.

## 1. Synthèse exécutive

L'application possède de bonnes bases : mots de passe bcrypt, cookies HttpOnly et Secure en production, vérification HMAC en temps constant, rate limiting de connexion en base, absence d'injection SQL brute, absence de secrets versionnés et en-têtes X-Frame-Options, X-Content-Type-Options, Referrer-Policy et Permissions-Policy.

Les risques majeurs sont toutefois concentrés sur l'autorisation et la configuration :

1. **Élévation de privilèges par les actions utilisateurs** : des rôles intermédiaires peuvent attribuer des rôles super-admin.
2. **Absence de contrôle de rôle sur les routes API** : plusieurs API sensibles ne vérifient que la session, pas la permission.
3. **Webhook VAPI public** : le secret n'est pas configuré en production, alors que l'endpoint peut créer des clients et des devis.
4. **Mots de passe par défaut encore actifs** : deux comptes actifs, dont un DG, utilisent le mot de passe de démonstration connu.
5. **Sessions non révoquées côté API** : un compte désactivé conserve l'accès aux routes API jusqu'à expiration du cookie.
6. **Dépendances vulnérables**, notamment Next.js 15.2.9 et xlsx 0.18.5.

## 2. Constats vérifiés

### SEC-01 - CRITIQUE - Élévation de privilèges dans les actions utilisateurs

Preuves :
- `apps/web/src/app/users/actions.ts:13` : `CAN_MANAGE_USERS_ROLES` inclut ADV, RTA, DC, ADMIN et RH.
- `createUser` ne bloque que le rôle `DEVELOPER`.
- `updateUser` ne bloque que la cible ou le rôle `DEVELOPER`.
- `updateUserRole` n'a aucun garde-fou sur les rôles PDG, DG, SG, ADMIN et n'interdit pas l'auto-modification.
- `updateUserPermissions` accepte une liste arbitraire de permissions sans vérifier le rôle cible.

Scénario : un compte ADV, RH, RTA, DC ou ADMIN peut appeler `updateUserRole` avec son propre identifiant et le rôle PDG, DG, SG ou ADMIN. Il devient super-admin, avec bypass des gardes `requireUser` et des permissions.

Impact : compromission totale de l'application, accès aux clients, finances, RH, exports et données de stock.

Statut : vérifié par lecture de code. Test d'exploitation non réalisé pour ne pas modifier la production.

### SEC-02 - CRITIQUE - Les routes API échappent au contrôle de rôle du middleware

Preuves :
- `middleware.ts:131` appelle `RoleService.isRouteAllowed(role, pathname)`.
- `role-service.ts` vérifie des préfixes de pages (`/workshop`, `/terminal`, `/quotes`, etc.), jamais `/api/...`.
- En l'absence de branche correspondante, la fonction retourne `true` pour un utilisateur authentifié.
- Les handlers sensibles suivants ne vérifient que `getSession()` :
  - `api/terminal/meta/route.ts`
  - `api/terminal/pay/route.ts`
  - `api/workshop/export/route.ts`
  - `api/ai/tech-sheet/route.ts`

Vérification effectuée avec un compte temporaire COMMERCIAL :
- `GET /api/terminal/meta` : HTTP 200, liste de clients et téléphones.
- `GET /api/workshop/export` : HTTP 200, export Excel de l'historique atelier.
- `GET /api/reports/financial-excel` : HTTP 403, contrôle correct, bon exemple.
- Compte supprimé après le test.

Impact : fuite de données clients, export atelier non autorisé, création de factures de recharge et modification de fiches véhicules par n'importe quel compte connecté.

### SEC-03 - CRITIQUE - Webhook VAPI non authentifié en production

Preuves :
- `api/vapi/webhook/route.ts:13-24` : contrôle uniquement si `VAPI_SECRET` ou `VAPI_WEBHOOK_SECRET` est défini.
- Le chemin est public dans `middleware.ts:34`.
- Aucune variable VAPI_SECRET n'est présente dans la configuration de production vérifiée par Claude.
- Test HTTP passif : `POST /api/vapi/webhook` avec un message de statut sans paramètre métier retourne HTTP 200 sans secret.

Impact : création non authentifiée de clients, devis/proformas et opportunités dans la base de production ; pollution commerciale et coût d'écriture.

Statut : vérifié. Aucun test de création réelle n'a été effectué.

### SEC-04 - CRITIQUE - Mots de passe par défaut encore actifs

Preuve :
- `prisma/seed.ts` utilise `[MOT DE PASSE DE DEMONSTRATION MASQUE]`.
- Vérification bcrypt sur les comptes actifs : 2 comptes actifs utilisent encore ce mot de passe, dont 1 DG et 1 COMMERCIAL.
- Le mot de passe est documenté dans les fichiers de passation du projet.

Impact : prise de contrôle directe d'un compte de direction avec un identifiant public.

Recommandation immédiate : rotation forcée des comptes concernés, invalidation des sessions, suppression des mots de passe par défaut du seed de production.

### SEC-05 - HAUT - Session non révoquée après désactivation ou changement de rôle côté API

Preuves :
- `requireUser` relit la base pour les pages et les server actions, ce qui protège ces chemins.
- Les routes API utilisent `getSession()`, qui ne consulte que le cookie HMAC et son payload.
- Test effectué avec un compte temporaire COMMERCIAL : connexion, désactivation en base, puis `GET /api/terminal/meta` avec le cookie existant : HTTP 200.
- Le cookie reste valide jusqu'à 14 jours.

Impact : un employé désactivé, un compte compromis ou un rôle rétrogradé conserve l'accès API jusqu'à expiration du cookie.

### SEC-06 - HAUT - Données clients et atelier accessibles à des rôles non concernés

Preuves :
- `api/terminal/meta` retourne les clients actifs, noms, téléphones, abonnements et tarifs.
- `api/workshop/export` retourne tout l'historique atelier.
- Aucun contrôle `hasPermission` dans ces routes.
- Test COMMERCIAL confirmé : 200 et données non filtrées.

Impact : fuite de données personnelles et d'historique d'interventions ; non-conformité potentielle avec la protection des données.

### SEC-07 - HAUT - Écritures métier exposées à tout compte authentifié

Preuves :
- `api/terminal/pay` crée une session de recharge et une facture au statut PAYEE sans contrôle de rôle.
- `api/ai/tech-sheet` modifie la fiche technique, les photos et le statut de confirmation de n'importe quel véhicule avec un simple identifiant.
- Aucune validation d'appartenance ou de permission véhicule.

Impact : fraude de facturation, altération de fiches véhicules, IDOR.

### SEC-08 - CRITIQUE - Dépendances vulnérables

`npm audit --omit=dev` :

| Paquet | Sévérité | Problème | Correctif |
|---|---|---|---|
| next 15.2.9 | Critique | Multiples avis, dont cache key confusion, injection, SSRF et RCE dans l'optimiseur d'images | Passer à une version 15.x corrigée, au minimum 15.5.29, puis tester |
| xlsx 0.18.5 | Haute | Prototype pollution et ReDoS | Remplacer par une distribution maintenue ou isoler l'import |
| zod < 4.6.6 | Haute | Épuisement mémoire | Mettre à jour zod |
| sharp | Haute | Vulnérabilités libvips/libheif | Suivre la version Next corrigée |
| postcss | Haute | XSS et lecture de fichiers via source maps | Suivre la version Next corrigée |
| source-map-js | Haute | Déni de service | Mettre à jour |

Statut : `npm audit` exécuté localement, résultat confirmé.

### SEC-09 - MOYEN - Configuration d'images Next ouverte à tous les hôtes

Preuve : `next.config.ts` autorise `http://**` et `https://**` pour `remotePatterns`.

Risque : SSRF ou proxy d'images si une URL de photo contrôlée par un utilisateur est rendue par `next/image`. Un test direct avec `127.0.0.1` et `169.254.169.254` retourne actuellement `INVALID_IMAGE_OPTIMIZE_REQUEST`, donc l'exploitation n'est **pas confirmée** ; la configuration reste trop large et doit être restreinte.

### SEC-10 - MOYEN - Fallback de secret de session codé en dur

Preuve : `auth.ts:23` et `middleware.ts:97` utilisent une valeur de secours si `AUTH_SECRET` manque.

Vérification : `AUTH_SECRET` est défini en production ; une session forgée avec le fallback a été rejetée (redirection 307). Le fallback n'est donc pas exploitable aujourd'hui, mais deviendrait critique sur un environnement preview mal configuré.

### SEC-11 - MOYEN - En-têtes de sécurité incomplets et CSP absente

Vérification HTTP en production :
- HSTS : présent (`max-age=63072000; includeSubDomains; preload`).
- X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy : présents.
- Content-Security-Policy : absente.

Claude indiquait HSTS absent ; la vérification live corrige ce point. La CSP reste à ajouter, de préférence en mode report-only d'abord.

### SEC-12 - MOYEN - Rate limiting incomplet et IP potentiellement influençable

- `/api/public/lead` : rate limit en mémoire seulement, non partagé entre instances Vercel.
- `/api/public/rental-request` : aucun rate limit.
- `/api/auth/login` : rate limiting en base, mais `getClientIp` lit `x-forwarded-for` en premier ; le comportement exact du edge Vercel doit être confirmé.

### SEC-13 - MOYEN - Mot de passe par défaut à la création de compte

`users/actions.ts:22` attribue `"[MOT DE PASSE PAR DEFAUT MASQUE]"` si le champ mot de passe est vide. Aucun changement forcé à la première connexion n'est prévu.

### SEC-14 - MOYEN - Upload de documents sans limite serveur

`uploadCustomerDocument` accepte `fileUrl`, `fileName`, `mimeType` et `fileSize` fournis par le client. Le fichier est stocké en data URL dans la base, sans limite de taille ni validation MIME côté serveur. Risque de gonflement de la base et de stockage de contenus non maîtrisés.

### SEC-15 - BAS - Énumération de comptes à la connexion

L'API de connexion distingue compte inactif, identifiants invalides et compte verrouillé. Un attaquant peut énumérer des emails actifs/inactifs, malgré le rate limiting.

### SEC-16 - BAS - Ports et surface réseau

Vérifications :
- Production : seuls 80 et 443 répondent ; l'application est sur Vercel, sans port applicatif propre.
- Aucun endpoint de santé/debug ou WebSocket dédié trouvé.
- Aucun secret trouvé dans le bundle client `.next/static`.
- Aucun fichier `.env` suivi par Git.

## 3. Points positifs confirmés

- Aucune requête SQL brute (`$queryRaw` / `$executeRaw`) trouvée : Prisma paramétré.
- Aucun secret dans l'historique Git des fichiers `.env`.
- Cookies HttpOnly, Secure en production, SameSite Lax.
- Vérification HMAC en temps constant.
- Rate limiting de connexion persistant en base.
- `reports/financial-excel` vérifie correctement `financial_report:export`.
- `api/calls`, `api/notifications` et `api/chat/unread` appliquent des filtres par utilisateur.
- HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy et Permissions-Policy présents.
- Pas de CORS permissif détecté.

## 4. Priorités de correction

Voir `PLAN_CORRECTIF.md` pour les phases, les tests de non-régression et les critères d'acceptation.
