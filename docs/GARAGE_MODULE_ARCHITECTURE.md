# Architecture du module Garage / Atelier — CARZONE SARL Ops

## 1. Objectif
Structurer l'activité garage de façon professionnelle et cloisonnée : réception, diagnostic,
maintenance, réparations, pièces, coûts d'intervention, facturation et supervision. Le garage
ne doit jamais être mélangé au showroom (vente de véhicules neufs).

## 2. Domaines fonctionnels
1. **Clients garage** : clients venus uniquement pour l'atelier, clients showroom utilisant
   aussi le garage, entreprises partenaires. Champs : `scopeShowroom`, `scopeGarage`, `isPartner`.
2. **Véhicules clients / parc atelier** : véhicules pris en charge pour réparation, entretien,
   diagnostic ; séparés du stock showroom.
3. **Réception atelier** : passage atelier (`WorkshopEntry`) avec date, kilométrage, état,
   réceptionnaire, technicien, observations.
4. **Fiches d'activité** :
   - Fiche d'intervention (fiche 1) : diagnostic, travaux, pièces à commander, temps.
   - Fiche d'entretien systématique (fiche 2) : checklist 22 points par palier kilométrique.
5. **Coûts d'intervention** :
   - main-d'œuvre interne (`laborCostXof`) ;
   - pièces détachées (`partsCostXof`) ;
   - autres coûts / sous-traitance (`otherCostXof`) ;
   - notes de coût, statut de validation, validateur et date.
6. **Facturation garage** : proforma → facture normalisée / BL interne, toujours avec
   `activity = GARAGE` ; aucune vente de véhicule showroom dans une proforma garage.
   L'estimateur proforma garage comprend :
   - véhicule client (immatriculation, marque, modèle, VIN, kilométrage, panne/motif) ;
   - lignes **main-d'œuvre** (opération, heures × taux horaire) ;
   - lignes **pièces détachées** issues du stock (référence, stock disponible, prix de vente) ;
   - lignes **articles / prestations** et **lignes libres** ;
   - totaux HT/TVA/TTC et CGV Atelier, impression dédiée avec bloc véhicule.
7. **Supervision et audit** : validation des coûts par la Comptable Garage, journal d'audit
   de toutes les actions sensibles.

## 3. Rôles et responsabilités
| Rôle | Garage / atelier | Coûts intervention | Validation coûts | Proforma / facture garage | Clients garage |
|---|---|---|---|---|---|
| **COMPTA_GARAGE** (Comptable Garage) | Lecture complète, fiches, OR, pièces, BL | Création / modification | **Oui** | Émission, normalisation, envoi | Création / modification |
| **CHEF_ATELIER** | Réception, OR, fiches, planning | Saisie / soumission | Non | Consultation | Lecture |
| **ATELIER** | Exécution, fiches, pièces consommées | Non | Non | Non | Lecture |
| **COMPTA** (Comptable principale) | Supervision globale | Oui | Oui | Oui | Oui |
| **DG / PDG / SG** | Supervision globale | Oui | Oui | Oui | Oui |
| **DEVELOPER** | Accès technique total, **non journalisé** | Oui | Oui | Oui | Oui |

## 4. Workflow de coût d'intervention
`BROUILLON` → (chef atelier ou comptable garage saisit) → `A_VALIDER` → (Comptable Garage /
Comptabilité / Direction valide) → `VALIDE`.

- Toute modification d'un coût validé le repasse en `A_VALIDER`.
- Le validateur et la date sont conservés (`costApprovedBy`, `costApprovedAt`).
- Toute action est tracée dans `AuditLog` (sauf DEVELOPER).

## 5. Contrôles de sécurité appliqués
- **Clients** : `scopeShowroom` / `scopeGarage` contrôlés côté serveur pour les proformas,
  l'atelier et les bons de livraison.
- **Proformas garage** : client garage obligatoire, aucune ligne véhicule showroom, aucune
  opportunité showroom ; gardes dans `quotes/actions.ts`.
- **Coûts** : actions `saveWorkshopCost` / `approveWorkshopCost` avec rôles explicites.
- **Audit** : `logAudit` sur véhicules, devis, factures, BL, atelier, pièces, clients, coûts.
- **DEVELOPER** : compte technique invisible, jamais journalisé ni affiché dans `/audit`.

## 6. Pages
- `/workshop` : réception, fiches, OR, export Excel.
- `/workshop/[id]/fiche-intervention` et `/fiche-entretien` : documents imprimables.
- `/garage-supervision` : synthèse des interventions et coûts, validation, accès aux fiches.
- `/quotes` : proformas (garage filtré pour COMPTA_GARAGE).
- `/invoices` : factures garage ; `/delivery-notes` : BL internes garage.
- `/audit` : journal de traçabilité.

## 7. Évolutions recommandées
1. Lier une intervention à une proforma/facture en un clic (référence `quoteId` / `invoiceId`).
2. Imputer automatiquement les pièces consommées (`WorkOrderPartUsage`) dans `partsCostXof`.
3. Ajouter un planning atelier (charge techniciens / temps estimé).
4. Ajouter des indicateurs de marge par intervention (coût réel vs facturé).
5. Étendre l'audit aux impressions et téléchargements de documents.
