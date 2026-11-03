# Cahier des exigences : gestion de certains rôles et des accès


## 1. Contexte

- les achats et l'import auprès de fournisseurs en Chine et à Dubaï ;
- la logistique et le dédouanement ;
- le stock du showroom et les ventes ;
- la facturation normalisée ;
- les encaissements clients ;
- les dépenses internes et les prestataires ;
- les ressources humaines et la paie ;
- la location de véhicules.

L'accès repose sur des **rôles avec des permissions précises**. Chaque utilisateur ne voit et ne fait que ce que son rôle autorise.

---

## 2. Les rôles

### Rôle 1 : Comptable principale, DRH et superviseure du showroom et du garage

**Niveau :** administratrice métier, avec un accès complet à toute l'activité.

Ses responsabilités :

- **Achats à l'international :** elle crée, valide et suit les ordres de virement aux fournisseurs de Chine et de Dubaï.
- **Dédouanement :** elle suit les dossiers de douane, les frais et les documents.
- **Logistique de transport :** elle suit l'acheminement des véhicules et des conteneurs jusqu'au showroom.
- **Dépenses liées :** elle saisit et contrôle toutes les dépenses d'import, de douane, de transport et de logistique.
- **RH et paie, de façon exclusive :** fiches de paie, salaires, paiement des salaires.
- **Paiements, de façon exclusive :** paiements sortants comme les virements fournisseurs.
- **Facturation :** elle transforme les proformas et les BL internes en factures normalisées.
- **Supervision :** elle voit tous les modules, dont le showroom, les ventes, le stock, les encaissements et la location de vehicules.

### Rôle 2 : Assistante comptable

**Niveau :** accès limité au volet commercial et aux dépenses internes.

**Elle a accès à :**

- l'émission des **factures normalisées**, y compris la transformation d'une proforma  en BL interne ou en facture normalisée ;
- les **bons de livraison (BL) internes** ;
- les **devis** et les documents commerciaux liés ;
- les **dépenses internes** de l'entreprise ;
- la **gestion des prestataires** : fiches et suivi.

**Elle n'a pas accès à :**

- la paie, les fiches de paie et les salaires ;
- les paiements, comme les virements fournisseurs et les règlements ;
- l'import, le dédouanement et la logistique, sauf décision contraire (à confirmer).

### Rôle 3 : Gestionnaire de la location de véhicules

**Niveau :** accès limité au seul module Location de vehicule à implementer.

**Elle a accès à :**

- un **parc de véhicules à louer**, distinct du stock de vente, avec pour chaque véhicule sa fiche technique, son statut (disponible, loué, en maintenance, hors service) ;
- la gestion des **locations** : client, dates de début et de fin, tarif, caution, état du véhicule au départ et au retour.

**Elle n'a pas accès** aux autres modules.

### Rôle 4 : Responsable des ventes

**Niveau :** accès commercial et encaissements.

**Elle a accès à :**

- la **consultation du stock** ;
- la **gestion des clients** : création, modification, historique ;
- la création des **factures proforma** ;
- la **transformation d'une proforma en BL interne** ;
- l'**enregistrement des encaissements clients** en temps réel, par virement bancaire, en espèces, par chèque ou par tout autre moyen ;
- les **paiements partiels**, autrement dit le règlement progressif du reste à payer.

**Elle n'a pas le droit de :**

- transformer une proforma en facture normalisée : c'est réservé aux rôles 1 et 2 ;
- accéder à la paie, aux paiements fournisseurs ou aux dépenses.

---

## 3. Matrice des permissions

| Module / Action | Comptable principale | Assistante comptable | Resp. ventes | Gest. location |
|---|---|---|---|---|
| Ordres de virement fournisseurs (Chine/Dubaï) | ✅ Complet | ❌ | ❌ | ❌ |
| Dédouanement | ✅ | ❌ | ❌ | ❌ |
| Logistique et transport (véhicules, conteneurs) | ✅ | ❌ | ❌ | ❌ |
| Dépenses d'import et de logistique | ✅ | ❌ | ❌ | ❌ |
| Dépenses internes | ✅ | ✅ | ❌ | ❌ |
| Prestataires | ✅ | ✅ | ❌ | ❌ |
| Paie et salaires | ✅ Exclusif | ❌ | ❌ | ❌ |
| Paiements sortants | ✅ Exclusif | ❌ | ❌ | ❌ |
| Devis | ✅ | ✅ | ✅ (à confirmer) | ❌ |
| Factures proforma | ✅ | ✅ | ✅ Création | ❌ |
| Proforma → BL interne | ✅ | ✅ | ✅ | ❌ |
| Proforma / BL → Facture normalisée | ✅ | ✅ | ❌ | ❌ |
| PR internes | ✅ | ✅ | ❌ | ❌ |
| Clients | ✅ | ✅ (lecture) | ✅ Complet | ❌ |
| Stock du showroom | ✅ | ✅ (lecture) | ✅ (lecture) | ❌ |
| Encaissements clients | ✅ | ✅ (à confirmer) | ✅ Saisie | ❌ |
| Parc de véhicules à louer | ✅ (lecture et supervision) | ❌ | ❌ | ✅ Complet |
| Contrats de location | ✅ (lecture et supervision) | ❌ | ❌ | ✅ Complet |
| Tableaux de bord globaux | ✅ | ❌ | ❌ | ❌ |

---

## 4. Circuits de travail

### 4.1 Circuit de vente

```
Devis ─► Facture proforma ─► BL interne ou Facture normalisée ─► Encaissement(s)
         (Resp. ventes)      (Resp. ventes)  (Comptable / Assistante)  (Resp. ventes)
```

1. La responsable des ventes crée la **proforma** pour le client.
2. Elle la transforme en **BL interne**, ce qui fait sortir la marchandise.
3. La comptable principale ou son assistante transforme ensuite le document en **facture normalisée** en showroom.
4. Une fois la facture normalisée émise, la responsable des ventes enregistre les **encaissements**, au comptant ou en plusieurs fois.
5. Le système calcule automatiquement le **solde restant dû** et le **statut de la facture** : non payée, partiellement payée ou soldée.

### 4.2 Circuit d'import et d'approvisionnement

**Acteur :** comptable principale uniquement.

```
Commande fournisseur (Chine/Dubaï) ─► Ordre de virement ─► Expédition ─► Dédouanement ─► Transport ─► Réception au showroom (entrée en stock)
```

Chaque étape doit pouvoir porter des **dépenses rattachées** : fret, droits de douane, transitaire, transport. Cela permet de calculer le **coût de revient réel** des marchandises.

### 4.3 Circuit de location de véhicules

**Acteur :** gestionnaire de la location.

```
Véhicule disponible ─► Contrat de location ─► Sortie (état des lieux) ─► Retour (état des lieux) ─► Véhicule disponible
```

### 4.4 Circuit de la paie

**Acteur :** comptable principale uniquement.

```
Fiches employés ─► Préparation de la paie ─► Fiches de paie ─► Paiement des salaires
```

---

## 5. Règles métier à respecter

1. **Séparation des tâches :** la responsable des ventes ne peut jamais émettre une facture normalisée. Le système doit le bloquer, et pas seulement masquer le bouton.
2. **Confidentialité de la paie :** les données de paie et de salaires ne sont visibles que par la comptable principale.
3. **Encaissement possible seulement sur une facture normalisée :** un encaissement est toujours rattaché à une facture normalisée existante.
4. **Moyens de paiement :** espèces, virement bancaire et chèque, avec une liste extensible. Chaque encaissement enregistre la date et l'heure, le montant, le moyen de paiement, une référence (n° de chèque ou de virement), le client et l'utilisateur qui l'a saisi.
5. **Paiements partiels :** une facture peut recevoir plusieurs encaissements jusqu'à être soldée.
6. **Traçabilité :** chaque action sensible (création, transformation, encaissement, modification, annulation) est enregistrée dans un journal d'audit avec l'utilisateur, la date et l'heure.
7. **Stocks séparés :** le stock du showroom (marchandises à vendre) et le parc de location (véhicules à louer) sont deux inventaires distincts.
8. **Liens entre documents :** chaque document garde le lien vers celui dont il provient (proforma → BL ou facture normalisée), ce qui permet de suivre la chaîne de bout en bout.
9. **Temps réel :** les encaissements et les mouvements de stock sont visibles immédiatement par les profils autorisés.

---

## 6. Points techniques recommandés

- **Contrôle d'accès par rôles (RBAC)**, appliqué **côté serveur** sur chaque route et chaque action, et pas seulement dans l'interface.
- **Factures normalisées et e-MECeF :** au Bénin, la facture normalisée passe par le système **e-MECeF de la DGI**. Il faut prévoir l'intégration à l'API e-MECeF, ou au minimum la saisie du code MECeF et du QR code sur chaque facture.
- **Devises :** prévoir le franc CFA (XOF) comme devise principale, et l'USD, le CNY et l'AED pour les achats en Chine et à Dubaï, avec le taux de change appliqué.
- **Rôles évolutifs :** une même personne doit pouvoir cumuler plusieurs rôles, comme la comptable principale qui est aussi DRH et superviseure. Il doit aussi être possible d'ajouter de nouveaux rôles plus tard.

---

## 7. Points à clarifier avant le développement


1. L'assistante gère les dépenses internes et les prestataires, mais n'a pas accès « aux paiements ». Peut-elle **enregistrer le règlement** d'une dépense ou d'un prestataire, ou seulement saisir la dépense, que la comptable principale valide et paie ensuite ? OUI ELLE PEUT
3. L'assistante comptable peut-elle aussi **enregistrer des encaissements clients** ? OUI
4. La responsable des ventes peut-elle **créer des devis**, ou seulement des proformas ? OUI DEVIS =PROFORMA
5. La responsable des ventes peut-elle **modifier le stock** (entrées, ajustements) ou seulement le consulter ? PEUT AUSSI MODIFIER LE STOCK DES VOITURES A LOUER
6. Un document émis, comme une facture normalisée ou un encaissement, peut-il être **annulé ou corrigé** ? Si oui, par qui ? SEULRMENT LA COMPTABLE PRINIPALE (facture d'avoir avec les references de la facture normalisée correspondante selon les recommeendation de la DGI permettant d'annulation d'une facture emise)
7. Faut-il une **validation** par la comptable principale pour certaines opérations, par exemple les dépenses au-dessus d'un certain montant ? oui pour les d"penses superieurs ou égale à 50000 FCFA
8. Les véhicules en location sont-ils **les mêmes** que ceux importés pour la vente, avec possibilité de passer d'un stock à l'autre ?  il y a déjà un stock existant, mais on peut passer aussi de véhicules importés au stock de véhicules à louer.
