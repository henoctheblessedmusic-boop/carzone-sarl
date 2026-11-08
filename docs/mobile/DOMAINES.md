# Domaines et notification Vercel

Date : 2026-11-07
Statut : diagnostic en lecture seule. Aucune modification DNS ou Vercel.

## 1. Notification reçue

Vercel signale :

> Misconfigured Domain
> 2 domains are misconfigured on vercel.com

Les deux domaines concernés sont :

- `topcarzone.com`
- `www.topcarzone.com`

Ils sont rattachés au projet Vercel `carzone-sarl`.

## 2. Constat DNS actuel

| Nom | Type | Valeur actuelle | Interprétation |
|---|---|---|---|
| `topcarzone.com` | A | `35.204.150.5` | Serveur nginx externe, pas Vercel |
| `www.topcarzone.com` | A | `35.204.150.5` | Même serveur nginx externe |
| `carzone-sarl.vercel.app` | A | `216.198.79.195`, `64.29.17.195` | Déploiement Vercel actif |
| `topcarzone.africa` | - | Aucune résolution | Domaine non actif ou non enregistré |

Réponses HTTP :

- `https://topcarzone.com` : HTTP 200, redirection vers `https://www.topcarzone.com/` ;
- `https://www.topcarzone.com` : HTTP 200, serveur `nginx` ;
- `https://carzone-sarl.vercel.app` : HTTP 200, serveur `Vercel`.

Le certificat actif sur `www.topcarzone.com` est un certificat Let's Encrypt pour `www.topcarzone.com`, pas un certificat Vercel.

## 3. Attendu par Vercel

Vercel indique pour les deux domaines :

```text
A topcarzone.com 76.76.21.21
A www.topcarzone.com 76.76.21.21
```

Les nameservers actuels du domaine sont ceux de Google Cloud DNS :

- `ns-cloud-a1.googledomains.com`
- `ns-cloud-a2.googledomains.com`
- `ns-cloud-a3.googledomains.com`
- `ns-cloud-a4.googledomains.com`

Vercel n'a pas accès à cette zone DNS. C'est pour cela que les domaines restent marqués comme mal configurés.

## 4. Impact réel

### Ce qui est impacté

- `topcarzone.com` et `www.topcarzone.com` n'affichent pas l'application CARZONE Ops ;
- Vercel ne peut pas générer le certificat du domaine personnalisé ;
- la notification Vercel continuera tant que le DNS ne correspond pas ;
- le nom public de l'entreprise peut afficher un autre site que CARZONE Ops.

### Ce qui n'est pas impacté

- `https://carzone-sarl.vercel.app` fonctionne ;
- l'application web déployée fonctionne ;
- la PWA et les fichiers `manifest.webmanifest`, `sw.js` et `assetlinks.json` sont bien servis sur l'URL Vercel ;
- l'application Android TWA est configurée pour charger `carzone-sarl.vercel.app` ;
- `topcarzone.africa` n'est pas concerné par les 2 domaines de la notification.

## 5. Cause probable

Le domaine a été ajouté au projet Vercel, mais les enregistrements DNS n'ont pas été modifiés chez le fournisseur DNS. Le domaine pointe encore vers l'ancien serveur nginx `35.204.150.5`.

Cela peut venir :

- d'un ancien site géré par une agence ;
- d'un ancien projet Google Cloud ;
- d'un accès DNS détenu par le directeur ou le prestataire ;
- du fait que les accès au `.com` ne sont pas encore disponibles.

## 6. Options

### Option A - Migrer `topcarzone.com` vers Vercel

Modifier chez Google Cloud DNS :

```text
A     @     76.76.21.21
A     www   76.76.21.21
```

Puis attendre la propagation et vérifier le domaine dans Vercel.

Avantages :

- domaine public aligné sur l'application ;
- certificat Vercel automatique ;
- notification supprimée ;
- le `.com` redevient l'identité principale.

Risques :

- le site nginx actuel sera remplacé ;
- il faut vérifier ce qui est hébergé dessus avant de couper ;
- il faut vérifier les emails et les autres enregistrements DNS avant modification ;
- il faut avoir les accès à la zone Google Cloud DNS.

### Option B - Garder le site nginx sur le `.com`

Retirer `topcarzone.com` et `www.topcarzone.com` du projet Vercel.

Avantages :

- la notification disparaît ;
- le site public actuel reste en place ;
- aucun risque de coupure du site existant.

Inconvénient :

- l'application CARZONE Ops reste sur `carzone-sarl.vercel.app` ;
- le `.com` ne pointera pas vers l'application.

### Option C - Utiliser un sous-domaine

Créer par exemple :

```text
app.topcarzone.com  ->  cname.vercel-dns.com
```

Avantages :

- le site actuel garde `topcarzone.com` ;
- l'application CARZONE est disponible sur un sous-domaine propre ;
- une future migration du domaine principal reste possible.

Inconvénients :

- nécessite aussi un accès DNS ;
- l'adresse est moins directe que `topcarzone.com` ;
- il faudra mettre à jour l'URL TWA et `assetlinks.json` si on quitte l'URL Vercel.

## 7. Recommandation

Je recommande de ne pas modifier le DNS immédiatement.

Ordre recommandé :

1. Identifier le propriétaire de la zone Google Cloud DNS et du registrar.
2. Vérifier ce qui est hébergé sur le serveur nginx `35.204.150.5`.
3. Vérifier les enregistrements MX, TXT et les sous-domaines existants.
4. Décider si le site nginx doit être conservé ou remplacé.
5. Si l'application doit devenir le site principal, appliquer l'option A.
6. Sinon, choisir l'option B ou C.

## 8. Conséquence pour le mobile

Le mobile n'est pas bloqué.

Avant la bascule DNS, l'APK de debug installé sur le téléphone pointe encore vers `https://carzone-sarl.vercel.app`. Le code source est maintenant préparé pour `https://topcarzone.africa/dashboard`.

Après activation du domaine, il faudra :

- reconstruire l'APK avec la nouvelle URL ;
- réinstaller l'APK de test ;
- publier `assetlinks.json` sur le nouveau domaine ;
- ajouter l'empreinte de signature release.

Aucune de ces actions ne doit être faite avant d'avoir les accès DNS et d'avoir validé la stratégie de domaine.

## 9. Mise en service provisoire de topcarzone.africa

Le domaine `topcarzone.africa` a été ajouté au projet Vercel `carzone-sarl`.

Domaines attachés :

- `topcarzone.africa`
- `www.topcarzone.africa`

### Enregistrements Namecheap à appliquer

Dans Namecheap, onglet `Advanced DNS` :

1. Supprimer `URL Redirect Record` sur `@` qui pointe vers `http://www.topcarzone.africa/`.
2. Supprimer `CNAME Record` sur `www` qui pointe vers `parkingpage.namecheap.com`.
3. Vérifier qu'aucun ancien A `192.64.119.108` ne reste sur `@`.
4. Ajouter les deux A records suivants sur `@` :

```text
Type: A Record
Host: @
Value: 216.150.1.1
TTL: Automatic
```

```text
Type: A Record
Host: @
Value: 216.150.16.1
TTL: Automatic
```

5. Ajouter le CNAME suivant sur `www` :

```text
Type: CNAME Record
Host: www
Value: 25ecc0d0856b8e68.vercel-dns-017.com.
TTL: Automatic
```

6. Ne pas modifier les enregistrements MX.
7. Ne pas changer les nameservers si l'objectif est de garder la gestion DNS chez Namecheap.

### Vérification

Après sauvegarde et propagation :

```powershell
Resolve-DnsName topcarzone.africa
Resolve-DnsName www.topcarzone.africa
vercel domains verify topcarzone.africa
vercel domains verify www.topcarzone.africa
```

Vercel doit alors générer le certificat HTTPS.

### Application web

Le site utilise désormais `topcarzone.africa` comme URL publique par défaut :

- liens de contrats ;
- liens de factures ;
- métadonnées publiques ;
- partage des documents.

La variable `NEXT_PUBLIC_SITE_URL` permet de changer cette origine sans toucher au code.

### Application Android TWA

Après activation du domaine :

1. reconstruire l'APK avec `https://topcarzone.africa/dashboard` ;
2. réinstaller l'APK de test ;
3. vérifier que la TWA s'ouvre toujours sans barre d'adresse ;
4. vérifier que `/.well-known/assetlinks.json` est bien servi sur `topcarzone.africa`.

Le `.com` reste inchangé. Aucun enregistrement DNS du `.com` ne doit être modifié pendant cette phase.
