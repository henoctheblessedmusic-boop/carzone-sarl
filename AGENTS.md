# AGENTS.md — Discipline d'ingénierie (ECC) pour CARZONE SARL Ops

> Fichier chargé automatiquement par DSH à chaque session. Il complète `CLAUDE.md`
> (identité entreprise, stack, comptes seed) : en cas de divergence, **CLAUDE.md fait foi
> pour le métier**, ce fichier fait foi pour la **méthode de travail**.
>
> Source : pack ECC (Everything Claude Code, dépôt `affaan-m/ECC`, licence MIT), adapté
> au harnais DSH et au stack Next.js 15 / Prisma / Neon de ce dépôt.
> Packs complets : `.dsh/rules/ecc/` · Fiches de rôle : `.dsh/agents/` (+ `INDEX.md`).

## 1. Boucle de travail obligatoire

`Rechercher → Planifier → Implémenter (TDD) → Revoir → Vérifier → Committer → Apprendre`

1. **Recherche avant code** : chercher une implémentation existante (GitHub, registres npm,
   docs officielles Next.js/Prisma) avant d'écrire du code neuf. Préférer adopter/adapter
   une solution éprouvée (80 % du besoin) plutôt que réinventer.
2. **Planifier** : lister les étapes (`todo_write`), identifier dépendances et risques ;
   les changements multi-étapes sont décomposés en phases livrables.
3. **Implémenter en TDD quand c'est pertinent** : test d'abord (RED), implémentation
   minimale (GREEN), refactor (IMPROVE). Cible de couverture : **80 %+**.
4. **Revoir** : après chaque écriture non triviale, relire le diff et, pour les changements
   sensibles, faire une revue à contexte frais via `subagent` (fichier de rôle dans
   `.dsh/agents/`, ex. `code-reviewer.md`, `security-reviewer.md`).
5. **Vérifier avant de déclarer terminé** : build/lint/tests + preuve réelle (sortie de
   commande, URL vérifiée) — jamais une affirmation sans preuve.
6. **Committer** : message conventionnel explicite, puis push (Vercel déploie `main`).
7. **Capturer l'apprentissage** : consigner les pièges rencontrés (docs/ ou commentaire de
   PR) pour ne pas répéter les erreurs — voir la section 5 du document de passation.

## 2. Standards de code (résumé des packs ECC)

- **Immutabilité** : créer de nouveaux objets, ne jamais muter en place.
- **KISS / DRY / YAGNI** : solution la plus simple ; abstractions seulement quand la
  répétition est réelle.
- **Petits fichiers, petites fonctions** : 200–400 lignes typiques, plafond souple 800
  lignes ; fonctions < 50 lignes ; max 4 niveaux d'imbrication (early returns).
- **Erreurs explicites** : jamais de `catch` silencieux ; messages utilisateur clairs côté
  UI, contexte complet côté serveur.
- **Validation aux frontières** : valider toute entrée externe (Zod), ne jamais faire
  confiance aux API/ fichiers/inputs.
- **Nommage** : noms descriptifs ; booléens lisibles (`isLoading`, `hasError`) ; constantes
  nommées au lieu de nombres magiques.
- **Pas de `console.log`** en code de production ; pas de composants classe en React.

## 3. TypeScript & React/Next.js (packs `typescript`, `react`, `web`)

- Types explicites sur les API publiques ; `unknown` au lieu de `any` ; `interface` pour
  les formes extensibles, `type` pour les unions/utilitaires ; pas de `React.FC`.
- **Server Components par défaut** ; `"use client"` uniquement si state/effects/refs/
  événements ; jamais d'import client depuis un fichier `"use server"`.
- Organisation **par fonctionnalité** (pas par type de fichier) ; tokens de design en
  variables CSS ; HTML sémantique et accessibilité (WCAG 2.2 AA).
- Hooks groupés en haut du composant ; pas de state dupliqué (dériver pendant le rendu).

## 4. Sécurité — checklist avant CHAQUE commit

- [ ] Aucun secret en dur (clé API, mot de passe, token) — variables d'environnement uniquement.
- [ ] Entrées utilisateur validées ; requêtes SQL/Prisma paramétrées.
- [ ] Authz vérifiée (`requireUser` / rôle attendu) sur chaque route/action sensible.
- [ ] Rate limiting sur les endpoints publics ; erreurs sans fuite d'information.
- [ ] **Documents et docs : masquer les secrets** (`[CLE_..._MASQUEE]`). Le push GitHub a
      déjà été bloqué par le secret scanning : ne jamais committer de valeur réelle, même
      dans un document de passation.
- Si une faille est trouvée : STOP, corriger en priorité (CRITICAL avant tout le reste),
      révoquer le secret exposé, puis auditer le reste du code.

## 5. Git & workflow de livraison

- Commits : `<type>: <description>` (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`,
  `perf`, `ci`), corps détaillé si utile, pas de trailer `Co-Authored-By` par défaut.
- Vérifier `git status` avant commit ; ne jamais committer `.env`, `cookies.txt`, `.next`,
  artefacts temporaires.
- `main` → déploiement Vercel automatique : ne pousser que du code vérifié (build OK).
- Base Neon : **jamais** `db:reset --force` en production ; `db:push` sur changements
  additifs uniquement, après vérification du diff Prisma.

## 6. Revue & sévérités

| Niveau | Signification | Action |
|---|---|---|
| CRITICAL | Faille de sécurité / perte de données | **BLOQUER** — corriger avant merge |
| HIGH | Bug ou qualité significative | **AVERTIR** — corriger avant merge |
| MEDIUM | Maintenabilité | **INFO** — corriger si possible |
| LOW | Style / suggestion | **NOTE** — optionnel |

Revue obligatoire : auth, paiements, données clients, requêtes DB, appels externes, avant
tout commit sur `main`.

## 7. Utilisation d'ECC dans ce harnais (DSH)

- **292 skills ECC** sont installés dans `~/.agents/skills` (racine utilisateur partagée,
  PAS dans le dépôt). Le catalogue est chargé automatiquement ; charger un skill à la
  demande avec l'outil `skill` **uniquement quand il est pertinent** (1–2 skills max par
  tâche, sinon gaspillage de contexte).
- Skills les plus utiles ici : `tdd-workflow`, `react-testing`, `frontend-patterns`,
  `prisma-patterns`, `postgres-patterns`, `security-review`, `verification-loop`,
  `code-review`, `git-workflow`, `documentation-lookup`, `e2e-testing`, `blueprint`,
  `orch-*` (pipelines plan→TDD→revue), `continuous-learning` (adapté sans hooks).
- **Agents ECC** (68 fiches de rôle, anglais) dans `.dsh/agents/` : ce sont des briefs à
  inclure dans le prompt d'un `subagent` DSH (voir `INDEX.md`). Les mappings
  Claude spécifiques (`model:`, `tools:`) sont à ignorer.
- Ce dépôt n'a **pas** les hooks/mémoire/instincts ECC (spécifiques Claude Code) : ne pas
  les promettre ni les simuler. La mémoire projet = `CLAUDE.md` + `PASSATION_COMPLETE.md`.

## 8. Anti-patients à éviter

- Pas de données mockées ou de faux badges dans le dashboard (règle projet n°5).
- Pas de photos de rue/plaques civiles dans les fiches véhicules (règle n°2).
- Pas de clés API côté client / composant React (règle n°3).
- Pas de facturation e-MECeF simulée en production (règle n°4).
- Pas de véhicules de réparation mélangés au stock de vente (règle n°1).
- Ne pas déclarer « terminé » sans build + preuve d'exécution.
