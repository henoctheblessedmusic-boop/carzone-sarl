# Fiche de rôle - Chef d'Atelier

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

Le Chef d'Atelier dirige l'activité quotidienne du SAV : ordres de réparation, devis et
factures atelier, suivi des véhicules clients en entretien.

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Atelier, Pièces & Références, Stock véhicules, Devis &
  proformas, Factures & règlements.
- Créer/modifier un ordre de réparation, un devis, une facture atelier.
- Consulter le stock véhicules (lecture uniquement).

## 3. Ce qu'il ne peut pas faire

- Ne peut pas supprimer un devis (seule la création/modification est autorisée pour ce rôle,
  pas la suppression).
- Pas d'accès aux dépenses, aux RH, aux bornes/installateurs, à la flotte/location, ni à
  l'export du bilan financier, ni à la gestion des comptes.
- **Point d'attention connu** : un lien "Articles & services" peut apparaître dans le menu,
  mais l'accès réel à cette page n'est pas garanti pour ce rôle. S'il redirige vers le tableau
  de bord, ce n'est pas une erreur de manipulation : signaler au support technique pour que
  l'accès soit vérifié/corrigé plutôt que de réessayer en boucle.

## 4. Parcours de connexion pas à pas

1. https://carzone-sarl.vercel.app/login
2. Utiliser le compte de formation fourni par le formateur.
3. **Se connecter**.
4. Tableau de bord, puis menu **Atelier**.

*Capture disponible : `captures/chef-atelier/01-connexion.png`,
`captures/chef-atelier/02-menu-atelier.png`.*

## 5. Tâches quotidiennes, avec étapes et captures

### a) Ouvrir et suivre un ordre de réparation
1. Menu **Atelier** -> nouvel ordre de réparation.
2. Renseigner véhicule, client, panne signalée, diagnostic.
3. Affecter un technicien, suivre jusqu'à la clôture.

*Capture disponible : `captures/chef-atelier/03-nouvel-or.png`, pastilles sur les champs
obligatoires.*

### b) Émettre un devis puis une facture atelier
1. Menu **Devis & proformas** -> créer un devis à partir de l'OR (pièces + main-d'oeuvre).
2. Envoyer la proforma au client.
3. Une fois la commande confirmée, suivre la facture dans **Factures & règlements**.

### c) Suivre les véhicules clients en cours d'entretien
1. Menu **Stock véhicules** ou fiche véhicule liée à l'OR, pour vérifier l'état du véhicule.

## 6. Tâches hebdomadaires ou ponctuelles

- Revue hebdomadaire des ordres de réparation ouverts et de leur durée d'immobilisation.
- Relance ponctuelle d'un client pour une facture atelier impayée.
- Signalement ponctuel d'un accès manquant au support technique.

## 7. Erreurs fréquentes et réflexes

- Vouloir supprimer un devis : impossible pour ce rôle, demander à un COMPTA/ADMIN/direction.
- Clôturer un ordre de réparation sans renseigner le diagnostic ni les pièces utilisées :
  nuit à la traçabilité et à la facturation.
- Cliquer sur "Articles & services" en boucle s'il ne s'ouvre pas : voir le point d'attention
  en section 3.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test Chef d'Atelier.
2. Ouvrir **Atelier** et citer le statut d'un ordre de réparation.
3. Ouvrir **Devis & proformas** et citer le statut d'un devis atelier.
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je sais ouvrir et suivre un ordre de réparation.
- [ ] Je sais créer un devis puis suivre la facture atelier.
- [ ] Je sais que je ne peux pas supprimer un devis.
- [ ] Je sais signaler un accès manquant au support plutôt que de réessayer en boucle.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/05-atelier-stock-garage`

- `presentations/roles/chef-atelier.pptx` : support court dédié à ce rôle.

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
