# Étape 4 - Adaptations web et Android

Date : 2026-11-07
Statut : adaptations PWA et TWA déployables. Tests Android non commencés.

## 1. Modifications web

Les modifications sont limitées à ce que la TWA exige. Aucune logique métier, aucun server action et aucune route API n'a été réécrit.

| Fichier | Modification | Raison mobile |
|---|---|---|
| `apps/web/src/app/manifest.ts` | Manifeste PWA CARZONE, nom, couleurs, start URL, icônes | TWA exige une PWA installable |
| `apps/web/public/icons/*` | Icônes 192, 512, maskable et Apple Touch | Installation et écran d'accueil |
| `apps/web/public/sw.js` | Service worker limité aux assets statiques et à la page hors ligne | Exigence PWA et réseau absent |
| `apps/web/public/offline.html` | Page hors ligne | Navigation sans réseau |
| `apps/web/src/components/ServiceWorkerRegister.tsx` | Enregistrement du service worker en production | Activation de la PWA |
| `apps/web/src/components/NetworkStatusBanner.tsx` | Bannière fixe quand Android n'a plus de réseau | Retour visuel immédiat |
| `apps/web/src/app/layout.tsx` | Viewport `viewport-fit=cover`, theme color, manifeste, icônes, bannière réseau, enregistrement du service worker | Bords d'écran, installation et état réseau |
| `apps/web/src/app/globals.css` | Marges de sécurité Android et `scroll-margin` des champs | Barre gestuelle et clavier |
| `apps/web/src/middleware.ts` | `/manifest.webmanifest` et `/offline.html` rendus publics | PWA et page hors ligne accessibles sans session |
| `apps/web/public/.well-known/assetlinks.json` | Digital Asset Links du package `com.topcarzone.app` avec l'empreinte de debug | Vérification TWA en plein écran |

## 2. Choix du service worker

Le service worker ne met volontairement pas en cache :

- les routes API ;
- les documents ;
- les pages authentifiées ;
- les réponses personnalisées.

Il met en cache uniquement les assets statiques publics et la page `offline.html`.

Conséquences :

- les données métier ne sont pas stockées dans le cache ;
- la navigation normale reste réseau d'abord ;
- une panne réseau affiche la page hors ligne ;
- les sessions et cookies continuent d'être gérés par Chrome.

## 3. Digital Asset Links

Le fichier est servi à cette adresse :

```text
https://carzone-sarl.vercel.app/.well-known/assetlinks.json
```

Il contient :

- le package `com.topcarzone.app` ;
- l'empreinte SHA-256 du certificat de debug utilisé pour l'APK de test.

L'empreinte de debug est publique et n'est pas un secret. L'empreinte de diffusion sera ajoutée à l'étape 6, après création de la clé de signature de release.

Sans ce fichier, la TWA peut s'ouvrir en mode Custom Tabs avec barre d'adresse. Avec ce fichier et un APK signé par le certificat correspondant, Chrome peut masquer la barre d'adresse.

## 4. Adaptations déjà couvertes par Chrome

La TWA utilise Chrome, pas une WebView interne. Les points suivants sont donc délégués au navigateur et devront être vérifiés à l'étape 5 :

- bouton retour Android pour la navigation entre pages ;
- sélecteur de fichiers Android ;
- téléchargements XLSX et documents ;
- ouverture des liens externes ;
- ouverture des liens WhatsApp, téléphone et email ;
- impression via Chrome ;
- clavier Android ;
- gestion des permissions microphone et notifications ;
- cookies et persistance de session.

Aucun de ces points n'est déclaré fonctionnel sur Android à ce stade.

## 5. Points qui restent limités

- Les notifications en arrière-plan ne sont pas garanties par une TWA. Le web utilise toujours du polling et l'API Notification.
- Les appels WebRTC audio utilisent Chrome et le micro, mais l'appel en arrière-plan ou écran verrouillé n'est pas garanti.
- Le bouton retour Android sur une modale sans changement d'URL reste à tester.
- Les téléchargements et impressions dépendent du comportement de Chrome.
- La caméra et la localisation ne sont pas utilisées par le web actuel.
- Aucun OAuth Google ou Facebook n'existe dans le web actuel.
- Le service worker ne fournit pas de données métier hors ligne.

## 6. Vérifications web

Effectuées localement puis en production :

- `npx tsc --noEmit` : OK.
- `npm run build` : OK.
- `npm run check:no-em-dash` : OK.
- `/manifest.webmanifest` : HTTP 200, type `application/manifest+json`.
- `/.well-known/assetlinks.json` : HTTP 200, type `application/json`.
- `/sw.js` : HTTP 200, type JavaScript.
- `/offline.html` : HTTP 200.
- `/icons/icon-192.png` : HTTP 200.
- En production Vercel : `/manifest.webmanifest`, `/.well-known/assetlinks.json`, `/sw.js`, `/offline.html` et `/icons/icon-512.png` répondent tous en HTTP 200.
- Lien `<link rel="manifest">` présent dans le HTML.
- `node --check public/sw.js` : OK.

Non effectués :

- aucun test dans Chrome Android ;
- aucun test TWA ;
- aucun test de service worker sur appareil ;
- aucun test d'impression, téléchargement, upload ou appel ;
- aucun test de perte de réseau sur appareil.

## 7. Prochaine étape

L'étape 5 doit :

1. produire un APK de debug ;
2. installer l'APK sur un émulateur ou un appareil ;
3. vérifier la reconnaissance TWA et l'absence de barre d'adresse ;
4. tester chaque ligne de `PARITE.md` ;
5. noter OK, KO ou NON TESTÉ avec preuve ;
6. relancer les tests web.

Aucun résultat Android ne sera déclaré avant ces tests.

## 8. Résultats Android

Les tests réels ont été réalisés sur un Motorola moto g 2025 sous Android 15, avec Chrome Android 156.

Résultats détaillés : [TESTS.md](TESTS.md).

Points confirmés :

- TWA en plein écran ;
- démarrage sur le tableau de bord ;
- connexion et session ;
- navigation et bouton retour entre pages ;
- téléchargement Excel ;
- ouverture de l'impression native.

Points non validés :

- retour Android sur une modale : KO ;
- impression physique : NON TESTÉ ;
- upload de fichier : NON TESTÉ ;
- liens externes : NON CONCLUANT ;
- perte de réseau : NON TESTÉ ;
- microphone, WebRTC et notifications en arrière-plan : NON TESTÉ.

La protection web du retour Android a été essayée puis retirée, car elle ne fermait pas correctement les modales et pouvait provoquer une navigation inattendue. La TWA seule ne permet pas d'intercepter nativement `onBackPressed`. Si cette fonction est obligatoire, il faudra valider une coquille WebView native ou Capacitor.
