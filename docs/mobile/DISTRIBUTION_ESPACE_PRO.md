# Distribution de l'application mobile depuis l'Espace Pro

Date : 2026-11-08
Statut : déployé et testé en production.

## Accès utilisateur

Une nouvelle entrée de menu `Application mobile` est disponible dans l'Espace Pro pour les utilisateurs connectés.

URL :

```text
https://topcarzone.africa/mobile-app
```

La page contient :

- le bouton de téléchargement de l'APK ;
- la version et la taille du fichier ;
- le tutoriel Android sans Play Store ;
- l'empreinte SHA-256 ;
- les avertissements de sécurité.

## Téléchargement protégé

Route :

```text
GET /api/mobile/apk
```

Contrôles :

- session active obligatoire ;
- utilisateur relu en base par `getApiUser` ;
- aucune URL directe vers le fichier ;
- APK stocké dans `apps/web/private/mobile/` ;
- journal d'audit à chaque téléchargement.

Réponse :

```text
Content-Type: application/vnd.android.package-archive
Content-Disposition: attachment; filename="CARZONE-1.0.0.apk"
Cache-Control: private, no-store
```

## Fichier

```text
apps/web/private/mobile/CARZONE-1.0.0.apk
```

Version :

```text
1.0.0
```

Taille :

```text
5 037 226 octets
```

SHA-256 :

```text
42760AD14AE60B032596498B814BF354DC46DC552CB2C53EF79D9ED502FE4BA3
```

Le fichier est inclus dans le déploiement Vercel via :

```text
outputFileTracingIncludes
```

## Tutoriel intégré

La page explique :

1. télécharger l'APK ;
2. ouvrir le fichier ;
3. autoriser Chrome ou Fichiers à installer des applications inconnues ;
4. installer CARZONE ;
5. contourner l'avertissement Play Protect avec l'option d'installation ;
6. se connecter avec le compte professionnel ;
7. garder Chrome à jour.

## Tests production

| Test | Résultat |
|---|---|
| `/mobile-app` sans session | Redirection vers le login |
| `/mobile-app` avec session | HTTP 200 |
| `/api/mobile/apk` sans session | Redirection vers le login |
| `/api/mobile/apk` avec session | HTTP 200 |
| Taille téléchargée | 5 037 226 octets |
| Content-Type | `application/vnd.android.package-archive` |
| Nom de fichier | `CARZONE-1.0.0.apk` |
| SHA-256 téléchargé | identique au fichier source |
| Compte de test | supprimé |
| Audit | téléchargement journalisé |

## Mise à jour de l'APK

1. Modifier `versionCode` et `versionName` dans `mobile/app/build.gradle`.
2. Construire l'APK release signé.
3. Copier l'APK dans `apps/web/private/mobile/` avec un nom versionné.
4. Mettre à jour `MOBILE_APP` dans `apps/web/src/lib/mobile-app.ts`.
5. Mettre à jour la page `/mobile-app` si nécessaire.
6. Vérifier le build web.
7. Déployer.
8. Télécharger depuis l'Espace Pro et vérifier le hash et la signature.

## Sécurité

- L'APK n'est pas dans `public`.
- Aucun lien public permanent n'est créé.
- Le téléchargement exige une session active.
- Le fichier est signé avec la clé release.
- Le hash affiché permet de vérifier l'intégrité.
- La diffusion doit rester limitée aux appareils de l'entreprise.
