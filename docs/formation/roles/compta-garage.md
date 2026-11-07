# Fiche de rôle - Comptable Garage

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

La Comptable Garage gère la comptabilité de l'atelier SAV uniquement (périmètre "Garage") :
elle ne voit jamais les documents du périmètre Showroom (vente de véhicules neufs). Ce rôle
est supervisé par la Comptabilité principale (COMPTA).

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Atelier, Supervision garage, Pièces & Références,
  Devis & proformas, Factures & règlements, Bons de livraison, Journal d'audit.
- Créer/suivre un devis et une facture, **uniquement pour le périmètre Garage** (numérotation
  spécifique BL-GAR- pour les bons de livraison).
- Exporter le bilan financier du périmètre Garage.

## 3. Ce qu'il ne peut pas faire

- Ne voit jamais les devis/factures/bons de livraison du périmètre Showroom (vente de
  véhicules neufs) : c'est un cloisonnement volontaire entre les deux comptabilités.
- Pas d'accès aux RH, aux dépenses générales, à la gestion des comptes/rôles.
- Si une page redirige vers le tableau de bord, ce n'est pas une erreur de manipulation :
  contacter le support.

## 4. Parcours de connexion pas à pas

1. https://carzone-sarl.vercel.app/login
2. Utiliser le compte de formation fourni par le formateur.
3. **Se connecter**.
4. Tableau de bord : indicateurs financiers limités au périmètre Garage.

*Capture disponible : `captures/compta-garage/01-connexion.png`,
`captures/compta-garage/02-dashboard-garage.png`.*

## 5. Tâches quotidiennes, avec étapes et captures

### a) Suivre les factures atelier
1. Menu **Factures & règlements** -> uniquement les factures "Garage".
2. Enregistrer les règlements reçus.

*Capture disponible : `captures/compta-garage/03-factures-garage.png`, pastille sur le filtre
"Garage" déjà actif.*

### b) Émettre un bon de livraison interne Garage
1. Menu **Bons de livraison** -> nouveau bon (numéro BL-GAR-xxxx généré automatiquement).
2. Associer la facture ou le devis d'origine.

### c) Superviser les coûts d'intervention
1. Menu **Supervision garage** -> vérifier les coûts soumis par le Chef d'Atelier.
2. Valider ou renvoyer avec commentaire.

## 6. Tâches hebdomadaires ou ponctuelles

- Rapprochement hebdomadaire des factures atelier avec les ordres de réparation.
- Validation ponctuelle d'un coût d'intervention important.

## 7. Erreurs fréquentes et réflexes

- Chercher un document Showroom : il n'apparaîtra jamais pour ce compte, c'est volontaire.
- Confondre bon de livraison (non fiscal) et facture (fiscale).
- Valider un coût d'intervention sans vérifier le détail (main-d'oeuvre/pièces/sous-traitance).

## 8. Exercice pratique noté

1. Se connecter avec le compte de test Comptable Garage.
2. Ouvrir **Factures & règlements** et confirmer qu'aucun document Showroom n'apparaît.
3. Ouvrir **Supervision garage** et citer un coût d'intervention (ou constater qu'il n'y en a
   pas).
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais que mon périmètre est uniquement "Garage".
- [ ] Je sais émettre un bon de livraison interne Garage.
- [ ] Je sais valider un coût d'intervention.
- [ ] Je sais que je n'ai pas accès aux RH ni aux comptes utilisateurs.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/03-comptabilite`
- `presentations/05-atelier-stock-garage`

- `presentations/roles/compta-garage.pptx` : support court dédié à ce rôle.
