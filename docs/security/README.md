# Audit de sécurité CARZONE SARL Ops

Date : 2026-11-07
Périmètre : application Next.js 15, API, server actions, authentification, sessions, Prisma/Neon, configuration Vercel, dépendances, ports et secrets.

## Rapports

- [Audit indépendant Claude](claude-audit.md)
- [Audit indépendant DeepSeek](deepseek-audit.md)
- [Tableau comparatif](comparaison-claude-deepseek.md)
- [Plan de remédiation](PLAN_CORRECTIF.md)

## Synthèse

Les deux audits convergent sur trois risques critiques :

1. **Élévation de privilèges** : des rôles intermédiaires peuvent attribuer des rôles super-admin dans les actions Utilisateurs.
2. **Routes API sans contrôle de rôle** : plusieurs API sensibles ne vérifient que la session, pas la permission. Un compte COMMERCIAL peut lire des données clients et exporter l'historique atelier.
3. **Webhook VAPI public** : aucun secret n'est configuré en production, alors que l'endpoint peut créer des clients et devis.

DeepSeek ajoute notamment :

- 2 comptes actifs utilisent encore le mot de passe de démonstration, dont un DG ;
- une session API reste valide après désactivation du compte ;
- Next.js 15.2.9 présente des vulnérabilités critiques ;
- absence de CSP ;
- rate limiting public incomplet ;
- upload de documents sans limite serveur.

Claude a confirmé l'absence de secrets dans Git, la présence de `AUTH_SECRET` en production et le rejet d'une session forgée avec le fallback. La vérification live a aussi montré que HSTS est présent en production, alors que Claude l'avait initialement supposé absent.

## État des correctifs

Aucun correctif n'a été appliqué dans cette phase. Le plan est prêt et doit être exécuté par phases, avec sauvegarde préalable, tests de non-régression et rollback. Les priorités immédiates sont détaillées dans [PLAN_CORRECTIF.md](PLAN_CORRECTIF.md).
