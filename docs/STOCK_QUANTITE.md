# Quantité de véhicules dans le stock et les imports

Date : 2026-11-08

## Entrée manuelle en stock

Le formulaire `Nouvelle entrée en stock` contient maintenant un champ `Nombre de véhicules`.

- valeur minimale : 1 ;
- valeur maximale : 50 ;
- chaque unité crée une ligne `Vehicle` distincte ;
- le suivi VIN, les ventes, les fiches techniques et les photos restent individuels ;
- le prix saisi est le prix unitaire, donc la valeur totale est multipliée par la quantité.

### VIN et quantité

Un VIN ne peut être associé qu'à un seul véhicule.

Pour une quantité supérieure à 1 :

- laisser le champ VIN vide ;
- renseigner les VIN individuels plus tard, véhicule par véhicule, dans la fiche de chaque unité.

Pour une quantité de 1, le VIN est obligatoire. Le formulaire bloque la soumission si un véhicule unique est saisi sans VIN, ou si une quantité supérieure à 1 est combinée à un VIN. L'action serveur applique les mêmes contrôles.

## Commande d'import

Le formulaire de création d'une commande d'import contient maintenant un champ `Nombre de véhicules`.

- valeur minimale : 1 ;
- valeur maximale : 50 ;
- la marque et le modèle sont obligatoires ;
- le coût d'import doit être supérieur à zéro ;
- la commande crée immédiatement autant de véhicules que la quantité demandée ;
- tous les véhicules sont liés à la même commande `ImportOrder` ;
- les changements de statut de la commande mettent à jour toutes les unités liées ;
- la colonne `Véhicules` du tableau affiche le nombre d'unités.

## Base de données

Champ ajouté :

```prisma
model ImportOrder {
  quantity Int @default(1)
}
```

Aucun champ de quantité n'a été ajouté à `Vehicle`, car chaque unité est une ligne distincte.

## Vérifications

- `npx tsc --noEmit` : OK ;
- `npm run build` : OK ;
- `npm run check:no-em-dash` : OK ;
- test d'intégration import : 3 unités créées pour une commande de quantité 3 ;
- test UI stock en production : 2 unités du même modèle créées depuis le modal, puis supprimées ;
- test UI import en production : commande de quantité 2, 2 véhicules liés créés puis supprimés ;
- données de test nettoyées après exécution ;
- test nettoyé après exécution ;
- build release mobile non concerné par cette modification web.
