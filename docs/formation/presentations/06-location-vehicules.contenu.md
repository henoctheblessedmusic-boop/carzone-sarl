# Contenu du support - 06. Location de véhicules (GESTIONNAIRE_LOCATION, COMMERCIAL)

## Slide 1 - Couverture
- Logo CARZONE. Titre : "Formation CARZONE Ops - Location de véhicules"
- Sous-titre : "GESTIONNAIRE DE LA LOCATION - COMMERCIAL"

## Slide 2 - Sommaire
- Le parc de location : un périmètre distinct du showroom
- Rappel de connexion
- Procédure : créer un contrat de location
- Procédure : encaisser et suivre un contrat
- Procédure : gérer la restitution d'un véhicule
- Procédure : planifier un entretien du parc de location
- Sécurité et confidentialité
- Erreurs fréquentes
- Exercice guidé
- Récapitulatif et contacts

## Slide 3 - Objectifs pédagogiques
- Comprendre que le parc de location (LCD/LLD/LOA) est distinct du stock showroom.
- Savoir créer un contrat de location complet et le faire signer.
- Savoir enregistrer un encaissement et gérer une restitution.
- Savoir planifier un entretien pour un véhicule du parc.

## Slide 4 - Le parc de location : un périmètre distinct
- `fleetType = RENTAL` : parc séparé du stock de vente (`SHOWROOM`).
- Statuts de disponibilité : Disponible / Loué / Maintenance / Hors service.
- Le rôle GESTIONNAIRE_LOCATION ne voit QUE ce périmètre (accès restreint par conception).
- Le rôle COMMERCIAL peut aussi proposer la location à ses clients, en complément de la vente.

## Slide 5 - Rappel de connexion
1. https://carzone-sarl.vercel.app/login
2. Email + mot de passe du compte de test.
3. **Se connecter**.

*Capture intégrée : `captures/gestionnaire-location/01-connexion.png`.*

## Slide 6 - Vue du menu restreint (Gestionnaire de la location)
- Menu : Clients, Discussions, Catalogue pièces, Location - rien d'autre, par conception.

*Capture intégrée : `captures/gestionnaire-location/02-menu-restreint.png`.*

## Slide 7 - Procédure : créer un contrat de location
1. Menu **Location** -> nouveau contrat.
2. Client, véhicule, dates de début/fin, tarif journalier ou mensuel, caution.
3. Signature numérique client + société.

*Capture intégrée : `captures/gestionnaire-location/03-nouveau-contrat.png`, pastilles sur
dates et tarif.*

## Slide 8 - Procédure : encaisser et suivre un contrat
1. Depuis le contrat, ajouter un encaissement (montant, mode de paiement, référence).
2. Suivre les contrats arrivant à échéance.

## Slide 9 - Procédure : gérer la restitution
1. Renseigner l'état de sortie du véhicule au départ.
2. À la restitution, renseigner l'état de retour et comparer.

## Slide 10 - Procédure : planifier un entretien du parc
1. Depuis la fiche véhicule ou le contrat, planifier un entretien/réparation (type, coût,
   garage, date).

## Slide 11 - Sécurité et confidentialité
- Ne jamais afficher la caution ou les données bancaires du client à l'écran en public.
- Vérifier systématiquement l'état du véhicule (sortie et retour) pour éviter les litiges.

## Slide 12 - Erreurs fréquentes
- Essayer d'accéder à une page hors du périmètre location (bloqué par conception, ce n'est
  pas une erreur de manipulation).
- Créer un contrat sans caution alors que la politique interne l'exige.
- Oublier de renseigner l'état de sortie avant la remise au client.

## Slide 13 - Exercice guidé
1. Se connecter avec son compte de test.
2. Citer le statut d'un contrat de location.
3. Vérifier le menu restreint pour GESTIONNAIRE_LOCATION.
4. Se déconnecter.

## Slide 14 - Récapitulatif
- Je sais créer un contrat de location et le faire signer.
- Je sais encaisser et suivre un contrat.
- Je sais gérer une restitution avec comparaison d'état.
- Je sais planifier un entretien du parc de location.

## Slide 15 - Contacts / support
- Support technique interne CARZONE SARL.
- Fiches individuelles : `../roles/gestionnaire-location.md`, `commercial.md`.
