# Revue indépendante des correctifs Phase 1 - Claude

Date : 2026-11-07
Auteur : Claude Code (revue indépendante, sans modification de code)
Périmètre revu : les 9 fichiers livrés pour la Phase 1 du plan de remédiation
(`docs/security/PLAN_CORRECTIF.md`, section "Phase 1 - Autorisations critiques") :

- `apps/web/src/lib/user-role-guards.ts` (nouveau)
- `apps/web/src/lib/api-auth.ts` (nouveau)
- `apps/web/src/app/users/actions.ts`
- `apps/web/src/app/users/UsersView.tsx`
- `apps/web/src/app/api/terminal/meta/route.ts`
- `apps/web/src/app/api/terminal/pay/route.ts`
- `apps/web/src/app/api/workshop/export/route.ts`
- `apps/web/src/app/api/ai/tech-sheet/route.ts`
- `apps/web/src/app/api/reports/financial-excel/route.ts`

Méthode : lecture complète des 9 fichiers, lecture du diff Git réel (`git diff`)
pour isoler ce que ce lot change par rapport à l'état précédent, lecture des
fichiers transverses nécessaires (`roles.ts`, `permissions-config.ts`,
`role-service.ts`, `require-user.ts`, `auth.ts`, `UsersView.tsx` complet,
`page.tsx` de `/users`). Aucune modification de code n'a été apportée. Aucun
test destructif ni accès à la base de production.

**Limite d'environnement** : l'exécution de `npx tsc --noEmit` et de
`npm run build` a été bloquée par le bac à sable de cet agent (message système
"This unattended Claude Code subagent cannot request human approval"), y
compris pour `tsc --version` seul. La vérification de typage ci-dessous est
donc une relecture manuelle du code (signatures, imports, assertions de type)
et ne remplace pas une exécution réelle de ces commandes avant déploiement.

## 1. Constat global

Le lot corrige correctement les vulnérabilités CRITIQUES listées dans
`comparaison-claude-deepseek.md` sous SEC-02, SEC-06 et SEC-07 : les 5 routes
API (`terminal/meta`, `terminal/pay`, `workshop/export`, `ai/tech-sheet`,
`reports/financial-excel`) exigeaient auparavant seulement une session valide,
sans aucun contrôle de permission ; elles exigent maintenant une permission
explicite via `getApiUser()` + `hasApiPermission()` / `RoleService.hasPermission()`.
`getApiUser()` relit en base l'état `active` et `role` à chaque appel, ce qui
corrige aussi SEC-05 (session non révoquée après désactivation) pour ces 5
routes précises.

Cependant, la revue a identifié une régression CRITIQUE dans
`apps/web/src/app/users/actions.ts` qui permet de recréer, via la fonction
générale `updateUser`, exactement le contournement de permissions que la
Phase 1 est censée interdire ("Interdire l'auto-attribution de permissions
supplémentaires"). Cette régression touche directement deux des cinq routes
API qui viennent d'être durcies dans ce même lot.

## 2. Tableau des constats

| ID | Sévérité | Constat | Preuve | Correction recommandée | Risque de régression |
|---|---|---|---|---|---|
| REV-01 | CRITIQUE | `assertCanAssignPermissions()` (défini dans `user-role-guards.ts`) n'est appelé nulle part. `updateUser()` écrit `customPermissions` directement depuis le `FormData` client sans aucune validation de portée, et sans bloquer l'auto-attribution quand le rôle ne change pas. Un acteur RH/ADV/RTA/DC/ADMIN (tous dans `CAN_MANAGE_USERS_ROLES`, aucun n'est super-admin) peut s'auto-attribuer ou attribuer à un pair non protégé des capacités hors de son périmètre (ex. `stock:create`, `workshop:view_global`), ce qui se traduit par les permissions applicatives `vehicles:write` et `workshop:read/write` via les correspondances de `RoleService.userHasPermission`. | `grep` confirme que `assertCanAssignPermissions` n'apparaît que dans sa propre définition (`user-role-guards.ts:61`), jamais importée dans `actions.ts`. Dans `updateUser()` (actions.ts, bloc `customPermissions`), seul `targetUser.role !== role` déclenche le blocage d'auto-modification ; aucun contrôle équivalent n'existe pour `customPermissions` quand le rôle reste identique. Scénario reproductible : un compte RH appelle `updateUser` avec `id` = son propre id, `role` = "RH" (inchangé), `permissions` = `["stock:create","stock:edit","workshop:view_global","workshop:create","workshop:edit"]`. Aucune des trois gardes (`assertKnownRole`, `assertCanManageTargetUser`, `assertCanAssignRole`) n'empêche cette écriture car elles ne portent que sur le rôle, pas sur `customPermissions`. Le compte RH obtient alors `vehicles:write` et `workshop:read`/`workshop:write`, ce qui donne un accès complet à `POST /api/ai/tech-sheet` et `GET /api/workshop/export`, les deux routes `hasApiPermission`-dépendantes qui viennent d'être durcies dans ce lot. | Importer `assertCanAssignPermissions` dans `actions.ts` et l'appeler avec `(currentUser.role, customPermissions)` avant chaque écriture de `customPermissions`, dans `createUser`, `updateUser` ET `updateUserPermissions`. Dans `updateUser`, ajouter en plus un blocage explicite d'auto-attribution de permissions pour les non-super-admins, indépendant du test sur le rôle (même logique que celle déjà présente dans `updateUserPermissions`). | Faible. `assertCanAssignPermissions` autorise déjà sans restriction les super-admins et ne bloque que les permissions hors du périmètre par défaut de l'acteur ; les parcours légitimes où un gestionnaire attribue des capacités qu'il possède déjà ne sont pas affectés. |
| REV-02 | HAUTE | La matrice de rôles livrée ne comporte que deux niveaux (rôle protégé vs reste du monde). Les quatre rôles intermédiaires visés par le plan (RH, ADV, RTA, DC) ont chacun par défaut `users:create`, `users:assign_role`, `users:custom_permissions` et `users:delete` à l'identique, sans notion de périmètre métier. `assertCanAssignRole` et `assertCanManageTargetUser` ne bloquent que les rôles de `PROTECTED_USER_ROLES` (DEVELOPER, PDG, DG, SG, ADMIN). Un RH peut donc créer, promouvoir, désactiver ou supprimer un compte DC, RTA, ADV, CHEF_ATELIER, STOCK, etc. sans aucune restriction de "périmètre autorisé", contrairement à l'exigence explicite du plan ("RH, ADV, RTA, DC : ne peuvent attribuer que les rôles opérationnels autorisés par leur périmètre"). | `permissions-config.ts` lignes 152-204 : `RH`, `ADV`, `RTA`, `DC` possèdent tous `"users:create", "users:assign_role", "users:custom_permissions", "users:delete"` dans `DEFAULT_ROLE_CAPABILITIES`. `user-role-guards.ts` : `PROTECTED_USER_ROLES` ne contient que `DEVELOPER, PDG, DG, SG, ADMIN`, aucune règle de périmètre croisé entre RH/ADV/RTA/DC. | Définir une table de périmètre explicite par rôle gestionnaire intermédiaire (quels rôles chacun peut effectivement attribuer/gérer) et la faire appliquer par `assertCanAssignRole` / `assertCanManageTargetUser` en complément du filtre "protégé" déjà en place. | Moyen. Nécessite une validation métier précise du périmètre de chaque rôle (RH, ADV, RTA, DC) avant implémentation, sous peine de casser un parcours légitime aujourd'hui toléré (ex. RH créant un CHEF_ATELIER). Recommandé en Phase 1bis rapide, mais ne doit pas à lui seul bloquer ce lot si REV-01 est corrigé. |
| REV-03 | MOYENNE | Le mot de passe minimal de 8 caractères ajouté dans `createUser()` est contournable immédiatement après création : `updateUserPassword()` n'exige que 4 caractères minimum (`newPassword.trim().length < 4`), pour une réinitialisation par un rôle privilégié ou par l'utilisateur lui-même. La nouvelle politique de création perd donc une partie de son effet. | `actions.ts`, `createUser` : `if (!password || password.length < 8)`. `actions.ts`, `updateUserPassword` : `if (!newPassword || newPassword.trim().length < 4)` (inchangé par ce lot). | Aligner le seuil minimal de `updateUserPassword` / `changeMyPassword` sur celui de `createUser` (8 caractères), ou documenter explicitement si un seuil différent est voulu pour la réinitialisation. | Faible. Un relèvement du seuil minimal ne casse aucun parcours fonctionnel, seulement les mots de passe de test trop courts. |
| REV-04 | MOYENNE | `POST /api/ai/tech-sheet` vérifie désormais la permission `vehicles:write`, mais n'implémente pas la "vérification du véhicule" (périmètre) explicitement demandée par le plan ("vehicles:write et vérification du véhicule" ; test attendu : "accès uniquement pour un véhicule de son périmètre"). La route ne fait qu'un `prisma.vehicle.findUnique` par id, sans filtre d'activité/périmètre, ce qui autorise tout titulaire de `vehicles:write` (STOCK, ADMIN, RTA, DC, ADV, RF, etc.) à modifier la fiche technique de n'importe quel véhicule. | `apps/web/src/app/api/ai/tech-sheet/route.ts`, bloc `prisma.vehicle.findUnique({ where: { vehicleId } })` : aucun filtre de périmètre, à comparer avec le filtre `activityScope` déjà utilisé dans `reports/financial-excel/route.ts`. | Ajouter un filtre de périmètre équivalent à celui de `financial-excel` (champ d'activité ou de rattachement du véhicule) avant d'autoriser la lecture/écriture de la fiche technique. | Faible à moyen, selon le champ du modèle `Vehicle` retenu pour porter le périmètre ; à valider avec le schéma Prisma existant. |
| REV-05 | MOYENNE | Incohérence documentée entre `role-service.ts` et le nouveau `user-role-guards.ts` : `ADV` possède dans `ROLE_PERMISSIONS` les permissions `admin:all`, `roles:manage`, `users:manage` à l'identique de PDG/DG/SG (commentaire du code : "ADV : Aucune restriction ... possibilité de modifier les rôles"), mais `ADV` n'appartient pas à `SUPER_ADMIN_ROLES` du nouveau garde-fou et se retrouve donc bloqué par `assertCanAssignRole` pour toute attribution de rôle protégé. Ce changement de comportement est probablement l'effet recherché par la Phase 1, mais il contredit un commentaire de code existant et doit être validé explicitement avec le métier avant déploiement, sous peine de casser un usage ADV aujourd'hui considéré comme normal. | `role-service.ts` lignes 108-127 (bloc `ADV`) vs `user-role-guards.ts` ligne 5 (`SUPER_ADMIN_ROLES` sans ADV). | Confirmer avec le métier que la perte de la capacité ADV à promouvoir des comptes PDG/DG/SG est intentionnelle. Si oui, mettre à jour le commentaire obsolète de `role-service.ts` pour éviter toute confusion future. Si non, ajouter ADV à `SUPER_ADMIN_ROLES` ou prévoir un palier intermédiaire dédié. | Moyen, dépend uniquement de la décision métier ; aucun changement de code supplémentaire requis si le comportement actuel est validé. |
| REV-06 | INFO | Les routes `GET/POST /api/ai/settings`, `GET /api/calls/conference` et `POST /api/vapi/webhook`, pourtant listées dans la section 1.2 du plan de remédiation, ne font pas partie des 9 fichiers livrés dans ce lot et restent, à notre connaissance, dans leur état antérieur (non durci). Ce n'est pas une régression de ce lot, mais le périmètre "Phase 1.2" du plan n'est que partiellement couvert par cette livraison. | Absence de ces fichiers dans la liste des fichiers modifiés/ajoutés fournie pour cette revue et dans `git status --short`. | Planifier un lot de suite immédiat pour ces routes avant de considérer la section 1.2 du plan comme close. | Aucun (pas de changement apporté ici). |
| REV-07 | INFO | Vérification de build/typage non exécutable dans cet environnement d'agent (sandbox bloquant `tsc`/`npm run build` pour un agent non interactif). Relecture manuelle des 9 fichiers : imports cohérents et utilisés, assertions de type (`assertKnownRole`, fonctions `assert*`) correctement typées, aucune incohérence de prop détectée entre `UsersView.tsx` et son appelant `page.tsx` (les 4 nouvelles props `canCreateUsers/canAssignRole/canCustomPermissions/canDeleteUsers` étaient déjà fournies côté `page.tsx`, qui n'a pas été modifié par ce lot). Aucun `console.log` ni secret en dur détecté dans les 9 fichiers revus. | Lecture complète de `user-role-guards.ts`, `api-auth.ts`, `actions.ts`, `UsersView.tsx`, `page.tsx`, des 5 routes API, et tentative infructueuse de `npx tsc --noEmit`, `./node_modules/.bin/tsc --version`, `npm run build` (bloqués par le bac à sable). | Avant tout déploiement, exécuter manuellement `npx tsc --noEmit` et `npm run build` dans un environnement capable d'approuver l'exécution, puisque cette revue ne peut pas s'y substituer. | Aucun (recommandation de process, pas de changement de code). |

## 3. Points positifs confirmés

- Les 5 routes API n'acceptaient auparavant qu'une session valide sans aucun
  contrôle de rôle ou de permission (confirmé par le diff Git) ; elles exigent
  désormais une permission explicite et correctement choisie pour chaque cas
  d'usage (`charging:read/write`, `workshop:read`, `vehicles:write`,
  `financial_report:export`). Ceci corrige directement SEC-02, SEC-06 et
  SEC-07 de l'audit croisé, et confirme un `403` pour `COMMERCIAL` sur les
  quatre premières routes comme demandé par les tests du plan.
- `getApiUser()` relit systématiquement `active` et `role` en base à chaque
  appel API, ce qui ferme la fenêtre d'exploitation décrite en SEC-05 pour ces
  5 routes précises (session d'un compte désactivé ou rétrogradé encore
  acceptée par l'API).
- `toggleUserActive` et `deleteUser` protégeaient auparavant uniquement les
  comptes `DEVELOPER` ; ils protègent désormais l'ensemble de
  `PROTECTED_USER_ROLES` (PDG, DG, SG, ADMIN inclus). C'est une fermeture de
  trou réelle : avant ce lot, un ADMIN ou un RH pouvait désactiver ou supprimer
  un compte PDG/DG/SG/ADMIN.
- `createUser()` n'autorise plus la création d'un compte sans mot de passe
  explicite d'au moins 8 caractères (auparavant, un mot de passe de
  démonstration par défaut était appliqué silencieusement en absence de saisie
  ; ce comportement est supprimé). Ceci répond à SEC-13 de l'audit croisé.
- L'auto-modification de son propre rôle est bloquée sans exception dans
  `updateUser` et `updateUserRole`, y compris pour les super-admins (le blocage
  ne porte que sur le changement de rôle en lui-même, pas sur une
  restriction de cible).
- Le menu déroulant de rôle dans `UsersView.tsx` masque désormais PDG/DG/SG/
  ADMIN pour tout acteur non super-admin, en cohérence avec les contrôles
  serveur (défense en profondeur, même si le serveur reste la barrière
  réelle).

## 4. Verdict

**GO avec réserves.**

Le lot corrige de façon solide les vulnérabilités CRITIQUES d'origine sur les
5 routes API (SEC-02/06/07) et comble une lacune réelle sur
`toggleUserActive`/`deleteUser`. Toutefois, REV-01 réintroduit, par un chemin
différent (`updateUser` au lieu des routes API), exactement le type de
contournement que la Phase 1 visait à éliminer, et il atteint directement deux
des routes qui viennent d'être durcies dans ce même lot. Ce point doit être
corrigé avant mise en production.

Condition de passage à GO sans réserve : corriger REV-01 (appeler
`assertCanAssignPermissions` dans `createUser`, `updateUser` et
`updateUserPermissions`, et bloquer l'auto-attribution de `customPermissions`
dans `updateUser` indépendamment du changement de rôle), puis relancer les
tests de non-régression du plan section 1.1 en ajoutant un cas RH/ADV/RTA/DC
qui tente de s'auto-attribuer ou d'attribuer à un pair une capacité hors de
son périmètre par défaut.

REV-02, REV-04 et REV-05 ne bloquent pas le déploiement de ce lot mais doivent
être traités à très court terme (périmètre RH/ADV/RTA/DC, vérification du
véhicule sur `ai/tech-sheet`, validation métier du cas ADV). REV-03, REV-06 et
REV-07 sont des recommandations de suivi.

## ADDENDUM Lead - 2026-11-07

- REV-01 est corrigé : `assertCanAssignPermissions` est maintenant appelé dans la création, la modification et la personnalisation des permissions.
- Les rôles financiers RF, COMPTA, ASSISTANTE_COMPTABLE et COMPTA_GARAGE sont également protégés.
- `tsc --noEmit` et `npm run build` ont été exécutés avec succès après correction.
- La révocation des sessions a été ajoutée en phase 2.
