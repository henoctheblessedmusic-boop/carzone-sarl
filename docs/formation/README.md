# Kit de formation CARZONE SARL Ops

Kit de formation interne pour l'application de gestion CARZONE SARL :
https://carzone-sarl.vercel.app

Public : utilisateurs novices, sans connaissance préalable du logiciel.
Langue : français. Devise : FCFA (XOF).

## 1. Contenu du kit

- `roles/` : 20 fiches de rôle, avec objectifs, accès, limites, procédures, erreurs fréquentes, exercice noté et checklist.
- `presentations/` : 9 présentations PowerPoint par famille de métiers.
- `presentations/roles/` : 20 présentations courtes dédiées à chaque rôle.
- `captures/` : captures d'écran réelles de l'application, classées par rôle.
- `matrice-roles-acces.md` : synthèse des accès par rôle.
- `verification.md` : vérifications effectuées et liste des livrables.

La formation couvre aussi la cloche de notifications, l'autorisation du microphone et du son dans le navigateur, les messages d'équipe, les appels audio, les conférences et le journal des appels. Ces trois procédures sont présentes dans chaque présentation.

## 2. Sessions recommandées

| Ordre | Session | Durée | Support | Rôles |
|---|---|---|---|---|
| 1 | Accueil, connexion, navigation | 45 min | `presentations/00-accueil-formation-commune.pptx` | Tous |
| 2 | Direction et gouvernance | 1h30 | `presentations/01-direction-gouvernance.pptx` | PDG, DG, ADV, RF, DC, ADMIN |
| 3 | Commerce, ADV, accueil | 1h30 | `presentations/02-commerce-adv-accueil.pptx` | COMMERCIAL, HOTESSE, ADV, DC |
| 4 | Comptabilité | 1h30 | `presentations/03-comptabilite.pptx` | COMPTA, ASSISTANTE_COMPTABLE, COMPTA_GARAGE, RF |
| 5 | Stock showroom et import | 1h | `presentations/04-stock-showroom-import.pptx` | STOCK, ADMIN |
| 6 | Atelier et stock garage | 1h30 | `presentations/05-atelier-stock-garage.pptx` | CHEF_ATELIER, RTA, ATELIER, STOCK_GARAGE |
| 7 | Location de véhicules | 1h | `presentations/06-location-vehicules.pptx` | GESTIONNAIRE_LOCATION, COMMERCIAL |
| 8 | RH et administration | 1h | `presentations/07-rh-administration.pptx` | RH, ADMIN |
| 9 | Bornes et installateurs | 1h | `presentations/08-bornes-installateurs.pptx` | BORNES_OPS, INSTALLATEUR |

Chaque session suit la même trame : connexion, visite guidée, procédures pas à pas, sécurité,
erreurs fréquentes, exercice, récapitulatif et contacts.

## 3. Fiches de rôle

Les 20 fiches sont dans `roles/` :

`pdg.md`, `dg.md`, `adv.md`, `rf.md`, `rh.md`, `rta.md`, `dc.md`, `chef-atelier.md`,
`commercial.md`, `hotesse.md`, `assistante-comptable.md`, `gestionnaire-location.md`,
`compta.md`, `compta-garage.md`, `stock.md`, `stock-garage.md`, `atelier.md`,
`bornes-ops.md`, `installateur.md`, `admin.md`.

Chaque fiche comporte :

1. objectif du poste dans le logiciel ;
2. ce que le rôle peut voir et faire ;
3. ce qu'il ne peut pas faire ;
4. parcours de connexion ;
5. tâches quotidiennes avec étapes ;
6. tâches hebdomadaires ou ponctuelles ;
7. erreurs fréquentes et réflexes ;
8. exercice pratique noté ;
9. checklist de fin de formation ;
10. supports associés.

## 4. Comptes de formation

Les captures ont été réalisées avec des comptes temporaires, puis ces comptes ont été supprimés.
Le formateur doit créer un compte de démonstration par rôle avant la session, avec les droits
correspondants, puis le désactiver ou le supprimer après la session.

Ne jamais utiliser un compte nominatif réel pour une manipulation de démonstration.

## 5. Sécurité et confidentialité

- Ne jamais partager son mot de passe.
- Ne jamais afficher un mot de passe ou une donnée bancaire client pendant une démonstration.
- Toute annulation de devis ou de facture doit porter un motif.
- Se déconnecter systématiquement sur un poste partagé.
- En cas de doute, demander avant d'agir.

## 6. Contacts et support

- Téléphones CARZONE : +229 01 92 61 61 61 / +229 01 63 70 00 00 / +229 01 92 62 62 62.
- Email : contact@topcarzone.com / direction@topcarzone.com.
- Support technique interne : voir contact IT CARZONE SARL.

## 7. Vérification

Voir `verification.md` pour le nombre de slides, les captures, l'ouverture des présentations et
la suppression des comptes de test.

## 8. Mode diaporama et animations

Les fichiers PowerPoint contiennent des transitions et des animations d'entrée sur les titres,
textes et captures. Pour les voir, ouvrir le fichier puis lancer le mode Diaporama avec F5
(ou Slide Show > From Beginning). Les animations se déclenchent au clic sur la slide. En mode
édition, PowerPoint n'affiche pas les animations.

Pour régénérer les supports puis les animations :

```bash
python docs/formation/generate_pptx.py
powershell -ExecutionPolicy Bypass -File docs/formation/apply_animations.ps1
```
