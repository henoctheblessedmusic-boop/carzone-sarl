# Fiche de rôle - Bornes & Énergie

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

Ce rôle gère le réseau de bornes de recharge CARZONE : sessions de recharge, abonnements,
demandes d'installation chez les clients, et le réseau d'installateurs partenaires.

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Boîte mail, Flotte, Installateurs bornes, Devis bornes,
  Bornes & abonnements, Terminal borne.
- Créer/suivre une demande d'installation de borne chez un client.
- Attribuer une demande à un installateur partenaire et suivre son devis (montant, délai).
- Suivre les sessions de recharge et les abonnements (plans tarifaires kWh).
- Utiliser le terminal de paiement pour simuler/encaisser une recharge.

## 3. Ce qu'il ne peut pas faire

- Pas d'accès aux devis/factures commerciales classiques, à l'atelier, aux RH, à la gestion
  des comptes/rôles.
- Si une page redirige vers le tableau de bord, ce n'est pas une erreur de manipulation :
  contacter le support.

## 4. Parcours de connexion pas à pas

1. https://carzone-sarl.vercel.app/login
2. Utiliser le compte de formation fourni par le formateur.
3. **Se connecter**.
4. Tableau de bord, puis menu **Bornes & abonnements**.

*Capture disponible : `captures/bornes-ops/01-connexion.png`,
`captures/bornes-ops/02-menu-bornes.png`.*

## 5. Tâches quotidiennes, avec étapes et captures

### a) Traiter une demande d'installation de borne
1. Menu **Devis bornes** -> ouvrir une demande "Nouvelle".
2. Vérifier l'adresse, la puissance souhaitée, le véhicule du client.
3. Transmettre aux installateurs partenaires compétents.

*Capture disponible : `captures/bornes-ops/03-demande-installation.png`, pastille sur le
bouton "Transmettre aux installateurs".*

### b) Comparer les devis installateurs
1. Menu **Installateurs bornes** -> comparer montant et délai proposés.
2. Sélectionner l'offre retenue avec le client.

### c) Suivre les sessions de recharge et le terminal
1. Menu **Bornes & abonnements** -> suivre les sessions en cours (kWh délivrés, montant).
2. Menu **Terminal borne** pour simuler un encaissement.

## 6. Tâches hebdomadaires ou ponctuelles

- Suivi hebdomadaire des demandes d'installation non traitées.
- Relance ponctuelle d'un installateur qui n'a pas répondu à une demande de devis.

## 7. Erreurs fréquentes et réflexes

- Oublier de transmettre une demande aux installateurs : elle reste bloquée au statut
  "Nouvelle".
- Choisir une offre installateur sans comparer montant ET délai.
- Confondre abonnement (tarif mensuel) et session ponctuelle de recharge publique.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test Bornes & Énergie.
2. Ouvrir **Devis bornes** et citer le statut d'une demande.
3. Ouvrir **Installateurs bornes** et citer un installateur partenaire.
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais traiter une demande d'installation de borne.
- [ ] Je sais comparer des devis installateurs.
- [ ] Je sais suivre une session de recharge.
- [ ] Je sais utiliser le terminal de paiement borne.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/08-bornes-installateurs`

- `presentations/roles/bornes-ops.pptx` : support court dédié à ce rôle.
