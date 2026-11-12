# Audit et plan de refonte des habilitations - CARZONE SARL Ops

> Document d'audit et de proposition. **Aucune modification de code n'a ete faite.**
> Date : 2026-11-11. Branche auditee : `main` a `71e7333`.
> A valider par le client avant toute implementation.

---

## 1. Perimetre et methode

Perimetre : rôles, capacites, perimetres metier (SHOWROOM / GARAGE / LOCATION) et separation des taches dans `apps/web`.

Methode :

1. Lecture des 6 couches d'autorisation (liste en section 2).
2. Execution des deux scripts d'audit existants (`scripts/audit-navigation.mjs`, `scripts/audit-role-coherence.mjs`).
3. Ecriture d'un script d'audit croise temporaire qui **execute les vrais modules** `RoleService` et `permissions-config` pour les 23 rôles x 28 routes du menu, et compare les trois reponses (middleware / garde de page / menu). Specification en annexe A. Script supprime apres usage, aucun fichier laisse dans le depot.
4. Comptage des comptes reels par rôle en base locale.
5. Confrontation a `docs/CAHIER_EXIGENCES_ROLES_ACCES.md`, qui est l'expression ecrite du besoin client.

Les constats ci-dessous sont tous reproductibles. Chaque constat porte sa preuve (fichier:ligne ou sortie de script).

---

## 2. Architecture actuelle : 6 couches independantes

Il n'existe **aucune source de verite unique**. Un droit est le resultat de 6 decisions prises dans 6 endroits differents, maintenus a la main :

| # | Couche | Emplacement | Entree de decision |
|---|--------|-------------|--------------------|
| 1 | Middleware | `src/middleware.ts` + `RoleService.isRouteAllowed` | **rôle du cookie uniquement** (ignore les capacites) |
| 2 | Garde de page | `requireUser([...])` dans chaque `page.tsx` | tableau de rôles ecrit en dur, par page |
| 3 | Garde d'action | `requireUser([...])` dans chaque `actions.ts` | tableau de rôles ecrit en dur, par fonction |
| 4 | Menu | `navDefs` dans `AppShell.tsx`, croise avec `RoleService.isRouteAllowedForUser` | rôle **et** capacites |
| 5 | Capacites cochables | `DEFAULT_ROLE_CAPABILITIES` + `customPermissions` | rôle et capacites individuelles |
| 6 | Perimetres metier | `lib/permissions.ts` (`peutGererBL`, `activityScopeForRole`, `customerScopeFilterForRole`) + champs `Customer.scopeShowroom/scopeGarage/scopeRental` | rôle, puis activite du document, puis perimetre du client |

Consequence structurelle : **les couches peuvent se contredire sans qu'aucune erreur ne soit levee.** Le resultat visible pour l'utilisateur est soit un menu qui renvoie au tableau de bord, soit un droit reel non decouvrable, soit un bouton qui echoue cote serveur.

Chiffre cle : **7 rôles sur 23 declares portent reellement un compte** en base (`GESTIONNAIRE_LOCATION`, `COMPTA_GARAGE`, `DEVELOPER`, `ASSISTANTE_COMPTABLE`, `STOCK`, `DG`, `COMPTA`). Les 16 autres sont maintenus dans 5 matrices pour rien.

---

## 3. Constats classes par severite

### CRITIQUE

#### C1. Les permissions personnalisees ont deux semantiques contradictoires, et ne retirent aucun droit

`customPermissions` est lu par deux moteurs qui ne l'interpretent pas pareil :

- `permissions-config.ts:325-340` (`getEffectiveCapabilities`) : semantique de **remplacement**. Les capacites cochees remplacent celles du rôle.
- `role-service.ts:343-368` (`userHasPermission`) : semantique **additive**. Si la capacite cochee ne donne pas le droit, le code retombe sur `hasPermission(user.role, ...)`, donc sur les droits par defaut du rôle.

Demonstration executee sur un `COMMERCIAL` auquel la direction ne coche que `customers:view_global` dans l'ecran Permissions personnalisees, dans l'intention de lui retirer les devis :

```
getEffectiveCapabilities                   -> ["customers:view_global"]
userHasCapability(estimates:view_global)   -> false     (ecran, couche 5)
RoleService.userHasPermission(quotes:read) -> true      (menu + API, couche 4)
RoleService.isRouteAllowedForUser(/quotes) -> true
RoleService.isRouteAllowed(/quotes)        -> true      (middleware, couche 1)
```

**Le droit n'est pas retire.** L'ecran de permissions laisse croire a une revocation ; l'acces reste ouvert sur le middleware, le menu et l'API.

Aggravant : si la direction decoche **tout**, `customPermissions` devient un tableau vide, et `getEffectiveCapabilities` interprete le vide comme "pas de personnalisation" et **rend les droits par defaut du rôle** (19 capacites pour un COMMERCIAL). Decocher tout equivaut donc a ne rien decocher.

Impact : la fonctionnalite "Custom Permissions" de l'ecran `/users` est non fiable dans le sens restrictif. Toute habilitation accordee par ce biais n'est pas revocable par ce biais.

#### C2. Un changement de rôle n'invalide pas la session, et le middleware continue d'appliquer l'ancien rôle

`getSession` (`lib/auth.ts:76-98`) relit bien le rôle en base, et invalide la session si `sessionVersion` a change. Mais :

- `sessionVersion` est incremente **uniquement** au changement de mot de passe (`users/actions.ts:189`, `:264`) et a l'activation/desactivation (`:411`).
- `updateUser` (`:131-139`), `updateUserRole` (`:378-384`), `updateUserPermissions` (`:300-305`) et `resetUserPermissions` (`:330-335`) modifient le rôle ou les permissions **sans incrementer `sessionVersion`**.
- Le middleware (`middleware.ts:118-139`) ne peut pas interroger la base : il decode le rôle **depuis le cookie signe**, valable 14 jours (`auth.ts:38`).

Deux symptomes reels :

1. **Promotion.** Un `COMMERCIAL` promu `RTA` : le menu se recalcule avec le rôle en base et affiche `/workshop`, mais le middleware applique encore `COMMERCIAL`, qui n'a pas `workshop:read`, et renvoie au tableau de bord. L'utilisateur voit le lien et ne peut pas y aller, **jusqu'a sa prochaine reconnexion ou pendant 14 jours**. C'est exactement la classe de symptome "menu visible puis acces refuse".
2. **Retrogradation.** Pour les 7 routes ou le middleware est le **seul** filtre de rôle (voir C3 et M7), l'ancien rôle continue de donner acces jusqu'a 14 jours. Exemple : un `COMPTA` retrograde `ATELIER` garde l'acces a `/mailbox` et `/services`.

#### C3. Le repertoire clients complet est ouvert aux 22 rôles, y compris au partenaire externe

- `role-service.ts:446` : `if (pathname.startsWith("/clients")) return true; // Tous les rôles connectes ont acces aux clients`
- `clients/page.tsx:8` : `requireUser()` **sans tableau de rôles**
- `AppShell.tsx:12` : `{ href: "/clients", roles: null }`

Les trois couches sont donc ouvertes. Resultat mesure : `/clients` est accessible a **22 rôles sur 22**, dont `INSTALLATEUR`, decrit dans le referentiel comme "Installateur Partenaire", donc un tiers externe, ainsi que `ATELIER`, `STOCK`, `BORNES_OPS`.

La page charge `prisma.customer.findMany` avec les documents joints et ne filtre que pour `GESTIONNAIRE_LOCATION` (`clients/page.tsx:13-22`). Un partenaire externe connecte accede donc au carnet d'adresses complet, telephones, IFU et pieces justificatives televersees (CIP, IFU).

Note : le cahier client ne prevoit pas d'acces clients pour les rôles techniques, et donne "aucun acces" aux autres modules pour le gestionnaire de location, qui lui est pourtant correctement filtre.

### HAUTE

#### H1. Collision de prefixe `/catalog` et `/catalogue-pieces` : le gestionnaire de stock garage est bloque sur un module qui lui est explicitement attribue

`role-service.ts:430` teste `pathname.startsWith("/catalog")`, ce qui capture aussi `/catalogue-pieces` (catalogue des pieces detachees). Cette route est donc soumise a `vehicles:read`, une permission pensee pour le catalogue de vehicules.

Mesure :

```
isRouteAllowed(STOCK_GARAGE, "/catalogue-pieces")  -> false
isRouteAllowed(COMPTA_GARAGE, "/catalogue-pieces") -> true
```

Or `STOCK_GARAGE` est explicitement autorise par la garde de page (`CATALOG_ROLES` inclut `STOCK_GARAGE`) **et** par le menu (`AppShell.tsx:14`). Le gestionnaire de stock garage, destinataire premier du catalogue de pieces, est le seul a en etre exclu, par un effet de bord de nommage d'URL.

#### H2. `/services` + CHEF_ATELIER : menu visible, middleware refuse

Seul cas detecte ou le menu s'affiche et le middleware bloque. `navDefs` (`AppShell.tsx:23`) inclut `CHEF_ATELIER` ; la page n'a aucun filtre de rôle ; le middleware exige `services:manage`, que `CHEF_ATELIER` n'a pas dans `ROLE_PERMISSIONS`. Clic sur le menu = retour au tableau de bord.

#### H3. `/rentals` + COMMERCIAL : menu visible, garde de page refuse

Regression des commits location recents. `navDefs` (`AppShell.tsx:31`) inclut `COMMERCIAL`, le middleware laisse passer (`fleet:read`), mais `RENTAL_ROLES` (`rentals/page.tsx:20`) vaut `["GESTIONNAIRE_LOCATION","COMPTA","DG","PDG","SG"]` et exclut `COMMERCIAL`. Clic = retour au tableau de bord.

#### H4. Les salaires de base sont visibles hors comptable principale, contre la regle 2 du cahier

Le cahier client, regle 2 : "les donnees de paie et de salaires ne sont visibles que par la comptable principale".

Implementation : `hr/page.tsx:56` definit `canViewPayroll = ["COMPTA","DG","PDG","SG"]` et s'en sert pour ne charger les `SalaryPayment` que pour ces rôles. Correct. Mais :

- `hr/page.tsx:106` serialise les employes avec un spread complet `...e`, donc `baseSalaryXof`, `cnssNumber`, `ifuNumber`, `bankName`, `bankAccountNumber` partent dans la charge utile pour tous les rôles de la page.
- `hr/HRView.tsx:1829-1836` affiche `baseSalaryXof` dans la fiche employe **sans aucun test `canViewPayroll`** (les seuls usages de ce drapeau sont aux lignes 736 et 1426, pour l'onglet Paie).

Or la garde de page `/hr` autorise `RH`, `RF`, `ADMIN`, `ASSISTANTE_COMPTABLE`. Ces quatre rôles voient donc a l'ecran le salaire de base de chaque employe, plus son numero de compte bancaire et son numero CNSS. `ASSISTANTE_COMPTABLE` est nommement exclue de la paie par le cahier.

#### H5. Une meme operation metier donne deux reponses opposees selon le bouton utilise

Transformation d'une proforma :

- `quotes/actions.ts:340-351` (`normalizeInvoice`) autorise `PDG, SG, DG, ASSISTANTE_COMPTABLE, COMPTA, COMPTA_GARAGE`. Conforme au cahier.
- `quotes/actions.ts:664-700` (`transcribeQuote`, modes `BL_INTERNE` et `FACTURE_NORMALISEE`) accepte 14 rôles en garde de page, puis filtre avec `peutGererBL`, qui pour le perimetre SHOWROOM ne rend vrai que pour `COMPTA` et les super-administrateurs (`permissions.ts:60-66`).

Donc `ASSISTANTE_COMPTABLE` peut normaliser une facture par un chemin et se fait refuser par l'autre. Et le cahier accorde "Proforma vers BL interne" a la responsable des ventes (coche verte) et a l'assistante comptable (coche verte) : **ces deux droits ne sont pas implementes**, `peutGererBL` les refuse tous les deux en SHOWROOM.

#### H6. ADV et RF sont omnipotents sur une couche et restreints sur une autre

`role-service.ts:420` : `isRouteAllowed` rend `true` sans condition pour `DEVELOPER, DG, PDG, SG, ADV, RF`. Ces deux rôles portent aussi `admin:all`. Mais le bypass de `requireUser` (`require-user.ts:11-18`) ne couvre que `DEVELOPER, DG, PDG, SG`.

`ADV` et `RF` traversent donc tout le middleware, puis se font refuser par les gardes de page qui ne les listent pas. Ils sont declares tout-puissants au niveau routage et traites comme des rôles ordinaires au niveau page. Toute decision future prise sur la base de `admin:all` pour ces rôles sera fausse.

### MOYENNE

| Ref | Constat | Preuve |
|-----|---------|--------|
| M1 | 16 rôles sur 23 n'ont aucun compte mais sont maintenus dans 5 matrices (`ROLE_PERMISSIONS`, `DEFAULT_ROLE_CAPABILITIES`, `navDefs`, gardes de pages, gardes d'actions). Cout de maintenance pur. | comptage base locale |
| M2 | 9 cas "droit accorde mais menu cache", donc acces non decouvrable : `ADMIN` sur `/catalogue-pieces`, `/delivery-notes`, `/imports` ; `COMPTA_GARAGE` sur `/catalogue-pieces`, `/mailbox` ; `ASSISTANTE_COMPTABLE` sur `/audit` ; `RH`, `RTA`, `DC` sur `/mailbox`. | annexe A, famille C |
| M3 | `ADMIN` sur `/delivery-notes` : triple divergence. La page l'autorise, `isRouteAllowedForUser` l'exclut donc le menu le cache, et `peutGererBL` lui refuse **toutes** les actions. Il atteint la page par URL directe et tous les boutons echouent. | `delivery-notes/page.tsx:8`, `role-service.ts:588`, `permissions.ts:60-66` |
| M4 | `parts/actions.ts` : `createPartOrder` et `updatePartOrderStatus` excluent `COMPTA_GARAGE` que la page autorise. Detecte par le script maison du projet, jamais corrige. | `node scripts/audit-role-coherence.mjs` : ECHEC, 2 incoherences |
| M5 | La liste des super-administrateurs est reecrite a l'identique dans une dizaine d'endroits (`permissions.ts:11`, `user-role-guards.ts:5`, `require-user.ts:11`, `auth.ts:104`, `role-service.ts:336/345/385/420`, `permissions-config.ts:333/350`, `AppShell.tsx:54`). Toute evolution exige 10 modifications coherentes. | grep |
| M6 | `RTA`, `DC` et `RH` peuvent creer des comptes et attribuer les rôles non proteges, dont `RTA`, `DC` et `RH` eux-memes. Un responsable technique atelier peut donc fabriquer des comptes dotes du pouvoir d'administration des comptes. | `users/actions.ts:21`, `user-role-guards.ts:16-23` |
| M7 | `/terminal` n'a **aucune** garde de page (middleware seul, 8 rôles). `/mobile-app` est inaccessible au `GESTIONNAIRE_LOCATION` alors que le menu est declare pour tous, donc cette personne ne peut pas installer l'application pro. `/api/mobile/apk` ne verifie aucun rôle. | annexe A, famille D ; `api/mobile/apk/route.ts:12` |
| M8 | `docs/ROLE_PERMISSIONS_MATRIX.md` est perimee : zero occurrence de `GESTIONNAIRE_LOCATION`, `STOCK_GARAGE` et `scopeRental`, qui sont pourtant en production. La doc de reference induit en erreur. | grep |
| M9 | L'autorisation du `GESTIONNAIRE_LOCATION` est une liste de prefixes d'URL ecrite en dur, **dupliquee a l'identique** dans `isRouteAllowed` et `isRouteAllowedForUser`, et elle inclut `/contrat` qui est une route **publique de la vitrine**, pas une route interne. | `role-service.ts:424-440` et `:500-516`, `middleware.ts:30` |

---

## 4. Ecart avec le cahier d'exigences client

`docs/CAHIER_EXIGENCES_ROLES_ACCES.md` decrit **4 rôles metier**. L'application en declare **23**. Aucune table de correspondance n'existe entre les deux. C'est la cause racine de la derive : les developpements se font sur les 23 rôles techniques, les validations client se font sur les 4 rôles metier.

Correspondance la plus probable, **a confirmer par le client** :

| Rôle du cahier | Rôle(s) applicatif(s) candidat(s) | Ambiguite |
|---|---|---|
| Comptable principale, DRH, superviseure | `COMPTA` | claire |
| Assistante comptable | `ASSISTANTE_COMPTABLE` | claire |
| Responsable des ventes | `ADV` ? `COMMERCIAL` ? `DC` ? | **non tranchee** : trois rôles se partagent aujourd'hui ces droits de facon incoherente |
| Gestionnaire de la location | `GESTIONNAIRE_LOCATION` | claire |

Exigences du cahier non satisfaites a ce jour :

1. Regle 1, separation des taches : respectee sur `normalizeInvoice`, incoherente sur `transcribeQuote` (voir H5).
2. Regle 2, confidentialite de la paie : **non respectee** (voir H4).
3. "Proforma vers BL interne" pour la responsable des ventes et l'assistante comptable : **non implemente** (voir H5).
4. Point 7, validation des depenses superieures ou egales a 50 000 FCFA : **non implemente** (aucune occurrence de seuil ni de circuit de validation dans `src/app/expenses/`).
5. Point 6, facture d'avoir avec reference a la facture annulee, reservee a la comptable principale : **non implemente** (seul `voidInvoice` existe, pas de modele de note de credit).
6. Recommandation technique "RBAC applique cote serveur sur chaque route et chaque action" : partiellement, 7 routes du menu n'ont aucun filtre de rôle en page.
7. "Une meme personne doit pouvoir cumuler plusieurs rôles" : **impossible aujourd'hui**, le modele `User` porte un seul champ `role` scalaire. Le cumul est simule en gonflant les droits d'un rôle unique (`COMPTA` = comptabilite + RAF + RH), ce qui est precisement ce qui rend les matrices illisibles.

---

## 5. Plan de refonte propose

Principe directeur : **une seule donnee d'autorisation, plusieurs points d'application.** On conserve la defense en profondeur (middleware, page, action) car le cahier l'exige, mais les trois points lisent la meme declaration au lieu de la reecrire.

### Phase 0 - Filet de securite (prealable non negociable)

- Produire un instantane de la matrice actuelle 23 rôles x 28 routes x 3 couches, comme test de caracterisation. Objectif : pouvoir prouver, apres refonte, que **seuls les changements decides** ont eu lieu.
- Industrialiser le script d'audit croise de l'annexe A en `scripts/audit-rbac-crosslayer.ts` et le brancher en CI a cote de `audit-navigation.mjs` et `audit-role-coherence.mjs`.
- Corriger les 2 incoherences deja signalees par `audit-role-coherence.mjs` (M4) et rendre ce script bloquant.
- Risque si on saute cette phase : une refonte de 23 rôles sans filet produit des regressions invisibles jusqu'au prochain appel du client.

### Phase 1 - Corriger les anomalies de securite sans toucher a l'architecture

Ces correctifs sont independants de la refonte et peuvent partir immediatement :

1. C3 : fermer `/clients`. Definir la liste des rôles autorises, exclure `INSTALLATEUR` et les rôles techniques, et ajouter un filtre de perimetre par rôle comme cela existe deja pour `GESTIONNAIRE_LOCATION`.
2. C2 : incrementer `sessionVersion` dans `updateUser`, `updateUserRole`, `updateUserPermissions` et `resetUserPermissions`. Effet de bord assume : tout changement de rôle deconnecte l'utilisateur concerne, ce qui est le comportement attendu et supprime d'un coup toute la classe de bugs "menu visible puis refus" liee au cookie perime.
3. H4 : retirer `baseSalaryXof`, `cnssNumber`, `bankName`, `bankAccountNumber` de la charge utile quand `canViewPayroll` est faux, et conditionner l'affichage de la fiche.
4. H1 : rendre les tests de route exacts au lieu de `startsWith` brut, ou renommer la route pour supprimer la collision.
5. H2, H3 : trancher si `CHEF_ATELIER` a droit aux prestations et si `COMMERCIAL` a droit a la location, puis aligner les trois couches dans le meme commit.
6. M7 : garde de page sur `/terminal`, decision sur `/mobile-app` pour le gestionnaire de location, controle de rôle sur `/api/mobile/apk`.

### Phase 2 - Trancher la semantique des permissions personnalisees (C1)

Deux options, a arbitrer par le client :

- **Option A, recommandee : remplacement partout.** Les capacites cochees remplacent integralement celles du rôle. `RoleService.userHasPermission` cesse de retomber sur le rôle. Un tableau vide signifie explicitement "aucune capacite" et non "capacites par defaut" (on distingue `null` de `[]`). C'est le comportement que l'ecran laisse deja croire, donc le moins surprenant pour la direction.
- Option B : additif uniquement, et on retire de l'ecran toute possibilite de decocher, pour ne plus promettre une revocation qui n'a pas lieu.

Dans les deux cas : faire lire les capacites par le middleware, ou renoncer a filtrer les routes dans le middleware. Aujourd'hui le middleware est aveugle aux capacites, ce qui rend toute personnalisation partiellement inoperante au niveau routage.

### Phase 3 - Modele cible : capacites declaratives et rôles composables

1. **Un fichier de politique unique** : `src/lib/access-policy.ts`, declarant pour chaque route et chaque action metier la capacite requise, et pour chaque rôle la liste de capacites. Le middleware, `requireUser`, `navDefs` et les gardes d'actions en sont **derives**, plus recopies.
2. **Rôles composables** pour satisfaire l'exigence de cumul : passer de `User.role` scalaire a une table de liaison `UserRole`, ou introduire un champ `additionalRoles`. Cela supprime la raison d'etre des rôles fourre-tout comme `COMPTA` = comptabilite + RAF + RH.
3. **Reduction du referentiel** : 23 rôles vers les 4 rôles metier du cahier, plus les rôles techniques reellement utilises, plus `DEVELOPER`. Chaque rôle supprime doit avoir une cible de migration explicite, meme si aucun compte ne le porte, car il peut etre reference dans des donnees historiques ou dans le journal d'audit.
4. **Perimetres en dimension explicite** : aujourd'hui `quoteScopeForRole` code en dur "COMPTA_GARAGE vaut GARAGE, tout le monde vaut SHOWROOM". Avec l'arrivee de la location, ce modele a deux valeurs ne tient plus. Proposer un perimetre porte par l'affectation de l'utilisateur et non deduit de son rôle.

### Phase 4 - Alignement sur les regles metier du cahier

Dans l'ordre des dependances :

1. Trancher la correspondance "Responsable des ventes" (section 4).
2. Implementer "Proforma vers BL interne" pour la responsable des ventes et l'assistante comptable, en elargissant `peutGererBL` plutot qu'en contournant la garde (H5).
3. Unifier `transcribeQuote` et `normalizeInvoice` derriere une seule regle de separation des taches.
4. Seuil de validation des depenses a 50 000 FCFA.
5. Facture d'avoir referencant la facture normalisee annulee, reservee a la comptable principale.

Les points 4 et 5 depassent le perimetre strict des habilitations et meritent un chiffrage distinct.

### Phase 5 - Gouvernance

- `docs/ROLE_PERMISSIONS_MATRIX.md` **genere** depuis `access-policy.ts` et non plus ecrit a la main, pour qu'il ne puisse plus deriver (M8).
- Regle de revue : toute evolution d'habilitation passe par le fichier de politique, jamais par un tableau de rôles local.
- M6 : decider si `RTA`, `DC` et `RH` doivent conserver le droit de creer des comptes.

### Sequencement propose

| Phase | Nature | Dependance | Risque |
|---|---|---|---|
| 0 | Outillage et filet | aucune | faible |
| 1 | Correctifs de securite | 0 | faible, perimetre chirurgical |
| 2 | Arbitrage semantique | 1 | moyen, change un comportement visible |
| 3 | Refonte du modele | 0, 2 | eleve, touche le schema de donnees |
| 4 | Regles metier | 3 | moyen |
| 5 | Gouvernance | 3 | faible |

Les phases 0 et 1 sont livrables sans aucune decision client en dehors des arbitrages H2 et H3. Les phases 2 a 5 exigent les arbitrages de la section 6.

---

## 6. Decisions a valider par le client

Bloquantes pour les phases 2 et suivantes :

1. **Correspondance "Responsable des ventes"** : quel rôle applicatif porte ce metier ? `ADV`, `COMMERCIAL` ou `DC` ? Aujourd'hui les trois se partagent ces droits de facon incoherente.
2. **Permissions personnalisees** : option A (remplacement, revocation reelle) ou option B (additif, on retire la promesse de revocation) ?
3. **Cumul de rôles** : faut-il le vrai cumul (table de liaison, exigence explicite du cahier) ou conserve-t-on des rôles fourre-tout ?
4. **Referentiel cible** : confirme-t-on la suppression des 16 rôles sans compte ? Lesquels sont prevus pour un recrutement a venir et doivent etre conserves ?
5. **`CHEF_ATELIER` et les prestations** (`/services`) : droit accorde ou retire ? Le menu dit oui, le middleware dit non.
6. **`COMMERCIAL` et la location** (`/rentals`) : droit accorde ou retire ? Le menu dit oui, la page dit non.
7. **`ADV` et `RF`** : vrais super-administrateurs comme le middleware le suppose, ou rôles ordinaires comme les gardes de page le supposent ?
8. **`RTA`, `DC`, `RH` et la creation de comptes** : maintenue ?
9. **Acces clients des rôles techniques** (`ATELIER`, `STOCK`, `BORNES_OPS`) et du partenaire `INSTALLATEUR` : perimetre souhaite ?
10. **Perimetre LOCATION** : le gestionnaire de location doit-il acceder a l'application mobile pro ?

---

## 7. Ce qui n'a pas ete fait

- Aucune modification de code, de schema, de migration ou de donnee. L'arbre de travail est inchange (seules les 4 entrees non suivies preexistantes subsistent).
- Pas d'audit des routes hors menu (sous-pages d'impression, fiches techniques). L'audit croise porte sur les 28 routes du menu. Les sous-pages d'impression de documents ont ete lues ponctuellement mais pas couvertes systematiquement.
- Pas d'audit de la vitrine publique ni des endpoints `/api/public/*` (formulaires de prospect et de demande de location), hors perimetre habilitations.
- Pas de test dynamique avec de vrais comptes connectes. Tous les constats proviennent de l'execution des modules d'autorisation et de la lecture du code, pas d'un parcours navigateur. Une recette sur comptes reels reste a prevoir en fin de phase 1.

---

## Annexe A - Specification du script d'audit croise

Script temporaire, execute puis supprime. A reintroduire en phase 0 sous `scripts/audit-rbac-crosslayer.ts`.

Il reconstruit, pour chaque route du menu et chaque rôle declare, les trois reponses des couches 1, 2 et 4, en important les modules reels, et classe les divergences en quatre familles :

- **A** : menu visible mais acces bloque (symptome utilisateur direct)
- **B** : page autorisee mais middleware bloquant
- **C** : middleware et page ouverts mais menu cache (droit non decouvrable)
- **D** : routes sans filtre de rôle en page, ou le middleware est le seul garde-fou

Entrees lues : `src/lib/roles.ts`, `src/lib/role-service.ts`, `src/lib/permissions-config.ts`, `src/components/AppShell.tsx` (bloc `navDefs`), et les `requireUser([...])` de chaque `page.tsx` avec resolution des constantes de type `[...RENTAL_ROLES]`.

Point d'attention pour la reimplementation : la resolution des tableaux de rôles doit gerer les constantes locales declarees avec `as const` et les spreads, sinon le script conclut a tort qu'une page n'a aucun filtre de rôle.

Resultats obtenus au 2026-11-11 : **2 cas en famille A, 16 en famille B, 9 en famille C, 7 routes en famille D.**
