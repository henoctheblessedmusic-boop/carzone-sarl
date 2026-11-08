# Étape 5 - Construction et tests Android

Date : 2026-11-08
Appareil : Motorola moto g 2025, Android 15, Chrome Android 156.
APK testé : APK de debug `com.topcarzone.app`, installé par ADB sans fil.
URL TWA : `https://carzone-sarl.vercel.app/dashboard`.

## 1. Construction

| Élément | Résultat |
|---|---|
| Commande | `.\gradlew.bat assembleDebug` |
| Résultat | BUILD SUCCESSFUL |
| APK | `mobile/app/build/outputs/apk/debug/app-debug.apk` |
| Taille | environ 6,06 Mo |
| Installation ADB | Success |
| Lancement TWA | OK |

## 2. Résultats par fonctionnalité

Statuts : OK, KO, PARTIEL, NON TESTÉ.

| Fonctionnalité | Statut | Preuve et remarque |
|---|---|---|
| Démarrage de l'application | OK | L'application démarre sur le tableau de bord demandé |
| TWA en plein écran | OK | Capture `captures/twa-dashboard.png`, aucune barre d'adresse Chrome visible |
| Vérification Digital Asset Links | OK | Le mode plein écran TWA est actif avec l'empreinte de debug |
| Écran de connexion | OK | Formulaire email et mot de passe affiché, connexion testée avec un compte temporaire |
| Connexion email et mot de passe | OK | Compte de test temporaire, session créée, redirection vers le tableau de bord |
| Persistance de la session | OK | Cookie de session encore présent après redémarrage de l'application |
| Tableau de bord | OK | Capture `captures/twa-dashboard.png` |
| Navigation entre pages | OK | Passage tableau de bord vers Clients, puis retour Android vers le tableau de bord |
| Domaine `topcarzone.africa` | OK | HTTPS, certificat Vercel, redirection www et assetlinks vérifiés |
| TWA sur `topcarzone.africa` | OK | Connexion et tableau de bord testés sur le nouveau domaine, capture `captures/twa-africa-dashboard.png` |
| APK release signé | OK | Signature release vérifiée, assetlinks mis à jour, APK release installé |
| TWA release sur `.africa` | OK | Plein écran et connexion testés avec un compte temporaire supprimé ensuite, capture `captures/release-twa-dashboard.png` |
| Bouton retour Android sur une page | OK | Le retour navigateur fonctionne pour les changements de page |
| Bouton retour Android sur une modale | KO | La modale d'import clients est ouverte, le retour a quitté la page au lieu de fermer la modale. Capture `captures/modal-back-ko.png` |
| Téléchargement Excel | OK | Fichier `Bilan_Financier_Entreprise_2026-11-08.xlsx`, 19 150 octets, enregistré dans `/sdcard/Download`. Capture `captures/excel-download.png` |
| Impression | PARTIEL | L'écran d'impression Android s'ouvre. L'imprimante HP détectée est indisponible, donc l'impression physique n'est pas testée. Capture `captures/print-dialog.png` |
| Cloche de notifications | OK | Le panneau de notifications s'ouvre et affiche les activités. Aucune capture conservée pour éviter d'exposer des données internes. |
| Clavier Android | PARTIEL | Le clavier s'affiche correctement sur la connexion. Les champs restent accessibles. Aucun test exhaustif de tous les formulaires |
| Bords d'écran | PARTIEL | Rendu sans chevauchement visible sur les captures. À vérifier sur plusieurs tailles et orientations |
| Liens externes | NON CONCLUANT | Une tentative automatisée a déclenché le bloqueur de pop-up TWA. Un tap réel sur WhatsApp n'a pas été confirmé. Capture `captures/external-popup-blocked.png` |
| Upload de fichier | NON TESTÉ | Le sélecteur de fichiers Android n'a pas été validé pendant cette session |
| Perte de réseau | NON TESTÉ | Nécessite de couper le Wi-Fi sans perdre ADB sans fil, ou un test manuel sur appareil |
| Notifications push en arrière-plan | NON TESTÉ | Le web utilise du polling et l'API Notification. Aucun push natif n'est en place |
| Microphone et WebRTC | NON TESTÉ | Nécessite deux comptes et un second appareil ou navigateur pour un appel réel |
| Caméra | NON APPLICABLE | Aucune utilisation caméra dans le code web actuel |
| Localisation | NON APPLICABLE | `geolocation=()` dans la politique actuelle |
| Google OAuth | NON APPLICABLE | Aucun OAuth Google ou Facebook dans le web actuel |
| Icône et splash au lancement | NON TESTÉ | L'APK est installé, mais le splash n'a pas été capturé séparément |

## 3. Captures

Les captures sont dans `docs/mobile/captures/` :

- `twa-dashboard.png`
- `excel-download.png`
- `print-dialog.png`
- `modal-back-ko.png`
- `external-popup-blocked.png`

## 4. Nettoyage

- Compte temporaire `mobile.test@carzone.bj` supprimé.
- Aucun compte de test restant.
- Fichier Excel de test supprimé du téléphone.
- Cookies de test effacés du profil Chrome de l'appareil.
- Aucune clé de signature de release créée.
- Aucun secret commité.

## 5. Vérifications web après modifications

- `npx tsc --noEmit` : OK.
- `npm run build` : OK.
- `npm run check:no-em-dash` : OK.
- `/.well-known/assetlinks.json` : HTTP 200 en production.
- `/manifest.webmanifest` : HTTP 200 en production.
- `/sw.js` : HTTP 200 en production.
- Aucun test métier web complet n'a été exécuté sur tous les rôles. Le build et le typage passent.

## 6. Limite principale identifiée

La TWA gère correctement le bouton retour Android pour les changements de page, mais pas pour fermer les modales qui ne changent pas l'URL.

Une tentative de protection web générique a été ajoutée puis retirée, car elle ne fermait pas correctement la modale et pouvait produire une navigation inattendue.

Si le retour sur modale est obligatoire, la TWA seule ne suffit pas. Il faudra passer à une WebView native Capacitor ou à une coquille Android personnalisée capable d'intercepter `onBackPressed`. Cette décision nécessite une validation avant l'étape 6.

## 7. Conclusion

La TWA est utilisable pour les parcours principaux testés :

- connexion ;
- tableau de bord ;
- navigation ;
- téléchargement Excel ;
- ouverture de l'impression.

Elle n'est pas encore validée pour :

- le retour Android sur les modales ;
- les uploads de fichiers ;
- les liens externes ;
- la perte de réseau ;
- les appels audio et le microphone ;
- les notifications en arrière-plan.

Aucune fonctionnalité non testée n'est déclarée opérationnelle.
