# Étape 2 - Choix de l'approche Android

Date : 2026-11-07
Périmètre : application web CARZONE SARL Ops, 54 pages, 16 routes API, server actions Next.js.
Statut : recommandation à valider. Aucun projet Android n'a été créé.

## 1. Contraintes qui pèsent sur le choix

- L'application web reste la référence et ne doit pas être réécrite.
- Le rendu est serveur : composants serveur, server actions, cookies HttpOnly, sessions et base PostgreSQL.
- Il n'y a pas d'export statique possible en l'état.
- Le site n'est pas une PWA : pas de manifeste, pas de service worker, pas de cache hors ligne.
- La distribution sera interne, sans publication publique sur Google Play.
- Le package prévu est `com.topcarzone.app`.
- Un second module Android est prévu pour les véhicules, avec un identifiant distinct.
- Les fonctions sensibles sont : connexion, pièces jointes, exports Excel, impression, microphone, WebRTC, notifications et bouton retour Android.
- Aucun test Android n'a encore été effectué.

## 2. Comparaison

| Critère | TWA | Capacitor | Réécriture native |
|---|---|---|---|
| Principe | Application Android qui affiche le site dans Chrome, en plein écran | Coquille native avec WebView et plugins natifs | Application Kotlin ou Flutter réécrite |
| Parité avec le web | Très forte : Chrome affiche le site réel | Moyenne à forte selon le mode de chargement | Faible au départ, tout est à recréer |
| Server actions Next.js | Fonctionnent via Chrome | À valider dans la WebView et selon l'origine | À réimplémenter en API |
| Cookies HttpOnly | Gérés par Chrome | À valider selon l'origine et le cookie jar | À réimplémenter |
| Rendu serveur | Compatible tel quel | Problème : Capacitor attend normalement des assets locaux | À réimplémenter |
| Export statique nécessaire | Non | Oui pour le mode standard, ou chargement d'une URL distante à valider | Non |
| Upload de fichiers | Géré par Chrome | Plugins ou WebView à adapter | À recoder |
| Téléchargements XLSX | Gérés par Chrome, avec réglages à vérifier | Plugins Filesystem, Share et téléchargement à ajouter | À recoder |
| Impression | Navigateur Chrome, à vérifier | Plugin d'impression ou PDF natif à ajouter | À recoder |
| Micro et WebRTC | Chrome, permissions navigateur | WebView, permissions Android à gérer | À recoder |
| Notifications | Web push ou notifications web, service worker à ajouter | Notifications locales et push natif possibles | Notifications natives |
| Appels en arrière-plan | Limité par Chrome et le cycle de vie web | Service de premier plan possible | Service natif possible |
| Bouton retour Android | Géré par Chrome et le routeur web | À implémenter avec BackHandler | À implémenter |
| Clavier et bords d'écran | Gérés par Chrome | À adapter dans la WebView | À gérer nativement |
| Liens externes | Ouverts par Chrome | Plugins Browser/Intent à ajouter | À recoder |
| Fonctionne sans Chrome | Non | Oui | Oui |
| Distribution hors Play Store | APK signé possible | APK signé possible | APK signé possible |
| MDM et gestion de parc | Possible, mais dépend de Chrome | Bonne maîtrise native | Bonne maîtrise native |
| Mise à jour du web | Déploiement Vercel, sans reconstruire l'APK | Selon le mode, souvent sans reconstruire | Reconstruction de l'application |
| Intégration OBD, Bluetooth, CAN | Non | Possible via plugins natifs | Native, la plus adaptée |
| Effort de mise en oeuvre | Moyen : PWA à ajouter | Moyen à élevé : POC WebView et plugins | Très élevé : 54 pages et APIs à refaire |
| Maintenance | Faible côté natif, dépend de Chrome | Moyenne : plugins et WebView | Élevée |
| Risque de régression métier | Faible si Chrome se comporte comme prévu | Moyen à élevé | Très élevé |
| Risque de sécurité | Surface Chrome, asset links à sécuriser | Surface WebView, navigation, cookies, bridge à sécuriser | Surface native à sécuriser entièrement |

### 2.1 TWA

Fonctionnement :

- l'application Android est une coquille TWA ;
- elle ouvre le site CARZONE dans Chrome, en plein écran ;
- le site doit être une PWA installable ;
- la vérification du domaine passe par `/.well-known/assetlinks.json` ;
- le package `com.topcarzone.app` peut être conservé ;
- l'APK peut être distribué hors Play Store par APK signé ou MDM.

Points forts :

- parité maximale avec le web ;
- pas de réécriture des 54 pages ;
- server actions, cookies, sessions et rendu serveur conservés ;
- téléchargements, uploads, liens externes et retour Android largement gérés par Chrome ;
- mise à jour du web par simple déploiement Vercel ;
- le futur module véhicule peut rester une application séparée.

Points faibles et risques :

- il faut ajouter une PWA : manifeste, icônes, service worker et installabilité ;
- Chrome doit être présent et à jour sur les appareils ;
- pas de plugins natifs pour OBD, Bluetooth ou télématique ;
- les notifications en arrière-plan et les appels entrants ne sont pas garantis ;
- `window.print()` et les téléchargements doivent être testés dans TWA ;
- les Digital Asset Links dépendent du domaine et de l'empreinte de signature ;
- la gestion de parc passe en partie par Chrome ;
- changer de domaine plus tard peut nécessiter de reconstruire l'APK TWA.

### 2.2 Capacitor

Fonctionnement :

- une coquille native Android embarque une WebView ;
- des plugins donnent accès aux fichiers, au partage, à l'impression, aux notifications, au micro et au matériel ;
- le mode standard attend un dossier web local avec `index.html` ;
- l'application actuelle ne peut pas être exportée statiquement sans refonte ;
- il faudrait soit charger l'URL distante, soit créer une couche API mobile.

Points forts :

- contrôle natif réel ;
- pas de dépendance à Chrome ;
- bonne base pour un parc d'entreprise et un MDM ;
- plugins possibles pour les téléchargements, l'impression, les notifications et le matériel ;
- utile pour le futur module véhicule.

Points faibles et risques :

- Capacitor est conçu pour des assets web locaux, pas pour une application Next.js serveur ;
- charger l'URL de production dans `server.url` est documenté comme un usage de live reload, pas comme le chemin de production standard ;
- il faut valider dans un POC que les cookies, server actions, téléchargements, impressions et plugins fonctionnent dans la WebView ;
- si le chargement distant ne suffit pas, il faudra exposer les server actions en API ou adapter le web, ce qui augmente fortement le périmètre ;
- surface d'attaque supplémentaire : navigation externe, cookies, bridge JavaScript, contenu distant ;
- maintenance des plugins et des versions Android plus lourde.

### 2.3 Réécriture native

Fonctionnement :

- application Kotlin ou Flutter ;
- toutes les pages, formulaires, règles métier, permissions et documents sont recréés ;
- les server actions doivent être remplacées par des API ;
- l'authentification et les sessions doivent être repensées.

Points forts :

- contrôle total de l'expérience ;
- meilleure intégration matérielle pour le futur module véhicule ;
- pas de dépendance à un navigateur.

Points faibles :

- coût et délai disproportionnés ;
- duplication de 54 pages et de 16 routes API ;
- risque de divergence métier entre le web et le mobile ;
- maintenance de deux applications ;
- contraire à la règle de ne pas réécrire le web.

## 3. Recommandation

### Recommandation principale

Je recommande une **TWA**, avec ajout d'une PWA minimale, pour l'application CARZONE principale.

Justification :

1. L'application est serveur et utilise des server actions. TWA est la seule approche qui conserve réellement ce fonctionnement sans réécriture.
2. Chrome gère déjà les cookies, les uploads, les téléchargements, les liens externes et le bouton retour.
3. Les 54 pages et les 16 routes API restent uniques.
4. La distribution interne hors Play est possible avec un APK signé ou un MDM.
5. Le futur module véhicule est un produit séparé. Il n'oblige pas l'application principale à devenir native.
6. Le risque de régression métier est plus faible qu'avec une WebView Capacitor mal validée.

### Recommandation conditionnelle

La TWA ne doit être lancée qu'après un **POC de validation** sur un appareil ou un émulateur Android.

Le POC doit prouver :

- connexion et persistance du cookie ;
- server action après connexion ;
- téléchargement d'un export XLSX ;
- upload d'une pièce jointe ;
- impression d'une facture ;
- appel audio avec micro ;
- ouverture d'un lien WhatsApp ;
- bouton retour Android ;
- clavier dans une modale ;
- comportement avec perte de réseau.

Si un point critique échoue, la solution de repli est une coquille Capacitor ou WebView native, pas une réécriture complète.

### Ce que je ne recommande pas

- Réécriture native complète : trop coûteuse et contraire à la demande.
- Capacitor standard avec export statique : impossible sans refonte du rendu serveur.
- Capacitor avec URL distante sans POC : risque trop élevé sur les cookies, les server actions et les plugins.
- TWA sans PWA : impossible à installer correctement.
- Publication Play Store : non nécessaire.

## 4. Modifications web probables pour la TWA

Ces modifications ne sont pas encore faites. Elles seraient limitées à la PWA et ne changeraient pas les fonctionnalités métier.

1. Ajouter `app/manifest.ts` avec le nom CARZONE, les icônes, la couleur de thème, le mode `standalone` et le `start_url`.
2. Ajouter des icônes PWA à partir du logo CARZONE.
3. Ajouter un service worker minimal :
   - pas de cache des pages authentifiées ;
   - cache uniquement des assets publics ;
   - stratégie réseau d'abord pour les données sensibles ;
   - page de secours hors ligne.
4. Ajouter `public/.well-known/assetlinks.json` pour le package et l'empreinte de signature.
5. Vérifier que le service worker n'interfère pas avec les cookies, les server actions et les redirections.
6. Vérifier que `window.print()` et les téléchargements fonctionnent dans TWA.
7. Ajouter éventuellement un fallback pour les notifications web.
8. Relancer les tests du web après chaque modification.

Chaque modification devra être justifiée, testée et documentée. Aucune réécriture de page métier n'est prévue.

## 5. Architecture cible

```text
Application CARZONE
  APK TWA signé
    -> Chrome Android
      -> site Next.js sur Vercel
        -> server actions
        -> cookies HttpOnly
        -> API internes
        -> PostgreSQL

Module véhicule futur
  APK distinct com.topcarzone.vehicle
    -> OBD-II, CAN ou boîtier télématique
      -> API partagée
      -> PostgreSQL
```

Le module véhicule ne doit pas être inclus dans l'APK principal. Il aura son propre identifiant, sa propre signature, sa propre politique de mise à jour et son propre matériel.

## 6. Risques résiduels

| Risque | Niveau | Réduction |
|---|---|---|
| Le service worker casse une page authentifiée | Élevé | Cache réseau d'abord, aucune page privée en cache, tests |
| Téléchargement XLSX non géré dans TWA | Moyen | Test POC, réglage Chrome, fallback ouverture navigateur |
| Impression absente ou limitée | Moyen | Test POC, impression Chrome, génération PDF future |
| Appels audio limités en arrière-plan | Élevé | Notifications push et service natif dédiés plus tard |
| Chrome absent sur certains appareils | Moyen | Parc vérifié, MDM, alternative WebView |
| Digital Asset Links mal configurés | Élevé | Vérification de l'empreinte, HTTPS, test sur appareil |
| Domaine instable | Moyen | Utiliser l'URL Vercel stable au démarrage, migrer plus tard |
| Perte de signature | Élevé | Sauvegarde de la clé et procédure de release |
| Module véhicule sans matériel compatible | Élevé | Étude OBD, CAN ou télématique avant développement |
| Mise à jour hors Play non maîtrisée | Moyen | MDM ou canal APK privé avec vérification de version |

## 7. Décision retenue

Décision validée par le client :

1. Approche retenue : TWA pour l'application principale.
2. Ajout d'une PWA minimale au web.
3. Distribution interne par APK signé, puis MDM si le parc grandit.
4. Package principal : `com.topcarzone.app`.
5. Package futur module véhicule : `com.topcarzone.vehicle` ou `com.topcarzone.telemetry`.
6. Le module véhicule sera développé séparément, avec une étude matérielle OBD, CAN ou télématique.
7. Chrome est disponible et à jour sur les téléphones et tablettes cibles.

Le POC TWA reste obligatoire avant de déclarer la parité validée.
