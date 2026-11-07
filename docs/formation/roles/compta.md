# Fiche de rôle - Comptabilité (comptable principale)

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

La Comptabilité (COMPTA) est le rôle comptable consolidé de CARZONE : elle couvre à la fois
la comptabilité générale, le rôle historique de Responsable Financier (RAF) et une partie RH
(paie), sur les deux périmètres Showroom et Garage. C'est l'un des rôles avec le menu le plus
large après la direction, mais **sans** la gestion des comptes/rôles.

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Atelier, Catalogue pièces, Supervision garage, Pièces &
  Références, Stock véhicules, Devis & proformas, Factures & règlements, Bons de livraison,
  Journal d'audit, Dépenses, Articles & services, Ressources Humaines, Pipeline, Prospects,
  Boîte mail, Location, Bornes & abonnements, Import.
- Exporter le bilan financier.
- Supprimer/annuler un devis ou une facture (motif obligatoire).
- Créer et gérer un bon de livraison interne (Showroom et Garage).
- Gérer la paie et les congés (RH).

## 3. Ce qu'il ne peut pas faire

- Ne peut pas créer, modifier ou supprimer un compte utilisateur, ni changer un rôle (page
  **Équipe & Rôles** non accessible pour ce compte).
- Si une page redirige vers le tableau de bord, ce n'est pas une erreur de manipulation :
  contacter le support.

## 4. Parcours de connexion pas à pas

1. https://carzone-sarl.vercel.app/login
2. Utiliser le compte de formation fourni par le formateur.
3. **Se connecter**.
4. Tableau de bord : facturé TTC, encaissé, créances à recouvrer, devis en attente, dépenses
   d'exploitation.

*Capture disponible : `captures/compta/01-connexion.png`,
`captures/compta/02-dashboard-financier.png`.*

## 5. Tâches quotidiennes, avec étapes et captures

### a) Normaliser une facture après commande confirmée
1. Menu **Devis & proformas** -> repérer un devis "Commande confirmée".
2. Transcrire en facture normalisée ou en bon de livraison interne selon le besoin.

*Capture disponible : `captures/compta/03-transcription-facture.png`, pastilles sur le choix
"Bon de livraison interne" vs "Facture normalisée".*

### b) Annuler un document en interne (si nécessaire)
1. Ouvrir le devis/la facture à annuler.
2. Saisir un motif obligatoire, confirmer : l'annulation est tracée dans le journal d'audit.

### c) Superviser la comptabilité garage
1. Menu **Supervision garage** -> vérifier les coûts d'intervention (main-d'oeuvre, pièces,
   sous-traitance) en attente de validation.
2. Valider ou renvoyer vers le Chef d'Atelier.

### d) Suivre la masse salariale et les dépenses
1. Menu **Ressources Humaines** et **Dépenses** pour la revue mensuelle.

## 6. Tâches hebdomadaires ou ponctuelles

- Rapprochement hebdomadaire factures/règlements/créances.
- Validation ponctuelle des coûts d'intervention garage soumis par le Chef d'Atelier.
- Export ponctuel du bilan financier pour la direction.

## 7. Erreurs fréquentes et réflexes

- Confondre bon de livraison interne (non fiscal) et facture normalisée (fiscale, avec
  certification MECeF) : toujours vérifier le type de document.
- Annuler sans motif : impossible, c'est volontaire et tracé.
- Chercher la page "Équipe & Rôles" : elle n'est pas prévue pour ce rôle, c'est normal.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test Comptabilité.
2. Relever le montant "Créances à recouvrer" sur le tableau de bord.
3. Ouvrir **Supervision garage** et citer un coût d'intervention en attente de validation (ou
   constater qu'il n'y en a pas).
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais lire les indicateurs financiers du tableau de bord.
- [ ] Je sais transcrire un devis confirmé en bon de livraison ou facture.
- [ ] Je sais valider un coût d'intervention garage.
- [ ] Je sais que je n'ai pas accès à la gestion des comptes/rôles, et que c'est normal.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/03-comptabilite`

- `presentations/roles/compta.pptx` : support court dédié à ce rôle.

## 11. Notifications, messages et audio

- La cloche de notifications est en haut à droite. Elle affiche les alertes non lues et ouvre le panneau Notifications et activités. Elle est visible selon les droits du rôle ; utiliser aussi les alertes du module et le centre d'aide si elle n'apparaît pas.
- Pour recevoir les alertes hors de l'onglet, autoriser les notifications du navigateur lors de la première utilisation.
- Ouvrir la configuration matérielle avec le bouton Activer en 1 clic ou Configuration et activation du matériel.
- Autoriser le microphone dans la fenêtre du navigateur : sans cette autorisation, les appels audio ne peuvent pas démarrer.
- Utiliser Tester le son pour vérifier le rendu audio et la sonnerie d'appel.
- Si le microphone est bloqué, cliquer sur le cadenas de la barre d'adresse, remettre Microphone et Notifications sur Autoriser, puis actualiser la page.
- Ouvrir Discussions et Appels pour les messages d'équipe, les messages privés, les appels audio, les conférences et le journal des appels.
- Ne pas appeler directement le DG ou le PDG ; laisser un message dans la conversation prévue.
- Porter un casque avec micro et couper le micro ou quitter l'appel en fin de réunion.
