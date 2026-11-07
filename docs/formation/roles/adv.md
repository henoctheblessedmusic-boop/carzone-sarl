# Fiche de rôle - ADV (Administration des Ventes)

Compte de démonstration : fourni temporairement par le formateur.

## 1. Objectif du poste dans le logiciel

L'ADV sécurise et administre le circuit des ventes : suivi des devis/proformas, des factures,
des bons de livraison et des dépenses, en lien avec la direction. Techniquement, ADV a un
niveau d'accès serveur aussi large que la direction (permissions complètes), mais le **menu**
qui lui est présenté reste centré sur les documents commerciaux et administratifs, pas sur le
pilotage global (pas de pipeline, pas de bornes, pas de flotte dans son menu).

## 2. Ce que le rôle peut voir et faire

- Menu affiché : Clients, Discussions, Atelier, Pièces & Références, Stock véhicules, Devis &
  proformas, Factures & règlements, Bons de livraison, Dépenses, Articles & services, Équipe
  & Rôles, Boîte mail.
- Peut exporter le bilan financier et gérer les comptes/rôles.
- Peut annuler en interne un devis ou une facture (motif obligatoire).
- Peut, en tapant l'adresse directement, atteindre d'autres pages (RH, pipeline, catalogue
  fournisseurs...) car ses permissions serveur sont complètes - mais ce n'est pas l'usage
  attendu au quotidien.

## 3. Ce qu'il ne peut pas faire

- Rien n'est techniquement bloqué côté serveur, mais l'usage attendu reste le périmètre du
  menu ci-dessus : ne pas se substituer aux équipes RH ou commerciales pour les tâches qui ne
  relèvent pas de l'administration des ventes.
- Si un écran hors de ce périmètre se comporte anormalement, ne pas insister : ce n'est pas
  l'usage prévu de ce compte, en parler au support ou à la direction.

## 4. Parcours de connexion pas à pas

1. Ouvrir https://carzone-sarl.vercel.app/login
2. Email : le compte de formation - Mot de passe : le mot de passe fourni par le formateur.
3. Cliquer sur **Se connecter**.
4. En cas d'échec répété, respecter le délai de blocage affiché.
5. Tableau de bord affiché avec nom, rôle, menu listé en section 2.

Captures disponibles : `captures/adv/01-ecran-connexion.png`, `captures/adv/02-menu.png`.

## 5. Tâches quotidiennes, avec étapes et captures

### a) Suivre les devis et proformas
1. Menu **Devis & proformas**.
2. Vérifier les statuts : Brouillon -> Proforma envoyée -> Commande confirmée -> Facture
   normalisée.
3. Relancer si un devis reste trop longtemps "Proforma envoyée".

*Capture disponible : `captures/adv/03-liste-devis-statuts.png`, pastilles numérotées sur chaque
statut.*

### b) Suivre les factures et règlements
1. Menu **Factures & règlements**.
2. Vérifier les factures non soldées et leur ancienneté.

### c) Suivre les bons de livraison internes
1. Menu **Bons de livraison**.
2. Vérifier la cohérence entre un bon de livraison et la facture/le devis d'origine.

## 6. Tâches hebdomadaires ou ponctuelles

- Contrôle hebdomadaire des dépenses enregistrées (**Dépenses**).
- Vérification ponctuelle des comptes utilisateurs actifs (**Équipe & Rôles**).
- Export ponctuel du bilan financier à la demande de la direction.

## 7. Erreurs fréquentes et réflexes

- Vouloir annuler un devis/une facture sans motif : impossible, c'est volontaire.
- Confondre bon de livraison (document interne, non fiscal) et facture (document fiscal) :
  toujours vérifier le type de document avant de le transmettre à un client.
- Essayer d'ouvrir une page absente du menu "parce qu'on devrait pouvoir" : vérifier d'abord
  dans `matrice-roles-acces.md` si c'est prévu pour ce rôle.

## 8. Exercice pratique noté

1. Se connecter avec le compte de test ADV.
2. Ouvrir **Devis & proformas** et citer le statut d'un devis.
3. Ouvrir **Factures & règlements** et identifier une facture non soldée (ou constater qu'il
   n'y en a pas).
4. Se déconnecter.

Barème suggéré : 3 points, note de passage 2/3.

## 9. Checklist de fin de formation

- [ ] Je sais me connecter/déconnecter.
- [ ] Je connais les 4 statuts d'un devis/proforma.
- [ ] Je sais consulter les factures et règlements.
- [ ] Je sais consulter les bons de livraison.
- [ ] Je connais la règle : jamais d'annulation sans motif.

## 10. Slides / supports associés

- `presentations/00-accueil-formation-commune`
- `presentations/01-direction-gouvernance`

- `presentations/roles/adv.pptx` : support court dédié à ce rôle.

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
