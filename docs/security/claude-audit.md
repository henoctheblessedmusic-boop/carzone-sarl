# Audit de sécurité CARZONE SARL Ops - Claude Code

**Date** : 2026-11-07
**Auditeur** : Claude Code (Sonnet 5), audit en lecture seule
**Perimetre** : `C:\Users\IGOR_GIANI\Desktop\Projet Carzone SARL` (repo complet, branche courante au moment de l'audit)
**Methode** : lecture de code statique (Read/Grep/Glob), inspection des fichiers d'environnement Vercel en local (noms de variables uniquement, aucune valeur affichee), `git log` en lecture seule, verification croisee du schema Prisma, du middleware, des routes API et des server actions. Aucune commande destructive, aucun test d'intrusion actif contre la production, aucune ecriture de donnees, aucun compte cree.

> Convention de masquage : toute valeur sensible potentiellement visible est remplacee par `[SECRET MASQUE]`. Aucun secret reel n'a ete reproduit dans ce document - seuls les **noms** des variables d'environnement presentes en production ont ete releves.

---

## 1. Cartographie des surfaces d'attaque

### 1.1 Authentification / session
- `apps/web/src/lib/auth.ts` : session par cookie HMAC-SHA256 stateless (`carzone_session`), payload `{id, email, fullName, role, customPermissions, iat, exp}` encode en base64url, signe avec `AUTH_SECRET`. Verification en temps constant (`timingSafeEqual`) - bon point.
- `apps/web/src/middleware.ts` : revalidation HMAC independante (Web Crypto) + verification d'expiration, calcule `isAuthenticated`/`userRole`, applique les en-tetes de securite HTTP.
- `apps/web/src/lib/rate-limiter.ts` + table Prisma `LoginAttempt` : verrouillage progressif (1 min -> 5 min -> 10 min -> 1 h -> 24 h) apres 5 echecs, par couple `(email, ip)`.
- `apps/web/src/lib/require-user.ts` : garde de page, relit le role et le flag `active` en base a chaque navigation (protection contre un cookie perime apres desactivation/role change).

### 1.2 Pages protegees / routage
- `apps/web/src/lib/role-service.ts` (`RoleService`) : matrice `ROLE_PERMISSIONS` par role + verifications `isRouteAllowed` (role seul) et `isRouteAllowedForUser` (role + `customPermissions`).
- 3 couches independantes documentees dans la memoire projet (`carzone_rbac_architecture.md`) : middleware (role seul) / garde de page `requireUser([...])` / visibilite menu `AppShell.tsx`. Confirmee toujours vraie a la date de l'audit.
- Pages internes recensees sous `apps/web/src/app/*` : admin, catalog, catalogue-pieces, charge-requests, charging, chat, clients, contrat, delivery-notes, expenses, fleet, garage-supervision, hr, imports, installers, invoices, leads, login, mailbox, opportunities, parts, presentation, quotes, rentals, services, terminal, users, vehicles, workshop + vitrine publique sous `(site)`.

### 1.3 API routes (`route.ts`)
Toutes les routes recensees sous `apps/web/src/app/api/**/route.ts` :

| Route | Auth verifiee dans le code | Controle de role/permission |
|---|---|---|
| `POST /api/auth/login` | n/a (public assume) | rate limiting (email+ip) |
| `POST /api/auth/logout` | n/a | - |
| `GET/POST /api/ai/settings` | `getSession()` | POST seulement : liste de roles `ALLOWED_CONFIG_ROLES` |
| `POST /api/ai/tech-sheet` | `getSession()` | **aucun** |
| `GET/POST /api/calls` | `getSession()` | verifications IDOR par action (participant/privilegie) |
| `GET/POST /api/calls/conference` | `getSession()` | partiel (close = organisateur/privilegie) |
| `GET/POST /api/chat/unread` | `getSession()` | implicite (filtre par `session.id`) |
| `GET/POST /api/notifications` | `getSession()` | implicite (`visibilityFilter`) |
| `POST /api/public/lead` | public (volontaire) | rate limit in-memory |
| `POST /api/public/rental-request` | public (volontaire) | **aucun rate limit** |
| `GET /api/reports/financial-excel` | `getSession()` | **oui** (`financial_report:export`) |
| `GET /api/terminal/meta` | `getSession()` | **aucun** |
| `POST /api/terminal/pay` | `getSession()` | **aucun** |
| `GET/POST /api/vapi/webhook` | secret partage optionnel | **non configure en production (verifie)** |
| `GET /api/workshop/export` | `getSession()` | **aucun** |
| `GET /api/workshop/template` | `getSession()` | **aucun** (mais donnees fictives uniquement) |

### 1.4 Server actions (`actions.ts`)
Recensees sous `apps/web/src/app/**/actions.ts` : catalogue-pieces, chat, clients, delivery-notes, expenses, garage-supervision, hr, invoices, leads, mailbox, parts, quotes, rentals, services, users, vehicles, workshop. Toutes protegees par `requireUser([...roles])`, qui relit le role en base (contrairement au middleware). Les server actions Next.js sont postees sur l'URL de la page d'origine, donc elles restent couvertes par la verification de role du middleware **pour le chemin de page**, en plus de leur propre `requireUser`.

### 1.5 Webhooks / integrations sortantes
- `POST /api/vapi/webhook` : assistant vocal VAPI.ai, function calling (creation de clients/devis/opportunites). Secret partage optionnel via `VAPI_SECRET`/`VAPI_WEBHOOK_SECRET`.
- `lib/openai-tech-sheet.ts` : appels sortants vers `api.deepseek.com`, `api.openai.com`, `ai-gateway.vercel.sh` - URLs **fixes en dur**, pas d'URL utilisateur -> pas de SSRF ici.
- `lib/dgi-emecef.ts` : integration e-MECeF (certification fiscale DGI Benin), `baseUrl` provient de configuration serveur (variables `DGI_EMECEF_*`), pas d'entree utilisateur directe identifiee -> pas de SSRF.
- WhatsApp : generation d'un lien `whatsAppHref(...)` cote client (`lib/site-constants.ts`), pas d'appel serveur sortant.

### 1.6 Base de donnees
- PostgreSQL Neon en production (confirme par la presence des variables `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `PG*`, `POSTGRES_*`, `NEON_PROJECT_ID` dans `apps/web/.vercel/.env.production.local` - noms uniquement, valeurs non lues/non reproduites).
- Acces exclusivement via Prisma Client (`lib/prisma.ts`), aucune requete `$queryRaw`/`$executeRaw` trouvee dans `apps/web/src` (grep verifie, 0 resultat) -> pas d'injection SQL directe identifiee.
- Aucune Row Level Security (RLS) Postgres visible/attendue : toute l'autorisation est applicative (Prisma + `RoleService`), ce qui rend les failles de controle d'acces applicatif (section 2) directement equivalentes a une fuite de donnees en base.

---

## 2. Authentification / autorisation

### [AUTHZ-01] CRITIQUE - Elevation de privileges via l'assignation de role (server actions `users/actions.ts`)
- **Preuve** : `apps/web/src/app/users/actions.ts`, lignes 13-17, 79-99, 253-285.
  ```ts
  const CAN_MANAGE_USERS_ROLES = ["DEVELOPER", "PDG", "SG", "DG", "ADV", "RTA", "DC", "ADMIN", "RH"] as const;
  ...
  export async function updateUserRole(formData: FormData) {
    const currentUser = await requireUser([...CAN_MANAGE_USERS_ROLES]);
    ...
    // Aucune verification sauf si role === "DEVELOPER"
  }
  ```
  La seule protection presente (`createUser` ligne 27, `updateUser` ligne 97, `toggleUserActive` ligne 294, `deleteUser` ligne 326) concerne exclusivement la chaine litterale `"DEVELOPER"`. Aucune de ces fonctions n'empeche l'appelant de s'auto-promouvoir, ni de promouvoir un tiers vers `PDG`, `DG`, `SG` ou `ADMIN` - les 4 roles qui, via `estSuperAdmin()`/`isSuperAdmin` (bypass total dans `require-user.ts`, `auth.ts`, `permissions.ts`), obtiennent un acces quasi total a l'application. `updateUserRole`/`updateUser` n'excluent pas non plus l'auto-modification (contrairement a `deleteUser` qui bloque explicitement `currentUser.id === id`).
- **Scenario d'exploitation** : un compte `RH` (Ressources Humaines, cense etre limite a `users:manage`, `hr:*`, `expenses:*`, `mailbox:*`, `clients:read`) ou `ADV`/`RTA`/`DC` appelle `updateUserRole({id: <son propre id>, role: "PDG"})`. Son compte devient immediatement super-admin (bypass total de toutes les gardes `requireUser` et de `RoleService.hasPermission`).
- **Impact** : compromission totale de l'application par n'importe quel compte ayant acces a `/users` au-dela du strict besoin (5 roles sur 20 recenses dans `roles.ts`), y compris un role metier (RH) qui ne devrait jamais pouvoir toucher a la direction/finance.
- **Recommandation** : restreindre l'assignation des roles `PDG`/`DG`/`SG`/`ADMIN` (en plus de `DEVELOPER`) aux seuls roles deja super-admin ; interdire explicitement la modification de son propre `role` par `updateUser`/`updateUserRole` (meme logique que `deleteUser`) ; envisager un flux de validation a deux personnes pour toute promotion vers un role a privileges eleves.
- **Risque de regression** : faible - la restriction actuelle (DEVELOPER) ne change pas de comportement pour ADV/RTA/DC/ADMIN/RH tant qu'ils n'assignent pas PDG/DG/SG/ADMIN, ce qui n'est a priori jamais un cas d'usage legitime pour ces roles.

### [AUTHZ-02] CRITIQUE - Le controle de role du middleware ne couvre pas les routes `/api/*`
- **Preuve** : `apps/web/src/middleware.ts` ligne 131 appelle `RoleService.isRouteAllowed(userRole, pathname)`. Dans `apps/web/src/lib/role-service.ts`, toutes les branches de `isRouteAllowed`/`isRouteAllowedForUser` testent des prefixes de **pages** (`pathname.startsWith("/workshop")`, `"/quotes"`, `"/charging")`, `"/terminal"`, etc.). Une requete vers `/api/workshop/export` ou `/api/terminal/pay` ne commence PAS par `/workshop` ni `/terminal`, elle commence par `/api/...` : aucune branche ne matche, et la fonction retombe sur le `return true` final (ligne 493 / ligne 610). Resultat : **pour un role donne, le middleware autorise systematiquement tout `/api/*` non explicitement public**, quel que soit le role, tant que l'utilisateur est authentifie.
- **Verification croisee** (conformement a la consigne "verifier chaque constat avant publication") : lecture directe des handlers suivants, qui ne font eux-memes **aucune** verification de role/permission au-dela de `getSession()` :
  - `apps/web/src/app/api/terminal/pay/route.ts` (lignes 9-11) : n'importe quel compte authentifie peut creer une `ChargingSession` + `ChargingInvoice` statut `PAYEE` pour n'importe quel `customerId`.
  - `apps/web/src/app/api/terminal/meta/route.ts` (lignes 5-7) : expose la liste complete des clients actifs (nom, telephone, abonnement, tarif) a n'importe quel compte authentifie, y compris un role sans aucun rapport avec la recharge (ex. `INSTALLATEUR`, `HOTESSE`).
  - `apps/web/src/app/api/workshop/export/route.ts` (lignes 6-14) : export Excel integral de l'historique atelier (`WorkshopEntry.findMany()` sans filtre), sans verifier `workshop:read`.
  - `apps/web/src/app/api/ai/tech-sheet/route.ts` (lignes 7-11, action `confirm` ligne 28) : n'importe quel compte authentifie peut modifier `technicalSheetJson`/photos de n'importe quel vehicule, sans verifier `vehicles:write`.
- **Scenario d'exploitation** : un compte `INSTALLATEUR` (role le plus restreint du systeme, normalement limite a `installers:read`) se connecte normalement, puis appelle directement (fetch/Postman) `GET /api/terminal/meta` ou `GET /api/workshop/export` avec son cookie de session valide : les deux requetes reussissent et renvoient des donnees hors de son perimetre.
- **Impact** : fuite de donnees clients (telephones, tarifs d'abonnement), fraude potentielle sur le terminal de paiement bornes de recharge, export non autorise de donnees atelier, modification non autorisee de fiches vehicules. C'est une faille systemique : chaque nouvelle route `/api/**` ajoutee sans son propre controle de role herite silencieusement de cette absence de protection.
- **Recommandation** : (a) corriger `RoleService.isRouteAllowed`/`isRouteAllowedForUser` pour normaliser le `pathname` avant comparaison (retirer le prefixe `/api` ou ajouter des branches `/api/xxx` miroirs des branches page), de sorte que le middleware redevienne la ligne de defense reelle pour les routes API ; (b) en complement defense-in-depth, ajouter un controle de permission explicite dans chaque `route.ts` sensible (comme deja fait correctement dans `reports/financial-excel/route.ts`) plutot que de ne compter que sur `getSession()`.
- **Risque de regression** : moyen - il faut auditer une a une les routes API existantes pour s'assurer qu'aucun flux legitime actuel ne depend implicitement de cette permissivite (ex. verifier que `/api/calls`, `/api/notifications`, `/api/chat/unread`, qui sont correctement scopees par `session.id` dans leur propre logique, ne seraient pas bloquees par erreur par le nouveau filtre de prefixe).

### [AUTHZ-03] HAUT - Webhook VAPI non authentifie en production (verifie)
- **Preuve** : `apps/web/src/app/api/vapi/webhook/route.ts` lignes 13-24 : la verification du secret partage n'est appliquee que `if (expectedSecret)`. Verification de la configuration reelle de production : `apps/web/.vercel/.env.production.local` ne contient **aucune** variable `VAPI_SECRET` ni `VAPI_WEBHOOK_SECRET` (liste complete des 43 variables presentes verifiee par grep, noms uniquement - aucune valeur lue). Le middleware classe `/api/vapi/webhook` comme chemin public (ligne 34 de `middleware.ts`).
- **Scenario d'exploitation** : requete POST non authentifiee depuis n'importe quelle origine vers `https://<domaine-prod>/api/vapi/webhook` avec `{"message":{"type":"function-call","functionCall":{"name":"create_voice_quote","parameters":{...}}}}` -> creation reelle d'un `Customer` + `Quote` (proforma) en base de production, sans aucune authentification.
- **Impact** : pollution de donnees de production (faux clients/devis), abus de ressources (chaque appel declenche des ecritures Prisma), usurpation possible du canal "assistant vocal" pour injecter des opportunites commerciales fictives. Pas de fuite de donnees existantes (l'endpoint ne fait que creer des entites), mais integrite des donnees commerciales affectee.
- **Recommandation** : definir `VAPI_SECRET` (ou `VAPI_WEBHOOK_SECRET`) dans l'environnement de production Vercel et le configurer cote VAPI.ai, puis idealement rendre la verification obligatoire (retourner 401 si la variable d'environnement est absente, plutot que de desactiver silencieusement le controle).
- **Risque de regression** : faible, a condition de configurer le meme secret des deux cotes avant la mise en application stricte (sinon l'assistant vocal cessera de fonctionner).

### [AUTHZ-04] MOYEN - Derive documentee des gardes de page (confirmee toujours presente)
- **Preuve** : re-verification directe de `role-service.ts` (`isRouteAllowed`/`isRouteAllowedForUser`) face aux gardes `requireUser([...])` de `/catalog`, `/imports`, `/opportunities`, `/leads`, `/quotes` - coherente avec la memoire projet `carzone_rbac_architecture.md` (2026-11-02), toujours vraie a la date de cet audit.
- **Scenario** : un role autorise par le menu/middleware clique sur un lien visible puis se fait rediriger vers `/dashboard` par la garde de page plus stricte.
- **Impact** : experience utilisateur degradee ("lien visible, acces refuse"), **pas** une faille de securite en soi puisque la garde de page est la plus stricte des trois couches et s'applique correctement.
- **Recommandation** : deja identifiee par l'equipe ; aligner les trois couches (middleware / page / menu) sur une source unique de verite.
- **Risque de regression** : faible si traite comme prevu (hors scope de cet audit, remonte pour tracabilite uniquement).

### Points positifs verifies
- Cookie de session : `httpOnly: true`, `sameSite: "lax"`, `secure` en production, verification HMAC en temps constant (`timingSafeEqual`) - bonnes pratiques respectees.
- `requireUser()` relit `active`/`role` en base a chaque navigation -> un compte desactive est bloque immediatement (pas seulement a la prochaine connexion), meme si le cookie reste cryptographiquement valide.
- Verrouillage progressif anti brute-force fonctionnel et teste par lecture de code (`rate-limiter.ts`).
- `/api/calls`, `/api/calls/conference`, `/api/chat/unread`, `/api/notifications` implementent correctement des controles IDOR par `session.id`/participation, malgre l'absence de filtrage de role au niveau middleware (AUTHZ-02) - ces routes precises ne semblent pas exploitables au-dela de leur perimetre normal.
- Pas de CORS permissif trouve (`grep` de `Access-Control-Allow-Origin`/`cors(` : 0 resultat) - les API restent same-origin par defaut.
- `robots.ts` desindexe correctement toutes les routes internes/sensibles.

---

## 3. SSRF

### [SSRF-01] MOYEN (a verifier pour l'exploitabilite complete) - `next.config.ts` autorise l'optimiseur d'image Next.js a aller chercher n'importe quelle URL
- **Preuve** : `apps/web/next.config.ts` lignes 10-20 :
  ```ts
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  ```
  Ceci autorise `/_next/image?url=<n'importe-quelle-url>` a etre proxyee/transformee par la fonction serverless Vercel.
- **Scenario d'exploitation** : si un champ quelconque de l'application (photo vehicule, logo, import CSV/Excel de vehicules, avatar) permet de renseigner une URL externe qui est ensuite rendue via `next/image`, un attaquant authentifie (meme avec un role tres restreint) peut forcer le serveur a emettre des requetes HTTP sortantes vers une cible de son choix (scan de ports internes, SSRF aveugle contre un service tiers, abus de couts de bande passante/transformation d'image).
- **Statut** : **a verifier** - je n'ai pas trouve, dans le temps imparti a cet audit, de formulaire accessible a un role non-admin permettant de definir librement une URL de photo externe (les flux identifies passent par upload/heritage de photos entre vehicules du meme modele, `lib/vehicle-photos.ts`). Le risque existe neanmoins au niveau de la configuration elle-meme, independamment de l'usage actuel : toute evolution future (ex. "coller une URL de photo") deviendrait immediatement exploitable sans etape de revue supplementaire.
- **Recommandation** : remplacer `hostname: "**"` par une liste blanche explicite des domaines de CDN/images reellement utilises (constructeurs, Vercel Blob, etc.).
- **Risque de regression** : moyen - necessite d'identifier tous les domaines d'images legitimement utilises avant de restreindre, sous peine de casser l'affichage de photos existantes.

### Points verifies sans finding
- `lib/openai-tech-sheet.ts` : URLs sortantes (`api.deepseek.com`, `api.openai.com`, `ai-gateway.vercel.sh`) codees en dur, aucune entree utilisateur dans l'URL -> pas de SSRF.
- `lib/dgi-emecef.ts` : `baseUrl` provient de configuration serveur (`DGI_EMECEF_*`), pas d'URL utilisateur.
- Aucun usage de `fetch`/`axios` avec une URL directement construite a partir d'une entree utilisateur n'a ete trouve dans `apps/web/src` (grep de tous les appels `fetch(` revise manuellement - cf. liste section 1.5).

---

## 4. Secrets exposes

### [SECRET-01] MOYEN - Secret de signature de session fallback code en dur
- **Preuve** : `apps/web/src/lib/auth.ts` ligne 23 et `apps/web/src/middleware.ts` ligne 97 :
  ```ts
  const secret = process.env.AUTH_SECRET || "[SECRET DE SECOURS MASQUE]";
  ```
  Chaine identique dupliquee dans les deux fichiers, versionnee dans le depot git.
- **Verification production** : `AUTH_SECRET` **est bien definie** dans `apps/web/.vercel/.env.production.local` (verifie par recherche de la cle, valeur non lue/non reproduite) -> le fallback n'est **pas** utilise en production au moment de l'audit. Le fichier `.env.example` contient en clair un secret de "dev" (`[SECRET DE DEV MASQUE]`), ce qui est normal pour un fichier d'exemple versionne.
- **Impact residuel** : si un environnement de preview/staging Vercel, un futur redeploiement, ou une erreur de configuration faisait sauter la variable `AUTH_SECRET`, l'application degraderait silencieusement vers ce secret public et predictible -> un attaquant lisant le code source (prive aujourd'hui, mais tout depot peut fuiter) pourrait forger une session HMAC valide pour n'importe quel role, y compris `DEVELOPER`.
- **Recommandation** : supprimer le fallback et faire echouer le demarrage (`throw`) si `AUTH_SECRET` est absent, plutot que de retomber sur une valeur predictible. Memes recommandations pour toute cle de secours similaire.
- **Risque de regression** : faible en production (la variable est deja definie) ; verifier neanmoins tous les environnements Preview/Development Vercel avant d'appliquer un `throw` strict, pour ne pas casser les previews qui n'auraient pas la variable configuree.

### [SECRET-02] INFO - Aucun secret trouve dans l'historique Git
- **Verification** : `git log --all --diff-filter=A --name-only -- "*.env*" "**/.env*"` ne retourne aucun fichier -> aucun `.env*` n'a jamais ete ajoute a l'historique. `.gitignore` racine exclut correctement `.env`, `.env*.local`, `.vercel`, `*.db` (SQLite dev).
- **Cles API stockees en base** : `lib/openai-tech-sheet.ts` permet de stocker `OPENAI_API_KEY`/`DEEPSEEK_API_KEY` en clair dans la table `SystemSetting` (fallback si pas de variable d'environnement). `GET /api/ai/settings` ne renvoie que la cle masquee (`sk-xxxxx...xxxx`), ce qui est correct. Recommandation (LOW) : chiffrer la colonne `SystemSetting.value` au repos si elle contient des secrets, ou n'autoriser que la configuration via variables d'environnement.
- **Impact** : aucun a ce jour ; bonne hygiene globale sur la gestion des fichiers d'environnement.

### [SECRET-03] INFO - Mots de passe de seed/documentation
- Le fichier `CLAUDE.md` du projet documente des identifiants de seed (`[MOT DE PASSE DE DEMONSTRATION MASQUE]` pour tous les comptes de demonstration). C'est un usage attendu pour un environnement de developpement/demo, **a condition que** `db:seed`/`db:reset` ne soient jamais executes contre la base de production Neon. Recommandation : ajouter un garde-fou explicite dans `prisma/seed.ts` qui refuse de s'executer si `NODE_ENV === "production"` ou si `DATABASE_URL` pointe vers l'hote de production (a verifier : contenu de `prisma/seed.ts` non entierement audite dans le temps imparti).

---

## 5. Exposition de base de donnees

### [DB-01] MOYEN - Mot de passe par defaut previsible a la creation de compte
- **Preuve** : `apps/web/src/app/users/actions.ts` ligne 22 :
  ```ts
  const password = String(formData.get("password") || "").trim() || "[MOT DE PASSE PAR DEFAUT MASQUE]";
  ```
  Si l'administrateur createur laisse le champ mot de passe vide, le nouveau compte recoit ce mot de passe fixe, sans flag "doit changer son mot de passe a la premiere connexion" visible dans le schema (`User.lastPasswordChange` existe mais rien n'oblige la reinitialisation).
- **Impact** : fenetre de vulnerabilite entre la creation du compte et le premier changement volontaire de mot de passe par l'utilisateur.
- **Recommandation** : generer un mot de passe aleatoire a usage unique + forcer le changement a la premiere connexion, ou envoyer un lien d'activation.
- **Risque de regression** : faible.

### Points verifies sans finding
- Pas de requete Prisma brute (`$queryRaw`/`$executeRaw`) trouvee -> pas d'injection SQL directe identifiee dans le code source audite.
- Pas de messages d'erreur Prisma bruts renvoyes au client observes dans les routes lues (les handlers catchent et renvoient des messages generiques ; `console.error` cote serveur uniquement).
- `GET /api/reports/financial-excel` controle correctement `financial_report:export` et filtre par perimetre (`COMPTA_GARAGE` -> `ACTIVITY.GARAGE` uniquement) avant export massif - bon exemple a repliquer sur les autres routes d'export (cf. AUTHZ-02).
- Pas de Row Level Security Postgres identifiee/attendue (architecture 100% applicative) - a noter comme limite architecturale plutot que faille isolee ; elle amplifie la gravite de AUTHZ-02.

---

## 6. Configuration (en-tetes, CSP, cookies, CORS, rate limiting, uploads)

### [CFG-01] MOYEN - Absence de Content-Security-Policy (HSTS present apres verification live)
- **Preuve** : `apps/web/src/middleware.ts` lignes 159-166 definit `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, mais aucune ligne ne definit `Content-Security-Policy` dans le code applicatif. La verification HTTP live de DeepSeek a toutefois confirme que HSTS est present en production (`max-age=63072000; includeSubDomains; preload`) ; ce point corrige l'hypothese initiale de Claude.
- **Verification live DeepSeek** : HSTS est present en production (`max-age=63072000; includeSubDomains; preload`). Le present audit de code ne l'avait pas observe ; seule la CSP reste manquante.
- **Impact** : absence de defense-in-depth contre l'injection de script (pas de CSP). HSTS est applique par la plateforme et doit etre conserve de facon explicite.
- **Recommandation** : ajouter une CSP (au minimum `default-src 'self'`, avec nonces pour les scripts inline Next.js) et conserver HSTS explicite dans le middleware et la configuration Vercel.
- **Risque de regression** : moyen pour la CSP (necessite de recenser tous les domaines de scripts/styles/images deja utilises, dont `@vercel/analytics`) ; faible pour HSTS.

### [CFG-02] MOYEN - Rate limiting incoherent entre endpoints publics
- `POST /api/public/lead` : rate limite (5 requetes / 10 min / IP) mais via une `Map` en memoire de process -> **inefficace sur Vercel serverless multi-instances** (chaque instance/froid redemarre son propre compteur).
- `POST /api/public/rental-request` : **aucun rate limiting** du tout.
- `POST /api/auth/login` : rate limiting robuste cote base de donnees (bon point), mais l'IP utilisee (`getClientIp` dans `api/auth/login/route.ts`) provient d'en-tetes `x-forwarded-for`/`x-real-ip`/`cf-connecting-ip` potentiellement influencables par le client selon la configuration exacte du edge Vercel - **a verifier** : confirmer que Vercel ecrase bien ces en-tetes au edge avant qu'ils n'atteignent la fonction (comportement standard documente par Vercel, mais non verifiable depuis ce poste sans acces a la configuration du projet Vercel).
- **Recommandation** : utiliser un rate limiter partage (ex. Vercel KV / Upstash Redis) plutot qu'une `Map` en memoire pour les routes publiques ; ajouter un rate limit a `rental-request`.
- **Risque de regression** : faible.

### [CFG-03] BAS - `eslint.ignoreDuringBuilds: true`
- **Preuve** : `apps/web/next.config.ts` ligne 5. Les erreurs ESLint (incluant d'eventuelles regles de securite) ne bloquent jamais le build/deploy de production.
- **Recommandation** : repasser a `false` une fois la dette de lint existante resorbee, ou au minimum activer un job CI separe qui bloque la PR (pas le build Vercel) sur erreurs ESLint.
- **Risque de regression** : moyen a court terme si le code actuel contient deja des erreurs de lint non corrigees (a verifier en executant `npm run lint` localement).

### [CFG-04] MOYEN - Dependance `xlsx@0.18.5` avec vulnerabilites publiques connues, sans correctif disponible sur npm
- **Preuve** : `apps/web/package.json` (`"xlsx": "^0.18.5"`), version resolue confirmee dans `apps/web/package-lock.json` (`"version": "0.18.5"`, ligne 6959). C'est la derniere version du paquet `xlsx` jamais publiee sur le registre npm (SheetJS a ensuite deplace ses correctifs vers son propre CDN, hors du registre npm). Cette version est publiquement documentee comme vulnerable a une Prototype Pollution (GHSA-4r6h-8v6p-xvw6) et a un ReDoS (GHSA-5pgg-2g8v-p4x9).
- **Surface d'attaque confirmee** : `XLSX.read(buffer, ...)` est appele server-side sur des fichiers potentiellement fournis par un utilisateur dans `apps/web/src/app/catalogue-pieces/actions.ts` (ligne 249, import catalogue) et dans `apps/web/src/lib/excel-workshop.ts` (ligne 67, import/export atelier).
- **Scenario d'exploitation** : un compte dispose des droits d'import catalogue/atelier televerse un fichier `.xlsx` concu pour declencher un ReDoS (deni de service sur la fonction serverless) ou tenter une pollution de prototype sur l'instance Node.
- **Recommandation** : migrer vers la distribution officielle SheetJS la plus recente (via le CDN officiel `https://cdn.sheetjs.com/`, hors registre npm) ou vers une bibliotheque alternative maintenue (`exceljs`), et limiter les imports Excel aux roles strictement necessaires.
- **Risque de regression** : moyen - la migration de bibliotheque Excel necessite une verification complete des flux d'import/export (formats, styles, formules).
- **Note** : `npm audit` n'a pas pu etre execute depuis cet environnement (bloque par le controle d'approbation du bac a sable non interactif) ; cette conclusion repose sur la lecture directe de `package-lock.json` et sur des vulnerabilites publiquement documentees pour cette version exacte. Un `npm audit` / `npm audit --omit=dev` complet doit etre lance manuellement par l'equipe pour couvrir le reste de l'arbre de dependances.

### Points positifs verifies
- Cookies : `httpOnly`, `secure` en production, `sameSite: lax` - corrects.
- `robots.ts` desindexe toutes les routes sensibles.
- Next.js epingle en `15.2.9`, version posterieure au correctif du CVE-2025-29927 (bypass d'autorisation du middleware via l'en-tete `x-middleware-subrequest`, corrige en 15.2.3) -> **non vulnerable** a ce CVE specifique (verifie par comparaison de version ; a ne pas confondre avec AUTHZ-02, qui est un bug applicatif distinct dans `role-service.ts`, pas une faille du framework).
- Aucun en-tete CORS permissif trouve.

---

## 7. Ports et services exposes

- **Production** : application Next.js deployee sur Vercel (serverless, pas de port/service expose directement - toute la surface est HTTP(S) via le edge Vercel). Domaine de production non confirme depuis ce poste (a verifier auprès de l'equipe/du dashboard Vercel) ; `VERCEL_URL` est injecte dynamiquement par la plateforme.
- **Base de donnees** : Postgres Neon (serverless), acces exclusivement via `DATABASE_URL`/`POSTGRES_*` (pooled via PgBouncer + connexion directe `_UNPOOLED`/`NON_POOLING` pour les migrations) - pas de port expose publiquement par l'application elle-meme ; la securite reseau de Neon (IP allowlist, SSL force) n'a pas pu etre auditee depuis ce poste (hors perimetre code).
- **Environnement local de developpement** : `npm run dev` (Next.js, port 3000 par defaut), base SQLite locale (`dev.db`, exclue du depot). Aucun service additionnel (websocket dedie, serveur custom) trouve dans le depot - les fonctionnalites "temps reel" (appels, chat, conference) utilisent du polling HTTP classique (`fetch` repete) et non un serveur websocket dedie, confirme par la lecture de `GlobalCallManager.tsx`/`ChatView.tsx` (section 1.3).
- **Pas de endpoint de sante/debug trouve** (`/api/health`, `/api/debug`, etc. absents de la liste exhaustive des `route.ts` recensee en section 1.3).

---

## 8. Tableau recapitulatif des constats

| ID | Severite | Categorie | Preuve (fichier/ligne) | Statut |
|---|---|---|---|---|
| AUTHZ-01 | CRITICAL | Elevation de privileges | `apps/web/src/app/users/actions.ts:13-17,79-99,253-285` | Verifie par lecture de code |
| AUTHZ-02 | CRITICAL | Controle d'acces casse (toutes routes API) | `apps/web/src/middleware.ts:131` + `apps/web/src/lib/role-service.ts` (toutes branches) + 4 routes citees | Verifie par lecture de code |
| AUTHZ-03 | HIGH | Webhook non authentifie | `apps/web/src/app/api/vapi/webhook/route.ts:13-24` + absence confirmee de `VAPI_SECRET`/`VAPI_WEBHOOK_SECRET` en prod | Confirme (config prod verifiee) |
| CFG-04 | HIGH/MEDIUM | Dependance vulnerable | `apps/web/package-lock.json:6959` + usages `XLSX.read` | Verifie (CVE publiques connues, exploitabilite via import non testee activement) |
| SECRET-01 | MEDIUM | Secret fallback code en dur | `apps/web/src/lib/auth.ts:23`, `apps/web/src/middleware.ts:97` | Verifie, non exploitable en prod actuellement (AUTH_SECRET defini) |
| SSRF-01 | MEDIUM | Config SSRF/open-proxy image | `apps/web/next.config.ts:10-20` | Verifie (config) ; exploitabilite via formulaire utilisateur = a verifier |
| CFG-01 | MOYEN | CSP absente ; HSTS present en production | `apps/web/src/middleware.ts:159-166` + verification HTTP | Verifie |
| CFG-02 | MEDIUM | Rate limiting incoherent | `apps/web/src/app/api/public/rental-request/route.ts`, `lead/route.ts`, `auth/login/route.ts` | Verifie par lecture de code |
| DB-01 | MEDIUM | Mot de passe par defaut previsible | `apps/web/src/app/users/actions.ts:22` | Verifie par lecture de code |
| CFG-03 | LOW | Lint non bloquant | `apps/web/next.config.ts:5` | Verifie par lecture de code |
| AUTHZ-04 | MEDIUM (fonctionnel, pas securite) | Derive RBAC documentee | `role-service.ts` vs pages citees | Deja connu, reconfirme |
| SECRET-02 | INFO | Hygiene .env/Git | `git log --all` (0 resultat) | Verifie - point positif |
| SECRET-03 | INFO | Mots de passe de seed | `CLAUDE.md`, `prisma/seed.ts` (garde-fou non confirme) | Partiellement verifie |

---

## 9. Resume executif

### Top 5 risques prioritaires
1. **AUTHZ-01 (CRITIQUE)** - N'importe quel compte ADV/RTA/DC/ADMIN/RH peut s'auto-promouvoir (ou promouvoir un tiers) au rang PDG/DG/SG/ADMIN via `updateUserRole`, sans aucun garde-fou autre que le mot "DEVELOPER". Compromission totale possible par un compte metier mal intentionne ou compromis.
2. **AUTHZ-02 (CRITIQUE)** - Le controle de role du middleware ne s'applique a aucune route `/api/*` (bug de prefixe de chemin). Plusieurs routes (`/api/terminal/pay`, `/api/terminal/meta`, `/api/workshop/export`, `/api/ai/tech-sheet`) n'ont elles-memes aucun controle de permission et sont donc accessibles a n'importe quel compte authentifie, quel que soit son role.
3. **AUTHZ-03 (HAUT, confirme)** - Le webhook `/api/vapi/webhook` est actuellement sans authentification en production (secret non configure) : n'importe qui sur Internet peut creer des clients/devis dans la base de production.
4. **CFG-04 (HAUT/MOYEN)** - La dependance `xlsx@0.18.5` (derniere version npm, non corrigee pour des vulnerabilites publiques) traite des fichiers Excel potentiellement fournis par des utilisateurs dans les flux d'import catalogue/atelier.
5. **SECRET-01 / SSRF-01 (MOYEN)** - Un secret de session de secours code en dur (non utilise en prod actuellement, mais present dans le code) et une configuration d'optimisation d'image Next.js ouverte a n'importe quelle URL (`hostname: "**"`) constituent des primitives latentes qui deviendraient critiques au moindre changement de configuration ou d'usage futur.

### Top 5 correctifs les plus rentables (effort/impact)
1. Ajouter, dans `updateUser`/`updateUserRole`/`createUser` (`apps/web/src/app/users/actions.ts`), la meme protection que pour `DEVELOPER` sur les roles `PDG`/`DG`/`SG`/`ADMIN`, et interdire l'auto-modification de son propre `role`. **Quelques lignes, impact enorme.**
2. Definir `VAPI_SECRET` en production Vercel + le configurer cote VAPI.ai (ou, a defaut, retourner 401 quand le secret n'est pas configure au lieu de laisser passer). **Config uniquement, pas de code.**
3. Ajouter un controle de permission explicite (`RoleService.hasPermission`) dans `/api/terminal/pay`, `/api/terminal/meta`, `/api/workshop/export`, `/api/ai/tech-sheet` - a l'image de ce qui existe deja dans `/api/reports/financial-excel`. **Pattern deja existant dans le code, a repliquer.**
4. Corriger `RoleService.isRouteAllowed`/`isRouteAllowedForUser` pour que les prefixes couvrent aussi `/api/...` (ou normaliser le `pathname` en retirant le prefixe `/api` avant comparaison), restaurant la defense en profondeur du middleware pour toutes les routes API presentes et futures. **Un seul fichier, beneficie a toute future route API.**
5. Supprimer le secret de secours code en dur dans `lib/auth.ts`/`middleware.ts` (faire echouer le demarrage si `AUTH_SECRET` est absent) et restreindre `next.config.ts` `images.remotePatterns` a une liste blanche de domaines. **Durcissement a faible risque de regression, elimine deux primitives latentes.**

---

## 10. Comparaison avec l'audit DeepSeek

La comparaison détaillée se trouve dans `comparaison-claude-deepseek.md`. Points consolidés :

- Consensus CRITIQUE : élévation de privilèges dans `users/actions.ts`, routes API hors contrôle de rôle, webhook VAPI sans secret.
- Consensus HAUT : fuite de données clients/atelier, écritures terminal et fiche technique, dépendance Excel vulnérable.
- DeepSeek ajoute : 2 comptes actifs avec le mot de passe par défaut, session API encore valide après désactivation, vulnérabilités Next.js 15.2.9, CSP et rate limiting.
- Vérification croisée : HSTS est bien présent en production, contrairement à l'hypothèse initiale ; `AUTH_SECRET` est configuré et une session forgée avec le fallback est rejetée ; l'exploitation SSRF des images n'est pas confirmée (400 sur adresses privées), mais la configuration reste trop large.
- Plan commun : `PLAN_CORRECTIF.md`.

---

## 11. Commandes et methode utilisees

```bash
# Cartographie
git log --oneline -10
git log --all --diff-filter=A --name-only --pretty=format: -- "*.env*" "**/.env*"
git remote -v

# Recherche de secrets / patterns sensibles (lecture seule, aucune valeur affichee pour les fichiers .env reels)
# Grep sur : AUTH_SECRET, DATABASE_URL, process.env.*KEY|SECRET|TOKEN|PASSWORD
# Grep sur : $queryRaw/$executeRaw, dangerouslySetInnerHTML, fetch(, Access-Control-Allow-Origin

# Verification des variables d'environnement de production (NOMS uniquement, aucune valeur lue/affichee)
# Grep "^[A-Z_]+=" sur apps/web/.vercel/.env.production.local

# Dependances
# Lecture de apps/web/package.json et apps/web/package-lock.json (version resolue de xlsx, next)
# npm audit : tente, bloque par le controle d'approbation de l'environnement d'execution non interactif -> a executer manuellement :
#   cd apps/web && npm audit --omit=dev
```

**Fichiers cles lus integralement** : `middleware.ts`, `lib/auth.ts`, `lib/require-user.ts`, `lib/role-service.ts`, `lib/rate-limiter.ts`, `lib/permissions.ts`, `lib/prisma.ts`, `next.config.ts`, `lib/openai-tech-sheet.ts`, `lib/vehicle-photos.ts`, `lib/dgi-emecef.ts` (extrait), `app/users/actions.ts`, l'ensemble des `app/api/**/route.ts` (16 fichiers), `.env.example`, `.gitignore`, `robots.ts`, `prisma/schema.prisma` (extraits : `model User`, `model LoginAttempt`).

**Limites de cet audit** : exploration en lecture seule sans execution de l'application ni requete reseau active contre la production ; `npm audit` non execute (bloque par l'environnement) ; contenu exact de `prisma/seed.ts` et de l'integralite des ~17 fichiers `actions.ts` non relu ligne a ligne (seul `users/actions.ts` a ete audite integralement, les autres ont ete verifies par echantillonnage et via la memoire projet existante) ; configuration HSTS/CSP au niveau plateforme Vercel non verifiable depuis ce poste.
