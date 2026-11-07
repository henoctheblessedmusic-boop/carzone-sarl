# Fiche de rôle - Gestionnaire de stock garage

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

Le Gestionnaire de stock garage gère les pièces détachées et leurs mouvements (entrées,
sorties atelier, retours, ajustements d'inventaire) pour l'atelier SAV.

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Atelier, Catalogue pièces, Pièces & Références,
  Journal d'audit.
- Créer/modifier une pièce (référence, désignation, emplacement, quantité en stock, seuil
  d'alerte, prix d'achat/vente).
- Enregistrer un mouvement de stock (entrée achat, sortie atelier, retour, ajustement
  d'inventaire).
- Gérer les références croisées et compatibilités véhicule/pièce.

## 3. Ce qu'il ne peut pas faire

- Pas d'accès aux devis/factures, aux véhicules showroom, aux RH, à la gestion des
  comptes/rôles.
- Si une page redirige vers le tableau de bord, ce n'est pas une erreur de manipulation :
  contacter le support.

## 4. Parcours de connexion pas à pas

1. https://carzone-sarl.vercel.app/login
2. Utiliser le compte de formation fourni par le formateur.
3. **Se connecter**.
4. Tableau de bord, puis menu **Pièces & Références**.

*Capture disponible : `captures/stock-garage/01-connexion.png`,
`captures/stock-garage/02-menu-pieces.png`.*

## 5. Tâches quotidiennes, avec étapes et captures

### a) Enregistrer une entrée de pièces (achat)
1. Menu **Pièces & Références** -> sélectionner la pièce.
2. Ajouter un mouvement "Entrée achat" (quantité, prix unitaire, référence du bon de commande).

*Capture disponible : `captures/stock-garage/03-mouvement-stock.png`, pastille sur le type de
mouvement.*

### b) Sortir une pièce pour un ordre de réparation
1. Depuis l'ordre de réparation (visible dans **Atelier**), ou directement dans **Pièces &
   Références**, enregistrer une "Sortie atelier" liée à l'OR.
2. Vérifier que le stock disponible diminue en conséquence.

### c) Suivre les seuils d'alerte
1. Menu **Pièces & Références** -> repérer les pièces sous le seuil d'alerte de
   réapprovisionnement.

## 6. Tâches hebdomadaires ou ponctuelles

- Inventaire hebdomadaire des pièces à rotation rapide (freinage, filtration).
- Ajustement ponctuel d'inventaire après un écart constaté physiquement.
- Mise à jour ponctuelle des références croisées et compatibilités véhicule.

## 7. Erreurs fréquentes et réflexes

- Oublier d'enregistrer une sortie atelier : fausse le stock réel et la facturation des
  pièces.
- Créer une pièce en double au lieu de vérifier les références croisées existantes.
- Ignorer une alerte de seuil bas jusqu'à la rupture de stock.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test Stock Garage.
2. Ouvrir **Pièces & Références** et citer une pièce sous son seuil d'alerte (ou constater
   qu'il n'y en a pas).
3. Citer le type d'un mouvement de stock récent (entrée/sortie/retour/ajustement).
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais enregistrer une entrée et une sortie de pièces.
- [ ] Je sais repérer une pièce sous son seuil d'alerte.
- [ ] Je sais gérer une référence croisée.
- [ ] Je sais que je n'ai pas accès aux devis/factures ni au stock showroom.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/05-atelier-stock-garage`

- `presentations/roles/stock-garage.pptx` : support court dédié à ce rôle.
