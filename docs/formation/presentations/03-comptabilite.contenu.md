# Contenu du support - 03. Comptabilité (COMPTA, ASSISTANTE_COMPTABLE, COMPTA_GARAGE, RF)

## Slide 1 - Couverture
- Logo CARZONE. Titre : "Formation CARZONE Ops - Comptabilité"
- Sous-titre : "COMPTA - ASSISTANTE COMPTABLE - COMPTA GARAGE - RF"

## Slide 2 - Sommaire
- Les deux périmètres comptables : Showroom et Garage
- Rappel de connexion
- Tableau de bord financier
- Procédure : du devis confirmé à la facture ou au bon de livraison
- Procédure : enregistrer un règlement
- Procédure : annuler un document (motif obligatoire)
- Procédure : superviser les coûts d'intervention garage
- Sécurité et confidentialité
- Erreurs fréquentes
- Exercice guidé
- Récapitulatif et contacts

## Slide 3 - Objectifs pédagogiques
- Comprendre la séparation entre comptabilité Showroom et comptabilité Garage.
- Savoir transcrire un devis confirmé en bon de livraison ou en facture normalisée.
- Savoir enregistrer un règlement et une dépense.
- Savoir appliquer la règle du motif obligatoire pour toute annulation.

## Slide 4 - Les deux périmètres comptables
- **Showroom** : vente de véhicules neufs. Numérotation des bons de livraison : BL-SHW-.
- **Garage** : atelier SAV, pièces, prestations. Numérotation : BL-GAR-.
- COMPTA_GARAGE ne voit jamais les documents Showroom : cloisonnement volontaire.
- COMPTA et RF voient les deux périmètres (vue consolidée).

## Slide 5 - Rappel de connexion
1. https://carzone-sarl.vercel.app/login
2. Email + mot de passe du compte de test.
3. **Se connecter**.

## Slide 6 - Le tableau de bord financier
- Indicateurs : facturé TTC, encaissé, créances à recouvrer, devis en attente, dépenses
  d'exploitation.

*Capture intégrée : `captures/compta/02-dashboard-financier.png`, pastilles sur chaque
indicateur.*

## Slide 7 - Procédure : du devis confirmé à la facture
1. Menu **Devis & proformas** -> repérer un devis "Commande confirmée".
2. Choisir la transcription : bon de livraison interne (non fiscal) ou facture normalisée
   (fiscale, certification MECeF).

*Capture intégrée : `captures/compta/03-transcription-facture.png`, pastilles sur le choix
"Bon de livraison interne" vs "Facture normalisée".*

## Slide 8 - Procédure : enregistrer un règlement
1. Menu **Factures & règlements** -> ouvrir la facture concernée.
2. Ajouter un règlement (montant, mode de paiement, référence).

*Capture intégrée : `captures/assistante-comptable/03-enregistrer-paiement.png`.*

## Slide 9 - Procédure : annuler un document en interne
1. Ouvrir le devis/la facture à annuler.
2. Saisir un motif obligatoire, confirmer.
3. L'action est tracée dans le **Journal d'audit**.

## Slide 10 - Procédure : superviser les coûts d'intervention garage
1. Menu **Supervision garage** -> vérifier les coûts soumis par le Chef d'Atelier
   (main-d'oeuvre, pièces, sous-traitance).
2. Valider ou renvoyer avec commentaire.

## Slide 11 - Sécurité et confidentialité
- Ne jamais afficher de données bancaires client à l'écran en public.
- Vérifier le numéro de facture avant d'enregistrer un règlement.
- Toujours motiver une annulation.

## Slide 12 - Erreurs fréquentes
- Confondre bon de livraison (non fiscal) et facture normalisée (fiscale).
- Enregistrer un règlement sur la mauvaise facture.
- Mélanger dépenses "Showroom" et "Garage".
- Chercher la page "Équipe & Rôles" (COMPTA/RF/COMPTA_GARAGE n'y ont pas accès, c'est normal).

## Slide 13 - Exercice guidé
1. Se connecter avec son compte de test (COMPTA/ASSISTANTE_COMPTABLE/COMPTA_GARAGE/RF).
2. Relever le montant des créances à recouvrer sur le tableau de bord.
3. Citer le statut d'un devis ou d'une facture.
4. Se déconnecter.

## Slide 14 - Récapitulatif
- Je connais la différence entre périmètre Showroom et périmètre Garage.
- Je sais transcrire un devis confirmé en bon de livraison ou facture.
- Je sais enregistrer un règlement.
- Je connais la règle du motif obligatoire pour toute annulation.

## Slide 15 - Contacts / support
- Support technique interne CARZONE SARL.
- Fiches individuelles : `../roles/compta.md`, `assistante-comptable.md`, `compta-garage.md`,
  `rf.md`.
