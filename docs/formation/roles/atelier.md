# Fiche de rôle - Technicien Atelier

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

Le Technicien Atelier exécute les interventions (diagnostic, réparation, entretien) et
renseigne les ordres de réparation et fiches d'entretien dans l'application, y compris sur
tablette pour les signatures numériques.

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Atelier, Pièces & Références, Stock véhicules
  (lecture).
- Créer/modifier un ordre de réparation ou une fiche d'entretien systématique (checklist par
  palier kilométrique : 5000, 10000, 30000, 50000, 100000 km).
- Déclarer les pièces utilisées sur une intervention.
- Signer numériquement une intervention (signature technicien sur tablette).

## 3. Ce qu'il ne peut pas faire

- Pas d'accès aux devis/factures, aux dépenses, aux RH, à la gestion des comptes/rôles, ni à
  la modification du stock véhicules (lecture seule).
- Si une page redirige vers le tableau de bord, ce n'est pas une erreur de manipulation :
  contacter le support.

## 4. Parcours de connexion pas à pas

1. https://carzone-sarl.vercel.app/login
2. Utiliser le compte de formation fourni par le formateur.
3. **Se connecter**.
4. Tableau de bord, puis menu **Atelier**.

Captures disponibles : `captures/atelier/01-connexion.png`, `captures/atelier/02-menu-atelier.png`.

## 5. Tâches quotidiennes, avec étapes et captures

### a) Renseigner un ordre de réparation
1. Menu **Atelier** -> ouvrir l'OR assigné.
2. Renseigner la panne signalée, le diagnostic (moteur/transmission, suspension, électricité,
   autres), les heures de début/fin d'intervention.

*Capture disponible : `captures/atelier/03-diagnostic-or.png`, pastilles sur les sections de
diagnostic.*

### b) Compléter une fiche d'entretien systématique
1. Menu **Atelier** -> fiche d'entretien -> cocher chaque tâche de la checklist (effectué /
   non effectué / non applicable) selon le palier kilométrique du véhicule.
2. Ajouter une observation si une tâche n'est pas applicable.

### c) Déclarer les pièces utilisées et signer
1. Ajouter chaque pièce utilisée (quantité, référence).
2. Faire signer le client et signer en tant que technicien sur la tablette.

## 6. Tâches hebdomadaires ou ponctuelles

- Vérification hebdomadaire des OR en attente de pièces ("pièces à commander").
- Signalement ponctuel d'une panne complexe au Chef d'Atelier.

## 7. Erreurs fréquentes et réflexes

- Clôturer une intervention sans compléter la checklist d'entretien : incomplet pour la
  traçabilité et pour le client.
- Oublier de déclarer une pièce utilisée : fausse le stock et la facturation.
- Oublier la signature numérique : le document reste incomplet.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test Technicien Atelier.
2. Ouvrir un ordre de réparation et citer la panne signalée.
3. Citer une tâche de la checklist d'entretien systématique pour un palier donné.
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais renseigner un ordre de réparation.
- [ ] Je sais compléter une fiche d'entretien systématique.
- [ ] Je sais déclarer les pièces utilisées.
- [ ] Je sais faire signer numériquement une intervention.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/05-atelier-stock-garage`

- `presentations/roles/atelier.pptx` : support court dédié à ce rôle.

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
