# Vérification du kit de formation CARZONE SARL Ops

## 1. Livrables

- 20 fiches de rôle dans `roles/`.
- 9 présentations PowerPoint par famille de métiers dans `presentations/`.
- 20 présentations courtes par rôle dans `presentations/roles/`.
- 67 captures d'écran réelles dans `captures/`.
- Guide formateur, matrice des accès et carte des fonctionnalités (`features-par-module.md`).

Total : 29 fichiers PowerPoint, 380 slides, 186 images intégrées.

## 2. Vérifications effectuées

- Les 29 fichiers `.pptx` ont été ouverts par PowerPoint : 29 réussites, 0 échec.
- Nombre total de slides ouvertes : 380.
- Animations d'entrée : 1 004 effets ajoutés, transitions douces sur les slides. Lancer le diaporama avec F5 pour les voir.
- Chaque deck possède une page de couverture avec le logo CARZONE, un contenu de formation et des captures réelles.
- Les 20 fiches de rôle et les 9 contenus de modules ont été relus et reliés aux supports.
- Trois procédures de communication sont incluses dans chaque deck : cloche de notifications, autorisations micro/audio/navigateur, messages et appels.
- Les captures d'écran ont été prises sur l'application réelle avec des comptes de démonstration par rôle.
- Aucun mot de passe n'est visible dans les captures.
- Tous les comptes de démonstration utilisés pour les captures ont été supprimés de la base après la session.
- Contrôle du tiret cadratin U+2014 dans `docs/formation` : aucune occurrence.

## 3. Captures

Les captures sont classées par rôle :

- `captures/commun/` : connexion, tableau de bord, menu latéral.
- `captures/<role>/` : 3 captures par rôle, viewport 1600 x 1000.
- `captures/commun/` contient aussi les captures de la cloche, de la configuration micro/audio et de la messagerie/appels.
- Les captures montrent l'interface réelle de production et les données disponibles au moment de la formation.

## 4. Comptes de test

Tous les comptes temporaires de démonstration ont servi uniquement aux captures. Ils ont été supprimés après la prise de vue. Pour une nouvelle session, le formateur doit créer des comptes
de démonstration avec les droits correspondants, puis les désactiver après la session.

## 5. Limites et précautions

- Les données affichées dans les captures sont des données réelles de l'application au moment
  de la formation. Ne pas les diffuser en dehors de l'entreprise.
- Les fiches doivent être relues par le responsable métier avant diffusion officielle.
- Les procédures concernant les annulations, la facturation et les données clients doivent être
  validées par la direction et la comptabilité.
- Le contenu est en français ; les libellés de l'application peuvent évoluer après une mise à
  jour.

## 6. Régénération

Depuis la racine du projet :

```bash
python docs/formation/generate_pptx.py
powershell -ExecutionPolicy Bypass -File docs/formation/apply_animations.ps1
```

Le second script ajoute les animations d'entrée. Les transitions et animations sont visibles en mode Diaporama (F5), pas en mode édition.

Le script reconstruit les 29 présentations à partir des contenus `*.contenu.md`, des fiches de
rôle et des captures.
