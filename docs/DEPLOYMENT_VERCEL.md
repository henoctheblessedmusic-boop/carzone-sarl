# Déploiement Vercel - CARZONE SARL

## Projet
- **Équipe Vercel** : `theblessed-team`
- **Projet** : `carzone-sarl` (`prj_FqBQKJ6M13p073JDRY9etXVLUFtV`)
- **Root directory** : `apps/web`
- **URL de production Vercel** : https://carzone-sarl.vercel.app
- **Domaine officiel prévu** : https://www.topcarzone.com (et https://topcarzone.com)

## État du DNS (bloquant externe)
Le domaine est bien rattaché au projet `carzone-sarl` dans Vercel, mais son DNS
n'est **pas encore** géré par Vercel :

- Serveurs de noms actuels : `ns-cloud-a1..a4.googledomains.com` (Google Cloud DNS)
- Résolution actuelle : `35.204.150.5` (ancien serveur nginx « Topcarzone »)

### Modifications DNS à appliquer chez Google Cloud DNS / le registrar
Pour `topcarzone.com` (apex) - remplacer l'enregistrement A existant :
```
A  @  216.150.1.1
A  @  216.150.16.1
```

Pour `www.topcarzone.com` - remplacer l'enregistrement A existant par :
```
CNAME  www  25ecc0d0856b8e68.vercel-dns-017.com.
```

Après propagation (quelques minutes à quelques heures), vérifier :
```bash
vercel domains verify topcarzone.com
vercel domains verify www.topcarzone.com
```

Alternative : déplacer les serveurs de noms du domaine vers Vercel DNS
(nécessite l'accès registrar) et laisser Vercel gérer les enregistrements.

## Déployer une nouvelle version (CLI)
Le fichier `.vercelignore` limite l'upload local (node_modules, .next, .dsh, etc.).
```bash
vercel --prod --yes
```

## Variables d'environnement utiles
- `DGI_EMECEF_MODE=DEMO` (production, actuellement) : mode démonstration e-MECeF,
  documents marqués DEMO, exclus de la comptabilité, watermark « sans valeur fiscale ».
- Passage en réel, avec le comptable :
  ```
  DGI_EMECEF_MODE=LIVE
  DGI_EMECEF_BASE_URL=https://sygmef.impots.bj/emcf/api
  DGI_EMECEF_JWT=...
  DGI_EMECEF_IFU=...
  DGI_EMECEF_NIM=...
  ```

## Vérifications après déploiement
```bash
curl -s https://carzone-sarl.vercel.app/ | grep -c "De votre choix à votre volant"
```
Attendu : `1`.

## Note Git
Le déploiement a été déclenché manuellement par CLI. Vérifier dans Vercel →
Settings → Git si le dépôt GitHub est bien connecté pour un déploiement
automatique à chaque push ; sinon utiliser `vercel git connect` ou redéployer
manuellement après chaque mise en production.
