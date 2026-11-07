# Matrice rôles / accès / modules / support - CARZONE SARL Ops

Ce tableau est construit à partir du code source réel de l'application (et non d'une estimation) :

- `apps/web/src/lib/roles.ts` (liste des rôles et libellés)
- `apps/web/src/lib/role-service.ts` (matrice de permissions `ROLE_PERMISSIONS` et garde de routes `RoleService`)
- `apps/web/src/components/AppShell.tsx` (liste `navDefs` : menu affiché selon le rôle)

Il reflète l'état du code au moment de la rédaction. En cas de doute sur un accès précis, le code ci-dessus reste la source de vérité (les captures d'écran annotées viendront confirmer ou corriger ce tableau lors d'une prochaine session disposant d'un accès navigateur).

## Note importante : trois niveaux de contrôle, parfois légèrement désynchronisés

L'application contrôle les accès à trois niveaux indépendants :

1. **Le menu (navigation)** : ce qui s'affiche dans la barre latérale pour un rôle donné.
2. **La page elle-même** : certaines pages vérifient à nouveau le rôle ou les permissions à l'ouverture.
3. **Le serveur (middleware + moteur de permissions)** : la vérification finale, qui redirige automatiquement vers le tableau de bord si l'accès n'est pas autorisé.

Ces trois niveaux sont normalement alignés, mais quelques écarts existent encore dans l'application (un lien de menu visible qui redirige vers le tableau de bord, ou une page accessible par adresse directe mais absente du menu). **Règle à enseigner à tous les rôles : si un clic sur un lien du menu renvoie automatiquement au tableau de bord, ce n'est pas une erreur de manipulation - l'accès n'est simplement pas activé pour ce compte. Il faut contacter un Administrateur, le DG ou le PDG, et ne pas réessayer en boucle.**

## Tableau synthétique

| Rôle (code) | Libellé | Modules visibles dans le menu | Peut exporter le bilan financier | Peut gérer les comptes/rôles | Support de formation |
|---|---|---|---|---|---|
| PDG | Président Directeur Général | Tous les modules, sans exception | Oui | Oui | 01-direction-gouvernance.pptx |
| DG | Directeur Général | Tous les modules, sans exception | Oui | Oui | 01-direction-gouvernance.pptx |
| ADV | Administration des Ventes | Clients, Discussions, Atelier, Pièces & Références, Stock véhicules, Devis & proformas, Factures & règlements, Bons de livraison, Dépenses, Articles & services, Équipe & Rôles, Boîte mail (accès serveur total, y compris les pages hors menu) | Oui | Oui | 01-direction-gouvernance.pptx |
| RF | Responsable Financier | Clients, Discussions, Atelier, Pièces & Références, Stock véhicules, Devis & proformas, Factures & règlements, Bons de livraison, Dépenses, Articles & services, RH, Boîte mail (accès serveur total) | Oui | Non (pas de gestion des rôles) | 01-direction-gouvernance.pptx / 03-comptabilite.pptx |
| RTA | Responsable Technique Atelier | Clients, Discussions, Atelier, Pièces & Références, Stock véhicules, Devis & proformas, Articles & services, Équipe & Rôles | Non | Oui | 05-atelier-stock-garage.pptx |
| DC | Directeur Commercial | Clients, Discussions, Atelier (lecture), Catalogue pièces, Pièces & Références, Stock véhicules, Devis & proformas, Articles & services, Équipe & Rôles, Pipeline commercial | Non | Oui | 02-commerce-adv-accueil.pptx |
| CHEF_ATELIER | Chef d'Atelier | Clients, Discussions, Atelier, Pièces & Références, Stock véhicules, Devis & proformas, Factures & règlements | Non | Non | 05-atelier-stock-garage.pptx |
| COMMERCIAL | Commercial(e) | Clients, Discussions, Catalogue pièces, Pièces & Références, Stock véhicules, Devis & proformas, Factures & règlements, Articles & services, Pipeline, Prospects, Boîte mail, Location, Flotte, Installateurs bornes, Devis bornes | Non | Non | 02-commerce-adv-accueil.pptx / 06-location-vehicules.pptx |
| HOTESSE | Hôtesse d'Accueil | Clients, Discussions, Stock véhicules, Devis & proformas, Factures & règlements, Articles & services, Boîte mail | Non | Non | 02-commerce-adv-accueil.pptx |
| ASSISTANTE_COMPTABLE | Assistante Comptable | Clients, Discussions, Atelier, Stock véhicules, Devis & proformas, Factures & règlements, Dépenses, Articles & services, RH, Boîte mail | Non | Non | 03-comptabilite.pptx |
| GESTIONNAIRE_LOCATION | Gestionnaire de la location | Clients, Discussions, Catalogue pièces, Location (parc + contrats) **uniquement** - accès serveur volontairement restreint à ce périmètre, même en tapant une autre adresse | Non | Non | 06-location-vehicules.pptx |
| COMPTA | Comptabilité (comptable principale) | Clients, Discussions, Atelier, Catalogue pièces, Supervision garage, Pièces & Références, Stock véhicules, Devis & proformas, Factures & règlements, Bons de livraison, Journal d'audit, Dépenses, Articles & services, RH, Pipeline, Prospects, Boîte mail, Location, Bornes & abonnements, Import | Oui | Non (pas de gestion des rôles) | 03-comptabilite.pptx |
| COMPTA_GARAGE | Comptable Garage | Clients, Discussions, Atelier, Supervision garage, Pièces & Références, Devis & proformas, Factures & règlements, Bons de livraison, Journal d'audit (périmètre GARAGE uniquement - jamais les documents Showroom) | Oui | Non | 03-comptabilite.pptx / 05-atelier-stock-garage.pptx |
| STOCK | Gestionnaire de stock showroom | Clients, Discussions, Stock véhicules, Articles & services, Catalogue & fournisseurs, Import | Non | Non | 04-stock-showroom-import.pptx |
| STOCK_GARAGE | Gestionnaire de stock garage | Clients, Discussions, Atelier, Catalogue pièces, Pièces & Références, Journal d'audit | Non | Non | 05-atelier-stock-garage.pptx |
| ATELIER | Technicien Atelier | Clients, Discussions, Atelier, Pièces & Références, Stock véhicules (lecture) | Non | Non | 05-atelier-stock-garage.pptx |
| BORNES_OPS | Bornes & Énergie | Clients, Discussions, Boîte mail, Flotte, Installateurs bornes, Devis bornes, Bornes & abonnements, Terminal borne | Non | Non | 08-bornes-installateurs.pptx |
| INSTALLATEUR | Installateur Partenaire | Clients, Discussions, Installateurs bornes (son profil), Devis bornes (ses devis uniquement - visibilité limitée à son propre compte) | Non | Non | 08-bornes-installateurs.pptx |
| ADMIN | Administrateur (Véhicules & Messages) | Clients, Discussions, Atelier, Supervision garage, Pièces & Références, Stock véhicules, Devis & proformas, Factures & règlements, Bons de livraison, Journal d'audit, Dépenses, Articles & services, RH, Équipe & Rôles, Pipeline, Prospects, Boîte mail, Flotte | Non | Oui | 04-stock-showroom-import.pptx / 07-rh-administration.pptx |

## Modules communs à tous les rôles connectés

Quel que soit le rôle, chaque compte voit toujours : **Tableau de bord**, **Clients**, **Discussions & Appels** (messagerie interne). C'est la base commune enseignée dans `00-accueil-formation-commune.pptx`.

## Détail des permissions "métier" (hors navigation)

Ce tableau indique les capacités accordées par le moteur de permissions (`RoleService`), qui ne sont pas toujours visibles dans le menu mais peuvent conditionner un bouton ou une action dans une page :

| Rôle | Devis (lecture/écriture/suppression) | Factures | Stock véhicules | Atelier | Dépenses | RH | Bornes/Installateurs |
|---|---|---|---|---|---|---|---|
| PDG / DG | Oui / Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui |
| ADV | Oui / Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui |
| RF | Oui / Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui |
| RTA | Oui / Oui / Oui | Non | Oui / Oui | Oui / Oui | Non | Non | Non |
| DC | Oui / Oui / Oui | Non | Oui / Oui | Oui / Non (lecture) | Non | Non | Non |
| CHEF_ATELIER | Oui / Oui / Non | Oui / Oui | Oui / Non (lecture) | Oui / Oui | Non | Non | Non |
| COMMERCIAL | Oui / Oui / Non | Oui / Oui | Oui / Non (lecture) | Non | Non | Non | Lecture installateurs |
| HOTESSE | Oui / Oui / Non | Oui / Oui | Oui / Non (lecture) | Non | Non | Non | Non |
| ASSISTANTE_COMPTABLE | Oui / Oui / Non | Oui / Oui | Oui / Non (lecture) | Oui / Oui | Oui / Oui | Oui / Oui | Non |
| GESTIONNAIRE_LOCATION | Non | Non | Oui / Non (lecture) | Non | Non | Non | Non |
| COMPTA | Oui / Oui / Oui | Oui / Oui | Oui / Non (lecture) | Oui / Non (lecture) | Oui / Oui | Oui / Oui | Lecture bornes |
| COMPTA_GARAGE | Oui / Oui / Non (périmètre GARAGE) | Oui / Oui (GARAGE) | Oui / Non (lecture) | Oui / Oui | Non | Non | Non |
| STOCK | Non | Non | Oui / Oui | Non | Non | Non | Non |
| STOCK_GARAGE | Non | Non | Non | Oui / Oui | Non | Non | Non |
| ATELIER | Non | Non | Oui / Non (lecture) | Oui / Oui | Non | Non | Non |
| BORNES_OPS | Non | Non | Non | Non | Non | Non | Oui / Oui |
| INSTALLATEUR | Non | Non | Non | Non | Non | Non | Lecture (ses devis) |
| ADMIN | Oui / Oui / Non | Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui | Oui / Oui | Non |

## Sources utilisées

- `apps/web/src/lib/roles.ts`
- `apps/web/src/lib/role-service.ts`
- `apps/web/src/components/AppShell.tsx`
- `apps/web/src/lib/i18n/messages/fr.ts` (libellés des modules en français)

## Limite de cette version

Cette matrice a été établie par lecture directe du code (source la plus fiable disponible), **sans vérification visuelle en conditions réelles** (connexion effective à chacun des 20 comptes de test), car l'environnement d'exécution de cette session ne permettait pas d'accéder au navigateur ni à la base de données de production (voir `docs/formation/verification.md` pour le détail). Une vérification de terrain, rôle par rôle, reste recommandée avant la diffusion officielle du kit.
