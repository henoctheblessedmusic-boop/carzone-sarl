# Guide — Compte développeur e-MECeF / SyGMEF (SANDBOX)

> **Objectif** : permettre à Henoc (Giani / CARZONE Ops) d’obtenir un **compte développeur sur le serveur de test** DGI Bénin, puis de récupérer un **JWT** pour brancher plus tard l’adaptateur fiscal CARZONE.  
> **Périmètre** : documentation opérationnelle uniquement — **pas** d’implémentation API dans ce document.  
> **Sources** (consultées) : formulaire d’enregistrement, portail e-MECeF, Swagger/OpenAPI, page SDK, plaquette PDF DGI.

---

## Objectif

1. Déclarer le SFE **CARZONE Ops** (éditeur **Giani**) auprès de la DGI.
2. Obtenir un **compte développeur sandbox** (portail SyGMEF test).
3. Après validation (~72 h), se connecter, obtenir le **jeton JWT**, tester `GET /api/info/status`.
4. Préparer l’homologation (cas de tests / auto-déclaration) **avant** tout appel production.

---

## Prérequis (checklist)

À préparer **avant** d’ouvrir le formulaire :

| # | Élément | Détail |
|---|---------|--------|
| 1 | **IFU** valide | Identifiant fiscal unique de l’éditeur (ou de l’entité qui demande le compte). Vérifié en ligne au début du parcours. |
| 2 | **E-mail IFU à jour** | L’IFU doit être associé à un e-mail opérationnel. Sinon : [mise à jour IFU](https://ifu.impots.bj/mise-a-jour-ifu). |
| 3 | **Raison sociale / Nom** | Entreprise ou personne (éditeur du SFE). |
| 4 | **RCCM** | Numéro RCCM si applicable. |
| 5 | **Siège / adresse / ville / téléphone / e-mail** | Coordonnées éditeur (étape 1/3). |
| 6 | **Nom du logiciel (SFE)** | Recommandé pour CARZONE : **`CARZONE Ops`** (alternative courte : `CARZONE`). |
| 7 | **Version du logiciel** | Ex. **`0.1.0`** (alignée sur `apps/web/package.json` au moment de la demande). |
| 8 | **Pays d’origine** | Ex. **Bénin**. |
| 9 | **Nombre de clients actifs** | Estimation (peut être `0` ou `1` en phase projet). |
| 10 | **OS supportés** | Windows / Linux / Other + versions (ex. Linux serveur, Other = navigateur / Next.js). |
| 11 | **Approbation MCF existante** | Pour un nouveau SFE : **Non**. |
| 12 | **E-mail du compte développeur** | Boîte technique stable (accès Henoc / Giani) — distincte ou égale à l’e-mail IFU selon le parcours. |
| 13 | **Demandeur** | Nom & prénoms, titre (facultatif), lieu. |

**Rappel métier** : un SFE (Système de Facturation d’Entreprise) ne peut être utilisé en production e-MECeF qu’après **approbation DGI**. Le sandbox sert à intégrer l’API et à passer les cas de tests.

---

## Étapes numérotées — créer le compte sandbox

### Étape 0 — Lire le contexte (optionnel mais utile)

- Portail contribuable / présentation : [https://e-mecef.impots.bj/](https://e-mecef.impots.bj/)
- Plaquette PDF : [Plaquette e-MECeF](https://api.impots.bj/media/616853eb7b6c7_Plaquette%20emecef.pdf)
- Entrée développeur : [https://developper.impots.bj/sygmef-emcf](https://developper.impots.bj/sygmef-emcf)

### Étape 1 — Ouvrir le formulaire d’enregistrement développeur

**URL (sandbox)** :  
[https://developper.impots.bj/sygmef-emcf/Registration](https://developper.impots.bj/sygmef-emcf/Registration)

Message officiel (accueil) :

- Remplir **toutes** les questions du formulaire.
- Un e-mail de confirmation est envoyé après soumission.
- Après vérification DGI, réception sous **72 heures** d’un e-mail avec les instructions d’accès.
- Contacts indiqués sur la page : **téléphone 133**, **e-mail `cdgi@finances.bj`**.

### Étape 2 — Vérification IFU (pré-formulaire)

Le parcours commence par la saisie de l’**IFU** :

1. Saisir l’IFU.
2. Cas possibles (textes officiels du formulaire) :
   - **IFU valide** : la plateforme affiche un e-mail masqué/associé ; si vous le reconnaissez et qu’il fonctionne → **Continuer**. Sinon → mettre à jour via [https://ifu.impots.bj/mise-a-jour-ifu](https://ifu.impots.bj/mise-a-jour-ifu).
   - **Erreur « informations pas à jour »** → même lien de mise à jour IFU.
   - **Erreur « IFU ne peut pas être vérifiée »** → réessayer plus tard.

### Étape 3 — Formulaire 1/3 : Informations sur l’éditeur de SFE

| Champ | Obligatoire | Notes |
|-------|-------------|--------|
| **IFU** | Oui (pré-rempli / vérifié) | Éditeur |
| **Raison sociale / Nom et Prénoms** | Oui | Ex. Giani / entité légale |
| **RCCM** | Selon statut | Numéro d’immatriculation |
| **Adresse** (siège) | Oui (`*`) | |
| **Ville** | Oui (`*`) | |
| **Téléphone** | Oui (`*`) | |
| **E-mail** | Oui | Contact éditeur |

### Étape 4 — Formulaire 2/3 : Informations sur le SFE

| Champ | Obligatoire | Valeur suggérée CARZONE |
|-------|-------------|------------------------|
| **Nom du logiciel** | Oui (`*`) | `CARZONE Ops` (ou `CARZONE`) |
| **Version du logiciel** | Oui (`*`) | `0.1.0` (ou version courante) |
| **Pays d’origine** | Oui (`*`) | `Bénin` |
| **Nombre de clients actifs** | Oui (`*`) | `0` ou `1` |
| **Système d’exploitation** | Oui | Cases : **Windows** / **Linux** / **Other** (+ versions si demandées) |
| **SFE déjà approuvé pour MCF-machine ?** | Oui | **Non** (nouveau SFE logiciel e-MECeF) |
| **Référence lettre d’approbation DGI** | Si « Oui » | Laisser vide si Non |

### Étape 5 — Formulaire 3/3 : Informations sur le demandeur

Texte officiel : demande de compte développeur pour le **serveur de test** e-MECeF, avec l’e-mail du compte ci-dessous.

| Champ | Obligatoire | Notes |
|-------|-------------|--------|
| **E-mail pour le compte** | Oui | Compte sandbox SyGMEF test |
| **Nom et Prénoms** | Oui (`*`) | Demandeur (ex. Henoc …) |
| **Titre** | Non | Facultatif |
| **Lieu** | Oui (`*`) | Ville / lieu de la demande |

### Étape 6 — Vérification récapitulative puis soumission

Écran de contrôle listant les 3 blocs, puis **Soumettre la demande**.

Confirmation attendue :

- Date de la demande
- **ID de la demande** (`uid`) — lien de suivi du type  
  `/sygmef-emcf/Registration?uid=…`
- E-mail de confirmation / vérification envoyé à l’adresse indiquée
- **Délai de traitement : jusqu’à 72 heures**
- Vérifier le **dossier spam**

> Un second message peut demander de **finaliser** la demande via un lien e-mail avant traitement DGI.

### Étape 7 — Attendre l’e-mail DGI

Contenu attendu (d’après les messages du formulaire + plaquette / portail) :

- Instructions d’accès à la **plateforme de test**
- Identifiants de connexion (ou procédure d’activation / définition de mot de passe)
- Pour le portail contribuable e-MECeF, le **nom d’utilisateur est souvent l’IFU** ; sur le **portail développeurs**, suivre exactement l’e-mail reçu (login = e-mail du compte ou IFU selon le type de compte).

---

## Après validation — où se connecter, token, test `/api/info`

### 1. Connexion sandbox (portail développeurs SyGMEF)

| Ressource | URL |
|-----------|-----|
| Login développeurs (test) | [https://developper.impots.bj/sygmef-test/](https://developper.impots.bj/sygmef-test/) |
| Hub e-MECeF développeur | [https://developper.impots.bj/sygmef-emcf](https://developper.impots.bj/sygmef-emcf) |
| Mot de passe oublié | [https://developper.impots.bj/sygmef-test/Account/ForgotPassword](https://developper.impots.bj/sygmef-test/Account/ForgotPassword) |

Notes :

- Le login développeur affiche **« PORTAIL POUR LES DEVELOPPEURS »**.
- Une **2FA** peut être exigée (`/sygmef-test/Account/Login2FA`) — prévoir un moyen de recevoir le code.
- Sans compte autorisé : « Vous devez être autorisé pour accéder à SyGMEF. »

### 2. Documentation API & SDK (après accès)

| Ressource | URL |
|-----------|-----|
| Swagger UI (2 specs) | [https://developper.impots.bj/sygmef-emcf/swagger](https://developper.impots.bj/sygmef-emcf/swagger) |
| OpenAPI e-MCF V1 | `/sygmef-emcf/swagger/v1/swagger.json` |
| OpenAPI INTEGRATOR V1 | `/sygmef-emcf/swagger/integrator_v1/swagger.json` |
| Page SDK (exemples Java, C#, JS, Python, PHP) | [https://developper.impots.bj/sygmef-emcf/authorized/Sdk.html](https://developper.impots.bj/sygmef-emcf/authorized/Sdk.html) |

> La page SDK est sous chemin **`authorized/`** : l’accès peut nécessiter d’être connecté. Les exemples officiels montrent l’auth **Bearer JWT**.

Sur le portail e-MECeF (parcours éditeur SFE) :

1. Accéder à la plateforme de test avec le compte développeur.
2. Consulter la doc API et les SDK.
3. **Obtenir le jeton** pour autoriser l’API du SFE.
4. Télécharger le **document d’auto-déclaration** (cas de tests).
5. Quand les tests sont concluants → e-mail d’**approbation du SFE**.

Plaquette : envoyer les **vingt (20) cas de tests** à `emecefbenin@finances.bj` pour approbation.

### 3. Obtenir le JWT

- Le jeton est un **JWT** à placer dans l’en-tête HTTP :  
  `Authorization: Bearer <token>`  
  (schéma `Bearer` documenté dans le Swagger OpenAPI).
- Émis / récupéré depuis l’**interface de gestion** e-MECeF / SyGMEF (espace connecté) — un jeton par e-MCF selon les pratiques d’intégration.
- **Ne jamais** committer le JWT dans le dépôt Git ; le stocker hors code (`.env` local non versionné, secret manager).

### 4. Premier smoke test : `GET /api/info/status`

Base API **sandbox** : `https://developper.impots.bj/sygmef-emcf`

Exemple (PowerShell) :

```powershell
$token = "COLLER_LE_JWT_ICI"
Invoke-RestMethod `
  -Uri "https://developper.impots.bj/sygmef-emcf/api/info/status" `
  -Headers @{ Authorization = "Bearer $token" }
```

Réponse attendue (schéma `InfoResponseDto`) : champs du type `status`, `version`, `ifu`, `nim`, `tokenValid`, `serverDateTime`, `emcfList`, …

Autres endpoints info utiles (même auth) :

- `GET /api/info/taxGroups`
- `GET /api/info/invoiceTypes`
- `GET /api/info/paymentTypes`
- `GET /api/invoice` (statut / file d’attente)

Flux facture (à brancher plus tard dans l’adaptateur CARZONE, **sandbox only** tant que non homologué) :

1. `POST /api/invoice` → `uid`
2. `GET /api/invoice/{uid}`
3. `PUT /api/invoice/{uid}/confirm` → éléments de sécurité (`qrCode`, `codeMECeFDGI`, `nim`, compteurs…)
4. éventuel `PUT /api/invoice/{uid}/cancel`

---

## URLs sandbox vs production

| Usage | Sandbox (test) | Production |
|-------|----------------|------------|
| **Base API e-MCF** | `https://developper.impots.bj/sygmef-emcf` | `https://sygmef.impots.bj/emcf` |
| **Info** | `…/api/info/status` (etc.) | `…/api/info/status` (etc.) |
| **Factures** | `…/api/invoice` | `…/api/invoice` |
| **Portail login dev** | `https://developper.impots.bj/sygmef-test/` | (portail prod SyGMEF / e-MECeF — comptes homologués) |
| **Enregistrement compte dev** | `https://developper.impots.bj/sygmef-emcf/Registration` | N/A (ce formulaire = serveur de **test**) |
| **Swagger** | `https://developper.impots.bj/sygmef-emcf/swagger` | Doc de référence souvent sur le même host développeur |
| **Portail contribuable** | — | [https://e-mecef.impots.bj/](https://e-mecef.impots.bj/) |
| **SyGMEF prod (réf. publique)** | — | `https://sygmef.impots.bj` / `https://sygmef.impots.bj/emcf` |

SDK officiel (extrait) : par défaut configuré pour **SyGMEF-test** ; pour la prod, base path :

```text
https://sygmef.impots.bj/emcf
```

> Orthographe host développeur : **`developper.impots.bj`** (avec deux « p ») — c’est l’URL officielle DGI.

---

## Contacts DGI

| Canal | Coordonnée | Source |
|-------|------------|--------|
| Téléphone court | **133** | Page Registration |
| E-mail (formulaire enregistrement) | **cdgi@finances.bj** | Page Registration |
| E-mail e-MECeF / tests | **emecefbenin@finances.bj** | Plaquette PDF |
| Téléphone (plaquette) | **(+229) 90 19 00 00** | Plaquette PDF |
| Mise à jour IFU | [https://ifu.impots.bj/mise-a-jour-ifu](https://ifu.impots.bj/mise-a-jour-ifu) | Formulaire Registration |
| Site Impôts | [https://www.impots.finances.gouv.bj](https://www.impots.finances.gouv.bj) | Contact OpenAPI |

---

## Préparation CARZONE (valeurs à déclarer)

À utiliser de façon **cohérente** sur le formulaire et dans les futurs tickets / `.env.example` :

| Rubrique | Valeur recommandée |
|----------|--------------------|
| **Nom SFE** | `CARZONE Ops` (préféré) ou `CARZONE` |
| **Version** | `0.1.0` (suivre `apps/web/package.json`) |
| **Éditeur** | **Giani** (raison sociale / nom légal exact de l’entité IFU) |
| **Pays d’origine** | Bénin |
| **Déjà approuvé MCF ?** | Non |
| **Environnement technique cible** | API sandbox uniquement jusqu’à homologation |
| **Auth future** | Header `Authorization: Bearer <JWT>` |

Variables d’environnement **prévues** (ne pas les peupler en prod avant homologation) :

```env
# Exemple — à créer plus tard dans .env (non versionné)
DGI_EMECEF_BASE_URL=https://developper.impots.bj/sygmef-emcf
DGI_EMECEF_JWT=
DGI_EMECEF_IFU=
```

---

## Ce qu’il NE FAUT PAS faire

1. **Ne pas** générer localement un faux QR / `codeMECeFDGI` / NIM — seuls les éléments renvoyés par l’API DGI après `confirm` sont valides.
2. **Ne pas** pointer l’adaptateur CARZONE vers **`https://sygmef.impots.bj/emcf`** tant que le SFE n’est **pas homologué** et que le compte / jeton prod n’est pas délivré.
3. **Ne pas** committer JWT, mots de passe, ou captures d’écran contenant des secrets.
4. **Ne pas** confondre :
   - compte **contribuable** e-MECeF (émission factures / e-SFE) ;
   - compte **développeur** sandbox (intégration SFE + tests) ;
   - API **INTEGRATOR** (parcours partenaires — hors besoin immédiat CARZONE Ops).
5. **Ne pas** déclarer le SFE comme « déjà approuvé » sans lettre DGI réelle.
6. **Ne pas** utiliser l’orthographe erronée `developer.impots.bj` (un « p ») — l’hôte officiel est `developper.impots.bj`.

---

## Annexes

### A. Champs exacts du récapitulatif (formulaire)

Extraits des labels affichés sur l’écran de vérification :

**1/3 Éditeur** : IFU · Raison sociale / Nom et Prénoms · RCCM · E-mail pour le compte · Adresse · Ville · Téléphone · E-mail  

**2/3 SFE** : Nom du logiciel · Version · Pays d’origine · Nombre de clients actifs · Windows / Linux / Others (+ versions) · SFE déjà approuvé (Non / Oui + référence lettre)  

**3/3 Demandeur** : Nom et Prénoms · Titre · Lieu  

### B. Limites de visibilité

- Les écrans **post-login** (emplacement exact du bouton « obtenir le jeton », téléchargement auto-déclaration) ne sont **pas** accessibles sans compte approuvé : la procédure token / tests reprend les textes du portail public e-MECeF, de la plaquette et du SDK.
- Si l’UI change, se fier à l’e-mail DGI + Swagger live.

### C. Prochaine étape technique (hors scope de ce guide)

Implémenter l’adaptateur fiscal CARZONE (client HTTP sandbox, `info` → `invoice` → `confirm`, persistance des éléments de sécurité) **après** réception du JWT sandbox.

---

*Document maintenu pour le projet CARZONE Ops (Giani). Dernière revue des sources publiques DGI : septembre 2026.*
