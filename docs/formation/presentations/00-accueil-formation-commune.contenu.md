# Contenu du support - 00. Accueil formation commune (tous les rôles)

Format cible : PowerPoint 16:9. Voir `README.md` pour la charte visuelle et les raisons pour
lesquelles ce contenu est livré en script détaillé plutôt qu'en `.pptx` binaire dans cette
version.

## Slide 1 - Couverture
- Logo CARZONE (`apps/web/public/brand/carzone-logo.png`) centré.
- Titre : "Formation CARZONE Ops - Module commun"
- Sous-titre : "Connexion, navigation, vocabulaire, sécurité, aide"
- Bandeau bas de page : "CARZONE SARL - Cotonou, Bénin"

## Slide 2 - Sommaire
- Pourquoi cette formation
- Se connecter et se déconnecter
- Le tableau de bord et le menu
- Le vocabulaire de l'application
- Sécurité et confidentialité
- Erreurs fréquentes
- Exercice guidé
- Où trouver de l'aide

## Slide 3 - Objectifs pédagogiques
- Se connecter et se déconnecter en toute sécurité.
- Reconnaître les éléments communs à tous les écrans (menu, tableau de bord, cloche de
  notifications, bouton d'aide).
- Comprendre le vocabulaire métier utilisé dans l'application (devis, proforma, facture, bon
  de livraison, ordre de réparation...).
- Connaître les règles de sécurité de base et savoir où demander de l'aide.

## Slide 4 - Rappel de connexion (procédure pas à pas)
1. Ouvrir un navigateur web.
2. Aller sur https://carzone-sarl.vercel.app/login
3. Saisir son **Email** professionnel fourni par l'IT.
4. Saisir son **Mot de passe**.
5. Cliquer sur **Se connecter**.

*Capture intégrée : `captures/commun/01-ecran-connexion.png` - cadrer les deux champs
(Email, Mot de passe) et le bouton "Se connecter", avec une pastille numérotée 1-2-3 sur
chaque élément dans l'ordre de saisie.*

## Slide 5 - En cas d'échec de connexion
- Message "Identifiants invalides" : vérifier l'orthographe de l'email (pas d'espace) et la
  casse du mot de passe.
- Après plusieurs échecs, le compte est bloqué temporairement, avec une durée croissante :
  1 minute, puis 5, puis 10, puis 1 heure, puis 24 heures.
- **Réflexe à retenir : attendre le délai affiché, ne jamais réessayer en boucle.**

## Slide 6 - Le tableau de bord
- Premier écran après connexion : indicateurs clés selon le rôle (clients, prospects, stock,
  factures, tâches...).
- Nom et rôle de l'utilisateur affichés en haut de l'écran.
- Bouton **Déconnexion** toujours visible.

*Capture intégrée : `captures/commun/02-tableau-de-bord-generique.png` - cadrer l'en-tête
(nom/rôle/déconnexion) et la première ligne d'indicateurs.*

## Slide 7 - Le menu de navigation
- Le menu affiché dépend du rôle connecté : chaque personne ne voit que les modules dont elle
  a besoin.
- Modules communs à tous : Tableau de bord, Clients, Discussions & Appels.
- Les autres modules apparaissent selon le rôle (voir la fiche de rôle individuelle et
  `matrice-roles-acces.md`).

*Capture intégrée : `captures/commun/03-menu-lateral.png` avec une flèche pointant vers le
menu latéral.*

## Slide 8 - La cloche de notifications et le bouton Aide
- La cloche (visible pour certains rôles : direction, Comptabilité, Administrateur) signale les
  connexions et événements de sécurité.
- Le bouton **Aide** (en haut de l'écran) ouvre le centre d'aide et la documentation CARZONE
  Ops à tout moment.

## Slide 9 - Vocabulaire essentiel
- **Prospect / Lead** : contact commercial pas encore client.
- **Opportunité** : affaire commerciale en cours (étapes : prospect -> devis envoyé ->
  commande confirmée).
- **Devis / Proforma** : proposition commerciale avant facturation (statuts : Brouillon ->
  Proforma envoyée -> Commande confirmée -> Facture normalisée).
- **Facture normalisée** : document fiscal final, avec certification MECeF au Bénin.
- **Bon de livraison interne** : document de déstockage non fiscal, différent d'une facture.
- **Ordre de réparation (OR)** : intervention atelier, avec diagnostic, pièces, main-d'oeuvre.
- **FCFA (XOF)** : devise utilisée dans toute l'application.

## Slide 10 - Sécurité et confidentialité
- Ne jamais partager son mot de passe, même avec un collègue du même service.
- Ne jamais afficher un mot de passe ou une donnée bancaire client à l'écran lors d'une
  démonstration publique.
- Toute annulation de devis/facture exige un motif : ce n'est jamais une suppression
  silencieuse.
- Se déconnecter systématiquement sur un poste partagé.

## Slide 11 - Erreurs fréquentes (tous rôles)
- Réessayer en boucle un lien qui redirige vers le tableau de bord : signe que l'accès n'est
  pas activé pour ce compte, pas une erreur de manipulation - contacter le support.
- Créer un doublon de fiche client sans avoir recherché au préalable.
- Oublier de se déconnecter sur un poste partagé.

## Slide 12 - Exercice guidé (commun)
1. Se connecter avec son compte de test.
2. Identifier le nom et le rôle affichés en haut de l'écran.
3. Citer trois modules visibles dans son menu.
4. Ouvrir le centre d'aide puis le refermer.
5. Se déconnecter.

## Slide 13 - Récapitulatif
- Je sais me connecter/déconnecter et gérer un blocage temporaire.
- Je sais lire mon tableau de bord et mon menu.
- Je connais le vocabulaire de base de l'application.
- Je connais les règles de sécurité essentielles.

## Slide 14 - Contacts / support
- Support technique interne CARZONE SARL (voir contact IT).
- Téléphones : +229 01 92 61 61 61 / +229 01 63 70 00 00 / +229 01 92 62 62 62.
- Email : contact@topcarzone.com / direction@topcarzone.com.
- Pour la suite : rejoindre la session de formation correspondant à son rôle (voir
  `../README.md`, section 3, tableau des sessions).
