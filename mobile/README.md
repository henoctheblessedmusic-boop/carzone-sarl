# CARZONE Android - TWA

Application Android interne CARZONE, basée sur une Trusted Web Activity.

## Identité

| Élément | Valeur |
|---|---|
| Nom affiché | `CARZONE` |
| Package Android | `com.topcarzone.app` |
| Type | TWA, pas de publication publique Play Store |
| URL chargée | `https://carzone-sarl.vercel.app/dashboard` par défaut |
| Version initiale | `1.0.0` (`versionCode` 1) |
| Min SDK | 23 |
| Target SDK | 35 |

L'URL peut être remplacée sans modifier le package :

```powershell
$env:CARZONE_TWA_URL = "https://topcarzone.africa"
```

ou au moment du build :

```powershell
.\gradlew.bat assembleDebug -PcarzoneTwaUrl="https://topcarzone.africa"
```

## Icônes et écran de démarrage

Les icônes et le splash sont générés à partir du logo officiel :

```text
apps/web/public/brand/carzone-logo.png
```

Fichiers produits dans `mobile/app/src/main/res/` :

- icônes classiques dans les dossiers `mipmap-*` ;
- icône adaptative dans `mipmap-anydpi-v26` ;
- premier plan adaptatif dans `drawable/ic_launcher_foreground.png` ;
- logo de splash dans `drawable/splash_logo.png`.

Le fond du splash et des icônes est le bleu nuit CARZONE `#0B0F19`.

## Prérequis

- JDK 17.
- Android SDK avec `platforms;android-35` et `build-tools;35.0.0`.
- Chrome à jour sur les appareils cibles.
- Android Studio pour l'installation et les tests sur appareil ou émulateur.

Le fichier `local.properties` contient le chemin local du SDK. Il est ignoré par Git.

## Construire l'APK de débogage

Depuis `mobile/` :

```powershell
.\gradlew.bat assembleDebug
```

APK produit :

```text
mobile/app/build/outputs/apk/debug/app-debug.apk
```

Sous Linux ou macOS :

```bash
./gradlew assembleDebug
```

## Reconstruire après une modification du web

En TWA, le web est chargé à distance. Une modification ordinaire du site CARZONE déployée sur Vercel est visible sans reconstruire l'APK.

Il faut reconstruire l'APK uniquement si l'un de ces éléments change :

- URL TWA ;
- nom ou package ;
- icônes ou écran de démarrage ;
- configuration Android ;
- signature de l'application.

Commande de reconstruction :

```powershell
.\gradlew.bat clean assembleDebug
```

Pour une version de diffusion signée, voir la section Signature.

## Signature de diffusion

Les secrets ne sont jamais commités. La configuration lit les variables d'environnement suivantes :

- `CARZONE_ANDROID_KEYSTORE_PATH`
- `CARZONE_ANDROID_KEYSTORE_PASSWORD`
- `CARZONE_ANDROID_KEY_ALIAS`
- `CARZONE_ANDROID_KEY_PASSWORD`

Exemple de préparation de la session PowerShell :

```powershell
$env:CARZONE_ANDROID_KEYSTORE_PATH = "C:\chemin\carzone-release.jks"
$env:CARZONE_ANDROID_KEYSTORE_PASSWORD = "..."
$env:CARZONE_ANDROID_KEY_ALIAS = "carzone"
$env:CARZONE_ANDROID_KEY_PASSWORD = "..."
```

Si ces variables sont absentes, le build release n'est pas signé. Le build debug utilise la clé de débogage locale d'Android.

La création de la clé et la procédure de diffusion complète seront documentées à l'étape 6.

## PWA et Digital Asset Links

La TWA exige que le site CARZONE soit une PWA et que le domaine expose un fichier de vérification.

Éléments en place :

- `app/manifest.ts` ;
- icônes PWA dans `public/icons` ;
- service worker dans `public/sw.js` ;
- page de secours `public/offline.html` ;
- `public/.well-known/assetlinks.json` avec le package `com.topcarzone.app` et l'empreinte du certificat de debug.

L'empreinte du certificat de debug est publique et n'est pas un secret. L'empreinte du certificat de release devra être ajoutée au même fichier à l'étape 6, après création de la clé de diffusion.

Sans correspondance entre la signature de l'APK et `assetlinks.json`, Chrome peut afficher la barre d'adresse au lieu du mode plein écran TWA. L'application peut fonctionner en fallback Custom Tabs, mais la parité visuelle n'est pas complète.

## Vérification actuelle

Le projet Android est créé. Aucun APK n'a encore été produit et aucun test Android n'a encore été effectué. Les tests de l'étape 5 seront exécutés après les adaptations et la configuration PWA.
