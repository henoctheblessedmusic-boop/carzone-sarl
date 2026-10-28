---
name: ecc-workflow
description: Pipeline ECC adapté à DSH pour ce dépôt CARZONE — recherche, plan, TDD, revue à contexte frais, vérification par preuves, commit conventionnel. À charger quand on démarre une fonctionnalité, un correctif ou un refactor non trivial dans apps/web.
whenToUse: Use before starting any non-trivial feature, bug fix, or refactor in this repo, to run the ECC research-plan-TDD-review-verify-commit loop with DSH-native tools (subagent, todo_write, pwsh, skill).
---

# ECC Workflow (DSH) — CARZONE SARL Ops

Ce skill traduit le pipeline ECC (Everything Claude Code) dans le harnais DSH réel :
pas de hooks, pas de mémoire automatique, pas de slash-commands Claude. Chaque étape
s'exécute avec les outils DSH et laisse une preuve.

## 0. Charger le bon contexte

- Lire `CLAUDE.md` (métier, comptes, règles) et `AGENTS.md` (discipline d'ingénierie).
- Charger 1–2 skills ECC ciblés depuis le catalogue : `tdd-workflow`, `react-testing`,
  `prisma-patterns`, `security-review`, `verification-loop`, `code-review`, `blueprint`…
- Vérifier l'état du dépôt : `git status`, `git log --oneline -5`.

## 1. Recherche (avant tout code neuf)

1. Chercher une implémentation existante : GitHub (`gh search code`), registres npm,
   docs officielles Next.js 15 / Prisma 5.
2. Vérifier les patterns déjà présents dans le dépôt (`apps/web/src/app`,
   `src/lib`, composants) : réutiliser la convention existante plutôt qu'en inventer une.
3. Si un skill ECC couvre le sujet (ex. `documentation-lookup`), le charger.

## 2. Plan

- `todo_write` avec une étape par livrable concret.
- Identifier risques : migration BDD (Neon prod !), auth/rôles, impressions A4,
   e-MECeF, intégrations externes.
- Découper en phases vérifiables ; s'arrêter et signaler si le périmètre explose.

## 3. Implémentation (TDD quand pertinent)

- RED : écrire le test qui échoue.
- GREEN : implémentation minimale.
- IMPROVE : refactor sans changer le comportement.
- Respecter les standards : immutabilité, petits fichiers, validation Zod aux frontières,
  Server Components par défaut.

## 4. Revue à contexte frais (DSH)

Les agents ECC sont des fiches de rôle dans `.dsh/agents/` (voir `INDEX.md`).
Pour revoir un changement :

```
subagent prompt = [contenu de .dsh/agents/code-reviewer.md] + "Review the diff of <scope>.
Report CRITICAL/HIGH/MEDIUM/LOW with file:line evidence."
```

Pour la sécurité : `.dsh/agents/security-reviewer.md` (ou skill `security-review`).
Corriger CRITICAL et HIGH avant tout commit.

## 5. Vérification (preuves, pas d'affirmations)

- `cd apps/web && npm run build` (ou `npm run lint` pour un contrôle rapide).
- Tests ciblés si présents ; sinon vérifier le comportement réel (route locale, requête).
- Vérifier `git diff` complet ; relire les fichiers modifiés.
- Si BDD modifiée : `npm run db:push` seulement après diff Prisma validé (jamais
  `db:reset` sur Neon).

## 6. Commit & déploiement

- `git add` ciblé (jamais `.env`, artefacts, `cookies.txt`).
- Message conventionnel (`feat(workshop): …`), push `origin main` → Vercel déploie.
- Consigner les pièges rencontrés dans `docs/` ou le corps du commit.

## 7. Après coup

- Mettre à jour la documentation concernée (`PASSATION_COMPLETE.md`, `README.md`) si
  l'état du produit change.
- Les apprentissages durables vont dans `AGENTS.md` / `CLAUDE.md`, pas dans un fichier
  temporaire.

## Garde-fous spécifiques à ce dépôt

- Ne jamais committer de secret : masquer (`[CLE_..._MASQUEE]`) — GitHub a déjà bloqué un
  push à cause du secret scanning.
- La base de production est Neon PostgreSQL partagée : toute écriture BDD doit être
  intentionnelle et réversible.
- `main` = production Vercel : commits vérifiés uniquement.
