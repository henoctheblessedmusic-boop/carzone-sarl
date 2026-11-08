# Étape 6 - Signature et diffusion

Date : 2026-11-08
Statut : procédure documentée. Aucune clé de release n'a été créée.

## 1. Principe

La diffusion interne utilise un APK signé.

Un AAB peut aussi être produit, mais un AAB ne s'installe pas directement sur un téléphone. Il sert surtout à Google Play ou à un catalogue d'entreprise qui accepte les AAB. Pour une diffusion directe, l'APK reste le format de référence.

La configuration Gradle lit la clé depuis des variables d'environnement. Aucun mot de passe ni fichier de clé ne doit être placé dans le dépôt.

## 2. Créer la clé de signature

Créer un dossier sécurisé en dehors du dépôt, par exemple :

```text
C:\CARZONE_KEYS
```

Créer la clé avec `keytool` :

```powershell
keytool -genkeypair -v `
  -keystore "C:\CARZONE_KEYS\carzone-release.jks" `
  -alias "carzone" `
  -keyalg RSA `
  -keysize 4096 `
  -validity 10000 `
  -storetype PKCS12
```

`keytool` demandera :

- le mot de passe du fichier de clé ;
- la confirmation de ce mot de passe ;
- les informations du propriétaire, par exemple `CN=CARZONE SARL, O=CARZONE SARL, L=Cotonou, C=BJ`.

Ne jamais utiliser la clé de debug pour une diffusion.

## 3. Sauvegarder la clé

Avant toute diffusion :

- copier le fichier `.jks` sur un support chiffré hors ligne ;
- conserver une deuxième copie dans un coffre-fort de mots de passe d'entreprise ;
- conserver l'alias et les mots de passe séparément ;
- ne jamais envoyer la clé par WhatsApp, email ou ticket ;
- ne jamais commiter le fichier `.jks`, `.keystore` ou les mots de passe.

Une perte de clé empêche les mises à jour de l'application sans désinstallation ou changement d'identité.

## 4. Configurer la session PowerShell

Exemple de variables attendues :

```powershell
$env:CARZONE_ANDROID_KEYSTORE_PATH = "C:\CARZONE_KEYS\carzone-release.jks"
$env:CARZONE_ANDROID_KEYSTORE_PASSWORD = "<mot de passe du fichier>"
$env:CARZONE_ANDROID_KEY_ALIAS = "carzone"
$env:CARZONE_ANDROID_KEY_PASSWORD = "<mot de passe de la clé>"
```

Attention : les valeurs saisies dans un terminal peuvent rester dans l'historique de la session. Pour une diffusion réelle, utiliser une session dédiée et fermer le terminal après le build.

Le fichier `mobile/.env.example` ne contient que les noms des variables, jamais les valeurs.

## 5. Construire l'APK signé

Depuis `mobile/` :

```powershell
.\gradlew.bat clean assembleRelease
```

Sortie attendue :

```text
mobile/app/build/outputs/apk/release/app-release.apk
```

Sans les variables d'environnement, le build produit un APK non signé :

```text
mobile/app/build/outputs/apk/release/app-release-unsigned.apk
```

C'est ce qui a été observé pendant la vérification actuelle : le build release fonctionne, mais aucune clé de release n'a été créée.

## 6. Construire l'AAB

```powershell
.\gradlew.bat clean bundleRelease
```

Sortie observée sans clé :

```text
mobile/app/build/outputs/bundle/release/app-release.aab
```

Cet AAB est non signé tant que les variables de signature ne sont pas définies.

Pour une diffusion directe, préférer l'APK. Pour Google Play, l'AAB est le format attendu.

## 7. Vérifier la signature

Afficher les certificats de l'APK :

```powershell
& "$env:ANDROID_HOME\build-tools\35.0.0\apksigner.bat" verify --print-certs `
  ".\app\build\outputs\apk\release\app-release.apk"
```

Afficher l'empreinte SHA-256 de la clé :

```powershell
keytool -list -v `
  -keystore "C:\CARZONE_KEYS\carzone-release.jks" `
  -alias "carzone"
```

La ligne `SHA256:` doit être ajoutée au fichier `assetlinks.json`.

## 8. Mettre à jour les Digital Asset Links

Fichier web :

```text
apps/web/public/.well-known/assetlinks.json
```

Ajouter l'empreinte SHA-256 du certificat de release dans `sha256_cert_fingerprints`.

Pendant les tests, l'empreinte de debug est présente. Pour une diffusion de release :

- ajouter l'empreinte de release ;
- retirer l'empreinte de debug si elle ne doit plus être acceptée ;
- déployer le fichier avec le site ;
- vérifier que la TWA s'ouvre encore sans barre d'adresse Chrome.

La vérification TWA dépend de la correspondance entre :

- le package `com.topcarzone.app` ;
- l'empreinte du certificat qui a signé l'APK installé ;
- le fichier `assetlinks.json` servi sur le domaine.

## 8bis. Erreur "keystore password was incorrect"

Cette erreur signifie que Gradle n'arrive pas à ouvrir le fichier `.jks` avec la valeur de :

```text
CARZONE_ANDROID_KEYSTORE_PASSWORD
```

Ce n'est pas le mot de passe du compte utilisateur, ni le mot de passe de l'application.

Deux mots de passe existent :

- le mot de passe du fichier de clés, demandé par `keytool` à la ligne "Entrez le mot de passe du fichier de clés" ;
- le mot de passe de la clé privée, demandé séparément dans certains cas.

Pour un fichier PKCS12 créé avec `keytool -genkeypair` sans `-keypass`, les deux sont généralement identiques.

### Vérifier le mot de passe du fichier

Tester le fichier seul, sans Gradle :

```powershell
keytool -list -v `
  -keystore "C:\Users\IGOR_GIANI\Documents\Doc LAPREMIERE BJ\Projects\CARZONE_KEYS\carzone-release.jks" `
  -alias "carzone"
```

Saisir le mot de passe manuellement quand `keytool` le demande.

- Si `keytool` ouvre le fichier : le mot de passe est bon, mais la variable d'environnement Gradle ne contient pas la même valeur.
- Si `keytool` refuse : le mot de passe saisi à la création n'est pas celui utilisé, ou il a été oublié.

### Vérifier la valeur Gradle sans afficher le secret

```powershell
Write-Output "Chemin : $env:CARZONE_ANDROID_KEYSTORE_PATH"
Write-Output "Alias : $env:CARZONE_ANDROID_KEY_ALIAS"
Write-Output "Longueur du mot de passe fichier : $($env:CARZONE_ANDROID_KEYSTORE_PASSWORD.Length)"
Write-Output "Longueur du mot de passe clé : $($env:CARZONE_ANDROID_KEY_PASSWORD.Length)"
```

Les longueurs doivent correspondre aux mots de passe réellement saisis. Ne pas afficher les valeurs.

### Causes fréquentes

- valeur différente entre la création et la variable d'environnement ;
- guillemets inclus dans la variable ;
- espaces avant ou après ;
- caractère `$` interprété par PowerShell dans une chaîne à double guillemet ;
- variable définie dans une ancienne fenêtre puis perdue ;
- mot de passe de clé confondu avec le mot de passe du fichier.

### Correction

Si le mot de passe est connu, redéfinir la variable dans la même session PowerShell :

```powershell
$env:CARZONE_ANDROID_KEYSTORE_PASSWORD = 'mot-de-passe-exact'
```

Utiliser des guillemets simples si le mot de passe contient `$`.

Si le mot de passe est perdu et que la clé n'a pas encore été diffusée, créer une nouvelle clé avec un nouveau nom de fichier, puis mettre à jour les variables :

```powershell
keytool -genkeypair -v `
  -keystore "C:\CARZONE_KEYS\carzone-release-2026.jks" `
  -alias "carzone" `
  -keyalg RSA `
  -keysize 4096 `
  -validity 10000 `
  -storetype PKCS12
```

Ne pas supprimer l'ancienne clé avant d'être certain qu'elle n'a jamais servi à signer un APK distribué.

### Erreur "Given final block not properly padded"

Cette erreur apparaît après que le mot de passe du fichier a été accepté.

Elle signifie que le mot de passe de la clé privée est incorrect :

```text
CARZONE_ANDROID_KEY_PASSWORD
```

Le fichier `.jks` est ouvert, mais la clé `carzone` ne peut pas être déchiffrée.

Avec un fichier PKCS12 créé sans mot de passe de clé séparé, les deux valeurs doivent être identiques :

```powershell
$env:CARZONE_ANDROID_KEY_PASSWORD = $env:CARZONE_ANDROID_KEYSTORE_PASSWORD
```

Vérifier uniquement les longueurs, sans afficher les secrets :

```powershell
$env:CARZONE_ANDROID_KEYSTORE_PASSWORD.Length
$env:CARZONE_ANDROID_KEY_PASSWORD.Length
```

Puis relancer :

```powershell
.\gradlew.bat clean assembleRelease
```

Si l'erreur persiste avec deux valeurs identiques, la clé privée a peut-être été créée avec un autre mot de passe ou le fichier est corrompu. Dans ce cas, recréer une nouvelle clé avec un nouveau nom de fichier et utiliser le même mot de passe pour le fichier et la clé.

## 9. Installation interne

Pour un pilote :

```powershell
adb install -r .\app\build\outputs\apk\release\app-release.apk
```

Pour un parc plus important :

- utiliser un MDM ;
- pousser l'APK signé ;
- verrouiller l'installation depuis des sources inconnues ;
- documenter la procédure d'installation ;
- conserver la même clé pour toutes les mises à jour.

Android peut afficher un avertissement d'installation hors Play Store. C'est normal pour une distribution interne.

## 10. AAB et Google Play

L'application n'est pas prévue pour une publication publique sur Google Play.

Si une publication privée est envisagée plus tard :

- utiliser l'AAB ;
- utiliser Google Play App Signing ou gérer la clé de signature de manière compatible ;
- récupérer l'empreinte du certificat de signature Play pour `assetlinks.json` ;
- ne pas confondre l'empreinte de la clé d'upload et l'empreinte de la clé de signature Play.

L'AAB seul ne peut pas être installé directement sur un téléphone. Pour tester un AAB hors Play, il faut le convertir avec `bundletool` en APK universal ou split APKs.

## 11. Procédure de release recommandée

1. Incrémenter `versionCode` et `versionName` dans `mobile/app/build.gradle`.
2. Vérifier que `CARZONE_TWA_URL` pointe vers l'origine HTTPS stable.
3. Construire l'APK signé.
4. Construire l'AAB si nécessaire.
5. Vérifier la signature.
6. Mettre à jour `assetlinks.json` avec l'empreinte release.
7. Déployer le web.
8. Installer l'APK sur un appareil de test.
9. Vérifier connexion, téléchargement, impression et navigation.
10. Diffuser via MDM ou dépôt APK contrôlé.
11. Archiver l'APK, l'AAB, le numéro de version et l'empreinte de signature.

## 12. Module véhicule

Le futur module véhicule doit utiliser :

- un package distinct, par exemple `com.topcarzone.vehicle` ;
- une clé de signature distincte ;
- un canal de mise à jour distinct ;
- le même backend ou une API dédiée.

Ne pas réutiliser la clé de l'application principale pour le module embarqué dans les véhicules.

## 13. État actuel

- Clé de release créée par le client, hors du dépôt.
- Aucun mot de passe de signature enregistré dans le dépôt.
- Aucun fichier `.jks` ou `.aab` commité.
- APK release signé produit :
  - package `com.topcarzone.app` ;
  - version `1.0.0`, versionCode 1 ;
  - signature vérifiée avec `apksigner`.
- Empreinte SHA-256 du certificat release :

```text
A7:88:E1:97:80:35:BF:59:C2:6F:ED:39:CA:5E:B2:DA:78:72:C3:F3:DF:37:90:A7:2E:D1:F3:42:AE:17:D5:0B
```

- `assetlinks.json` a été mis à jour avec cette empreinte release.
- L'empreinte de debug a été retirée.
- APK release installé sur le téléphone à la place de l'APK debug.
- Connexion testée sur `https://topcarzone.africa/dashboard` avec un compte temporaire, puis compte supprimé.
- La TWA release s'ouvre en plein écran.
- Le fichier `.jks` et les mots de passe doivent encore être sauvegardés par le client dans un coffre-fort.

La sauvegarde de la clé reste obligatoire avant toute diffusion à un autre appareil.

La limite du bouton retour Android sur les modales reste présente.
