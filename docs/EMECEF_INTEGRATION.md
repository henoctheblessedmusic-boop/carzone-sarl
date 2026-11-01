# Intégration e-MECeF (DGI Bénin) — CARZONE SARL

## État actuel
- L'entreprise dispose déjà d'un compte **SyGMEF e-MCF**.
- Le logiciel contient un client e-MECeF (`apps/web/src/lib/dgi-emecef.ts`) avec deux modes : **LIVE** et **DEMO**.
- Aucune facture ne peut plus être marquée « certifiée DGI » sans appel réel en mode LIVE.

## Modes

### LIVE (production)
Variables d'environnement requises :
```env
DGI_EMECEF_MODE=LIVE
DGI_EMECEF_BASE_URL=https://sygmef.impots.bj/emcf/api
DGI_EMECEF_JWT=<jeton fourni par la DGI>
DGI_EMECEF_IFU=<IFU de CARZONE SARL>
DGI_EMECEF_NIM=<NIM de la machine e-MECeF>
```
Protocole : `POST /invoice` puis `PUT /invoice/{uid}/confirm`.
En cas d'échec : erreur explicite, facture **non certifiée**, aucune mention fiscale imprimée.

### DEMO (démonstrations)
```env
DGI_EMECEF_MODE=DEMO
```
- Génère des codes `DEMO-…` et des QR de démonstration.
- Les factures sont marquées `isDemo = true` et `certificationMode = "DEMO"`.
- **Bandeau rouge sur l'impression** : « DOCUMENT DE DÉMONSTRATION — SANS VALEUR FISCALE ».
- Badge **DÉMO** dans la liste des factures + bandeau d'avertissement.
- **Exclues** des KPI, du dashboard, du rapport financier Excel et du bilan.
- **Encaissements bloqués** sur ces factures.
- Ne jamais utiliser un document DEMO comme facture client réelle.

## Passage DEMO → LIVE
1. Récupérer avec le comptable : JWT, IFU, NIM, URL de production.
2. Renseigner les variables d'environnement sur Vercel (jamais dans le code).
3. Passer `DGI_EMECEF_MODE=LIVE` (ou supprimer la variable : LIVE est le défaut).
4. Redéployer, puis tester une facture normalisée en sandbox avant la production.
5. Les anciens documents DEMO restent marqués et exclus ; ils ne sont jamais convertis.

## Nettoyage des documents de démonstration
Après les démonstrations, supprimer les factures DEMO (aucun paiement associé possible) :
```sql
DELETE FROM "Invoice" WHERE "isDemo" = true;
```
À exécuter avec une sauvegarde préalable et de préférence via Prisma Studio.

## Rappels de conformité
- Une facture normalisée ne s'annule pas : correction par **facture d'avoir (FA)**, justifiée auprès de la DGI (cas de force majeure, motif écrit, pièce jointe).
- Les groupes de taxe e-MECeF : A = exonéré, B = 18 %, C/D/E/F selon la DGI.
- Vérifier les taux et les mentions avec le comptable avant la mise en production.
