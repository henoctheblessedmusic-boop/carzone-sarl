# APK mobile privé

Ce dossier contient l'APK signé distribué depuis l'Espace Pro.

- `CARZONE-1.0.0.apk` est servi uniquement par `/api/mobile/apk`.
- Le dossier n'est pas dans `public`, donc l'APK n'est pas accessible directement.
- La route vérifie la session avant de lire le fichier.
- Le fichier est inclus dans le déploiement Vercel via `outputFileTracingIncludes`.

## Mettre à jour l'APK

1. Modifier `versionCode` et `versionName` dans `mobile/app/build.gradle`.
2. Construire l'APK release signé.
3. Copier le fichier ici avec un nom versionné.
4. Mettre à jour `MOBILE_APP` dans `apps/web/src/lib/mobile-app.ts`.
5. Mettre à jour la page `/mobile-app` si le tutoriel change.
6. Vérifier le build web.
7. Déployer.
8. Télécharger depuis l'Espace Pro et vérifier la signature.
