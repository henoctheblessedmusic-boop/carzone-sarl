# Qualité des données véhicules

Date : 2026-11-09

## Champs obligatoires

### Création manuelle en stock

Le formulaire exige désormais :

- la marque ;
- le modèle ;
- le prix de vente supérieur à zéro ;
- le VIN pour un véhicule saisi à l'unité ;
- la quantité entre 1 et 50.

Pour une quantité supérieure à 1, le VIN doit rester vide. Chaque unité est créée séparément et son VIN peut être renseigné ensuite dans sa fiche.

Ces contrôles existent dans l'interface et dans l'action serveur.

### Commande d'import

Le formulaire exige désormais :

- la marque ;
- le modèle ;
- le coût d'import supérieur à zéro ;
- la quantité entre 1 et 50.

Une commande sans marque, sans modèle ou avec un coût nul est refusée. Cela empêche la création de lignes `Marque à préciser` ou `0 FCFA`.

La marque et le modèle peuvent venir du catalogue ou être saisis en texte libre.

## Suppression des données irrégulières

### Véhicules

Les rôles suivants peuvent supprimer un véhicule depuis le stock :

- DEVELOPER ;
- PDG ;
- SG ;
- DG ;
- DC ;
- ADMIN.

La suppression simple refuse de casser un devis ou une facture proforma. Une suppression forcée existe dans le modal de suppression avec confirmation saisie.

### Commandes d'import

Les rôles suivants peuvent supprimer une commande d'import et ses véhicules liés :

- DEVELOPER ;
- PDG ;
- SG ;
- DG ;
- DC ;
- ADMIN.

Le bouton `Supprimer` est disponible dans la colonne Action de la page Import. Une confirmation navigateur est demandée.

La suppression est refusée si un véhicule de la commande est lié à :

- un devis ou une facture ;
- une location ;
- un ordre de réparation ou un bon de livraison facturé.

Les rattachements non fiscaux sont détachés avant suppression.

Chaque suppression est enregistrée dans le journal d'audit.

## Données existantes

Les lignes déjà créées avant cette règle ne sont pas supprimées automatiquement.

Un directeur, un administrateur ou un développeur peut maintenant :

- supprimer un véhicule irrégulier depuis le stock ;
- supprimer une commande d'import irrégulière et ses véhicules depuis la page Import.

## Vérifications

- `npx tsc --noEmit` : OK ;
- `npm run build` : OK ;
- `npm run check:no-em-dash` : OK.


## Tests de production

- Formulaire Import accessible avec un compte ADMIN : OK.
- Champs marque, modèle, coût et quantité rendus obligatoires : OK.
- Bouton Supprimer visible pour ADMIN : OK.
- Suppression réelle d'une commande d'import de test et de son véhicule depuis l'interface : OK.
- Vérification après suppression : 0 commande et 0 véhicule restants.
- Compte de test et données de test supprimés.
