# Parité Android - Étape 1 : inventaire

Date : 2026-11-07
Périmètre : dépôt CARZONE SARL Ops, application `apps/web`.
Statut : inventaire statique uniquement.

> Aucun test Android n'a été effectué à cette étape. Aucun APK, aucun émulateur et aucun appareil réel n'ont été utilisés. Les comportements Android décrits ci-dessous sont des attentes à vérifier, pas des résultats de test.

## 0. Décisions déjà fournies et points à valider

Paramètres fournis par le client :

- Nom affiché : `CARZONE`
- Identifiant Android proposé : `com.topcarzone.app`

Avis technique sur l'identifiant :

- `com.topcarzone.app` est syntaxiquement valide et cohérent avec le domaine `topcarzone.com` visible dans le projet.
- L'identifiant d'application est définitif après la première publication sur Google Play. Il faut donc le figer avant l'étape 3.
- Pour une application interne d'exploitation, `com.topcarzone.ops` est plus explicite que `com.topcarzone.app`. L'identifiant `com.topcarzone.app` reste acceptable si cette application est le point d'entrée principal de la marque.
- Il faut éviter `com.carzone.app` sauf si le domaine `carzone.*` est réellement contrôlé par CARZONE SARL. La convention Android est un nom de domaine inversé.
- Vérifier avant publication qu'aucun paquet `com.topcarzone.app` n'existe déjà sur Google Play.
- Le nom de package doit rester en minuscules, sans tiret et sans accent.

Décision retenue : `com.topcarzone.app` pour l'application principale. Un futur module véhicule aura son propre identifiant, par exemple `com.topcarzone.vehicle`.

### Domaine et identifiant

Le client ne dispose pas encore des accès au domaine `topcarzone.com` et envisage d'acheter `topcarzone.africa`.

Recommandations :

- Le nom de package Android ne dépend pas juridiquement de la propriété d'un domaine. `com.topcarzone.app` reste techniquement valable même sans accès au `.com`.
- Garder `com.topcarzone.app` comme choix principal evite de lier l'application à un domaine qui n'est pas encore contrôlé.
- Si le client veut absolument aligner le package sur le domaine qu'il contrôlera, il faudrait utiliser `africa.topcarzone.app`, mais ce format est moins habituel. Il faut le décider avant la première publication Play Store.
- Ne pas utiliser `com.carzone.app` sans contrôle du domaine `carzone.*`.
- `topcarzone.africa` peut être acheté comme domaine régional et défensif, mais il ne remplace pas le `.com` pour l'identité, les emails et les liens existants.
- Tant que le `.com` n'est pas sous contrôle de CARZONE SARL, il existe un risque de continuité : expiration, perte de DNS, perte des emails `contact@topcarzone.com` et `direction@topcarzone.com`, ou modification des liens publics.
- Le `.africa` doit être enregistré au nom de CARZONE SARL, sur un compte professionnel avec double authentification, renouvellement automatique et contacts administratifs de l'entreprise.
- Ne pas migrer les emails, les liens publics ou l'API vers `.africa` avant d'avoir une stratégie de redirection et de conservation du `.com`.
- L'adresse de l'API mobile devra être configurable par environnement, sans coder en dur `topcarzone.com`, `topcarzone.africa` ou `carzone-sarl.vercel.app`.

### Mode de distribution et futur module véhicule

Décisions produit à prendre en compte :

- L'application CARZONE ne sera pas publiée publiquement sur Google Play.
- Elle sera installée dans l'entreprise, sur un parc maîtrisé.
- Un second module Android est prévu plus tard, dans les véhicules des clients, pour suivre le kilométrage et anticiper la maintenance.

Conséquences pour l'identifiant et la distribution :

- `com.topcarzone.app` reste valable pour l'application principale, même sans Play Store. L'identifiant est simplement un namespace Android.
- Le futur module véhicule doit avoir un identifiant distinct, par exemple `com.topcarzone.vehicle` ou `com.topcarzone.telemetry`. Il ne faut pas réutiliser `com.topcarzone.app` pour deux applications différentes.
- Deux applications distinctes doivent avoir deux clés de signature distinctes, deux numéros de version et deux canaux de mise à jour.
- La distribution entreprise peut se faire par APK signé, par MDM ou par un catalogue privé. Une publication Play Store publique n'est pas nécessaire.
- Pour un pilote, un APK signé distribué par un canal HTTPS contrôlé peut suffire. Pour un parc de plusieurs appareils, un MDM est préférable pour les mises à jour, la révocation et les politiques de sécurité.
- Android peut afficher un avertissement lors de l'installation hors Play Store. Sur un parc d'entreprise, cet avertissement doit être encadré par une politique MDM ou une procédure d'installation documentée.
- Un APK ne peut pas lire le kilométrage d'un véhicule seul. Le module véhicule devra être relié à une source de données : boîtier télématique, adaptateur OBD-II, bus CAN ou API constructeur. Le choix du matériel est une décision d'architecture séparée.
- Le module véhicule devra traiter le consentement client, la géolocalisation éventuelle, la sécurité des données et la mise à jour à distance.
- Le backend pourra être partagé avec l'application principale, mais les applications Android resteront deux produits distincts.

## 1. Pile technique et rendu

| Élément | Constat |
|---|---|
| Framework | Next.js 15.2.9, App Router |
| UI | React 19, composants serveur par défaut, composants client pour les interactions |
| Langage | TypeScript strict, ESLint présent mais ignoré pendant le build |
| Base de données | Prisma 5.22.0, PostgreSQL, base Neon en production |
| Déploiement | Vercel, branche `main`, URL canonique `https://carzone-sarl.vercel.app` |
| Dossier produit | `apps/web` |
| Dossier racine | Pas de `package.json` racine. Les commandes se lancent dans `apps/web` |
| Build web | `npm run build`, soit `prisma generate && next build` |
| Démarrage local | `npm run dev` |
| Démarrage production | `npm run start` après build |
| Rendu | Principalement serveur. Les pages lisent cookies, sessions et base à chaque requête. Le site public est rendu côté serveur pour le SEO |
| Export statique | Absent. Aucun `output: "export"`, aucun export de site statique |
| PWA | Absente. Aucun manifeste, aucun service worker, aucun cache hors ligne |
| Projet mobile existant | Aucun dossier `mobile/`, `android/` ou configuration Capacitor dans le dépôt |
| Images distantes | `next.config.ts` autorise actuellement tous les hôtes HTTP et HTTPS. Des images de catalogue viennent de Wikimedia et le QR de facture vient de `api.qrserver.com` |
| Analytics | `@vercel/analytics` côté site public |
| Polices | `Poppins` via `next/font/google` pour la vitrine |

Conséquence mobile importante : l'application n'est pas un site statique. Une WebView qui embarque uniquement des fichiers locaux ne peut pas reproduire le rendu serveur, les cookies HttpOnly et les server actions. TWA et Capacitor devront donc pointer vers une origine serveur réelle ou vers un proxy équivalent. Ce point sera comparé à l'étape 2.

## 2. Connexion, sessions et redirections

### Méthode actuelle

- Authentification par email et mot de passe uniquement.
- Aucun Google, Facebook, OAuth, magic link ou fournisseur social.
- La page `/login` poste vers `POST /api/auth/login`.
- L'API accepte un formulaire HTML ou du JSON.
- En cas de succès, un cookie `carzone_session` est créé.
- Le cookie contient un payload signé HMAC-SHA256 : identifiant, email, nom, rôle, permissions, version de session et indicateur de changement de mot de passe obligatoire.
- Cookie `HttpOnly`, `SameSite=Lax`, `Secure` en production, durée 14 jours.
- `getSession` relit la base à chaque appel pour vérifier le statut actif, le rôle, les permissions et la version de session.
- Le middleware vérifie aussi la signature et l'expiration du cookie, puis applique une première règle de routage par rôle.
- Les mots de passe sont hachés avec bcrypt.
- Le changement de mot de passe obligatoire est affiché par un popup interne après connexion.

### Redirections

| Situation | Comportement |
|---|---|
| Page protégée sans session | Redirection vers `/login?from=...` |
| `/login` avec cookie déjà valide | Redirection vers `/dashboard` |
| Connexion réussie | Redirection vers `/dashboard` |
| Échec de connexion | Redirection vers `/login` avec un paramètre d'erreur |
| Compte verrouillé | Redirection vers `/login` avec le temps restant |
| Rôle non autorisé sur une page | Redirection vers `/dashboard` |
| Déconnexion | `POST /api/auth/logout`, suppression du cookie, redirection vers `/login` |
| Changement de mot de passe forcé | Suppression du cookie puis redirection vers `/login?passwordChanged=1` |
| Contrat public | `/contrat/[token]`, accessible sans session si le token existe |

Le paramètre `from` est ajouté par le middleware, mais la route de connexion redirige actuellement toujours vers `/dashboard`. Aucun retour automatique vers la page demandée n'est implémenté.

### Conséquences Android

- Il n'y a pas de connexion Google à adapter aujourd'hui. Le point soulevé dans le brief sur Google et les WebViews ne concerne pas le code actuel.
- Une WebView doit conserver le cookie de session entre les lancements de l'application.
- Un wrapper qui change l'origine, par exemple `https://localhost` en local, rendrait le cookie cross-site et pourrait empêcher son envoi à cause de `SameSite=Lax`.
- Le comportement attendu sur Android est une connexion identique au web, puis une session persistante et révocable.
- Si un fournisseur OAuth est ajouté plus tard, il faudra ouvrir le flux dans le navigateur du téléphone ou un Custom Tab, pas dans la WebView intégrée.

## 3. API et réseau

### Adresse de base

- Les appels navigateur utilisent exclusivement des chemins relatifs : `/api/...`.
- Aucun `NEXT_PUBLIC_API_URL` ni variable d'API publique n'est utilisée.
- Le site et l'API sont servis par la même origine en production.
- Les appels externes sont faits côté serveur : OpenAI, DeepSeek, passerelle IA Vercel, DGI e-MECeF et VAPI.

### CORS et cookies

- Aucun en-tête CORS n'est défini dans `next.config.ts` ou dans les routes API.
- Aucun `Access-Control-Allow-Origin`.
- Les appels sont donc prévus en same-origin.
- Les cookies de session sont HttpOnly et SameSite Lax.
- Une application Capacitor servie depuis une origine locale, ou une WebView servie depuis un schéma différent, devra résoudre deux problèmes : autoriser l'origine et envoyer le cookie.

### Routes API inventoriées

| Route | Méthodes | Accès | Réponse et usage |
|---|---|---|---|
| `/api/auth/login` | POST | Public | Authentifie et crée le cookie, redirige ou retourne du JSON |
| `/api/auth/logout` | POST | Public | Supprime le cookie et redirige vers `/login` |
| `/api/ai/settings` | GET, POST | Session ; POST réservé à certains rôles | GET retourne une clé OpenAI masquée ; POST enregistre une clé |
| `/api/ai/tech-sheet` | POST | Session et permission `vehicles:write` | Génère et sauvegarde une fiche technique |
| `/api/calls` | GET, POST | Session | Signalisation WebRTC, historique, candidats ICE |
| `/api/calls/conference` | GET, POST | Session | Salons, participants, invitations, fermeture |
| `/api/chat/unread` | GET, POST | Session | Messages non lus et présence |
| `/api/notifications` | GET, POST | Session | Notifications filtrées par rôle et politique |
| `/api/public/lead` | POST | Public | Création d'un lead depuis la vitrine, validation Zod et rate limit mémoire |
| `/api/public/rental-request` | POST | Public | Demande de location, validation Zod, pas de rate limit partagé |
| `/api/reports/financial-excel` | GET | Session et permission `financial_report:export` | Fichier XLSX en pièce jointe |
| `/api/terminal/meta` | GET | Session et permission `charging:read` | Bornes, clients et tarifs |
| `/api/terminal/pay` | POST | Session et permission `charging:write` | Session de recharge et facture simulée |
| `/api/vapi/webhook` | POST, GET | Public | Outils vocaux VAPI, contrôle par secret uniquement si la variable existe |
| `/api/workshop/export` | GET | Session et permission `workshop:read` | Fichier XLSX de l'historique atelier |
| `/api/workshop/template` | GET | Session | Modèle XLSX atelier en pièce jointe |

### Conséquences Android

- Sans couche native, toutes les routes doivent être appelées sur la même origine que la page.
- Les réponses XLSX utilisent `Content-Disposition: attachment`. Une WebView Android ne télécharge pas automatiquement ces réponses sans gestion native.
- Les réponses d'erreur sont majoritairement du JSON, sauf `workshop/template` qui retourne du texte brut en cas de 401.
- Le web utilise des server actions pour de nombreuses mutations. Ces appels ne sont pas des APIs REST publiques et ne sont pas conçus pour être appelés directement par une application native séparée.
- Une réécriture native complète devrait recréer ou exposer ces server actions en API. Un wrapper WebView ou TWA évite ce travail.

## 4. Pages et fonctionnalités

### 4.1 Pages publiques et authentification

| Route | Accès | Fichiers principaux | Fonctionnalités | Attente Android et adaptation |
|---|---|---|---|---|
| `/` | Public | `src/app/(site)/page.tsx`, `src/components/site/*` | Vitrine CARZONE, hero animé, sections, CTA, WhatsApp | Rendu responsive attendu. Les liens WhatsApp et téléphone doivent ouvrir l'application externe. |
| `/vehicules` | Public | `(site)/vehicules/page.tsx`, `VehiclesCatalog.tsx`, `VehicleCard.tsx`, `VehicleDetailModal.tsx`, `QuoteRequestProvider.tsx` | Catalogue véhicules, filtres, fiche détail, demande de cotation | Les modales doivent se fermer avec le bouton retour Android. Le formulaire poste vers `/api/public/lead`. |
| `/location-vehicule` | Public | `(site)/location-vehicule/page.tsx`, `RentalVehiclesCatalog.tsx` | Véhicules de location, estimation, demande de location | Sélecteurs de date Android. Le formulaire poste vers `/api/public/rental-request`. |
| `/sur-mesure` | Public | `(site)/sur-mesure/page.tsx` | Offre sur mesure, CTA, WhatsApp | Même comportement que le site web. |
| `/nos-services` | Public | `(site)/nos-services/page.tsx` | Services atelier, recharge, accompagnement | Même comportement que le site web. |
| `/recharge` | Public | `(site)/recharge/page.tsx` | Offre de recharge et bornes | Même comportement que le site web. |
| `/equipe` | Public | `(site)/equipe/page.tsx` | Présentation de l'équipe | Même comportement que le site web. |
| `/contact` | Public | `(site)/contact/page.tsx`, `ContactForm.tsx` | Formulaire de contact par email et WhatsApp | Le formulaire utilise `mailto:`. Sur Android, prévoir un fallback si aucune application email n'est configurée. |
| `/confidentialite` | Public | `(site)/confidentialite/page.tsx` | Politique de confidentialité | Lecture seule. |
| `/mentions-legales` | Public | `(site)/mentions-legales/page.tsx` | Mentions légales | Lien externe vers Vercel à ouvrir dans le navigateur. |
| `/contrat/[token]` | Public avec token | `src/app/contrat/[token]/page.tsx`, `RentalContractDocument.tsx`, `RentalContractActions.tsx` | Contrat de location partageable, impression, envoi client | Aucune authentification. Si un lien est partagé, il doit rester ouvrable dans un navigateur. Le bouton imprimer doit être adapté. |
| `/login` | Public | `src/app/login/page.tsx`, `LoginFeedback.tsx` | Connexion email et mot de passe, erreurs, verrouillage | Cookie persistant dans le WebView ou TWA. Pas d'OAuth social. |

### 4.2 Pages internes

| Route | Accès | Fichiers principaux | Fonctionnalités | Attente Android et adaptation |
|---|---|---|---|---|
| `/dashboard` | Session | `dashboard/page.tsx`, `RoleDashboard.tsx`, `components/ExecutiveDashboardCharts.tsx`, `DashboardActivityChart.tsx`, `DashboardAutoRefresh.tsx` | Tableaux de bord par rôle, KPI, graphiques, actualisation automatique | Les graphiques et grilles doivent rester lisibles sur petit écran. L'actualisation automatique doit s'arrêter ou se suspendre en arrière-plan. |
| `/clients` | Session | `clients/page.tsx`, `ClientsView.tsx`, `ClientImportModal.tsx`, `clients/actions.ts` | Liste clients, création, modification, import Excel/CSV, export CSV, documents KYC | Import par file picker Android. Export CSV et documents à télécharger via gestionnaire natif. |
| `/clients/[id]` | Session | `clients/[id]/page.tsx` | Fiche client, coordonnées, documents, historique | Téléphone et email doivent ouvrir les applications natives. Téléchargement de pièces jointes à adapter. |
| `/leads` | Session, rôles CRM | `leads/page.tsx`, `LeadsView.tsx`, `leads/actions.ts` | Prospects, avancement, relances | Formulaires et listes. Clavier et scroll à vérifier. |
| `/opportunities` | Session, rôles CRM | `opportunities/page.tsx` | Pipeline commercial, étapes, montants | Tableau large à rendre utilisable en portrait. |
| `/vehicles` | Session, rôles véhicules | `vehicles/page.tsx`, `VehiclesView.tsx`, `vehicles/actions.ts` | Stock showroom, statuts, création, modification, suppression, photos | Aucun appareil photo natif dans le code actuel. Les images viennent de fichiers publics ou d'URL. |
| `/vehicles/[id]/fiche-technique` | Session, rôles véhicules | `vehicles/[id]/fiche-technique/page.tsx`, `TechSheetActionBar.tsx`, `TechSheetAIActions.tsx`, `VehicleTechSheetPrint.tsx` | Fiche technique, génération IA, confirmation, impression | Appels `/api/ai/tech-sheet` et `/api/ai/settings`. Impression Android à adapter. |
| `/workshop` | Session, rôles atelier | `workshop/page.tsx`, `WorkshopView.tsx`, `workshop/actions.ts`, `components/workshop/WorkshopTabletModal.tsx` | Entrées atelier, import Excel, export Excel, inspection tablette, signatures, photos et fiches | Import file picker, export XLSX, signature tactile, impression. Points mobiles majeurs. |
| `/workshop/[id]/fiche-intervention` | Session, rôles atelier | `workshop/[id]/fiche-intervention/page.tsx`, `components/workshop/FicheInterventionPrint.tsx` | Fiche d'intervention imprimable | Impression et lecture PDF à adapter. |
| `/workshop/[id]/fiche-entretien` | Session, rôles atelier | `workshop/[id]/fiche-entretien/page.tsx`, `components/workshop/FicheEntretienSystematiquePrint.tsx` | Fiche d'entretien systématique imprimable | Impression et signature à adapter. |
| `/parts` | Session, rôles pièces | `parts/page.tsx`, `PartsView.tsx`, `parts/actions.ts` | Pièces, fournisseurs, commandes, stock, mouvements | Aucun besoin natif spécifique. |
| `/parts/catalogue` | Session, rôles pièces | `parts/catalogue/page.tsx` | Catalogue pièces interne | Recherche et tableaux à vérifier en portrait. |
| `/catalogue-pieces` | Session, rôles catalogue | `catalogue-pieces/page.tsx`, `GeneralPartsCatalogView.tsx`, `catalogue-pieces/actions.ts` | Catalogue général, références OEM, compatibilités, commandes groupées | Import de fichiers et tableaux volumineux. Vérifier performance mobile. |
| `/admin/import-pieces` | Session, rôles import | `admin/import-pieces/page.tsx` | Import CSV, XLSX ou JSON du catalogue, téléchargement du modèle CSV | File picker Android, gros fichiers, mémoire et validation MIME. |
| `/imports` | Session, rôles stock | `imports/page.tsx` | Commandes d'import, ports, statuts, synchronisation stock | Formulaires et tableaux. |
| `/catalog` | Session, rôles stock | `catalog/page.tsx` | Marques, modèles, catégories, énergies | Formulaires et tables. |
| `/quotes` | Session, rôles devis | `quotes/page.tsx`, `QuotesView.tsx`, `QuoteCreator.tsx`, `QuoteEditorModal.tsx`, `TranscribeQuoteModal.tsx`, `quotes/actions.ts` | Devis, proformas, création, édition, transcription en facture, envoi | Modales plein écran et clavier. Liens `mailto:` et impression. |
| `/quotes/[id]/print` | Session, rôles devis | `quotes/[id]/print/page.tsx`, `components/PrintButton.tsx` | Devis imprimable, CGV, fiche technique, envoi email | `window.print()` non supporté directement par une WebView Android sans adaptation. |
| `/invoices` | Session, rôles factures | `invoices/page.tsx`, `InvoicesView.tsx`, `PaymentModal.tsx`, `InvoiceEmailModal.tsx`, `FinancialBilanTab.tsx`, `invoices/actions.ts` | Factures, encaissements, certification DGI, envoi email, bilan financier | Téléchargement Excel, impression, liens email. Pas de SDK de paiement natif. |
| `/invoices/[id]/print` | Session, rôles factures | `invoices/[id]/print/page.tsx` | Facture normalisée, QR e-MECeF, impression | L'image QR vient de `api.qrserver.com`. Prévoir cache ou génération locale si le réseau est absent. |
| `/invoices/payments/[id]/receipt` | Session, rôles factures | `invoices/payments/[id]/receipt/page.tsx` | Reçu de paiement imprimable | Impression à adapter. |
| `/delivery-notes` | Session, rôles BL | `delivery-notes/page.tsx`, `DeliveryNotesView.tsx`, `delivery-notes/actions.ts` | Bons de livraison, création, annulation, impression | Impression et téléchargement. |
| `/delivery-notes/[id]/print` | Session, rôles BL | `delivery-notes/[id]/print/page.tsx` | BL imprimable | Impression à adapter. |
| `/expenses` | Session, rôles dépenses | `expenses/page.tsx`, `ExpensesView.tsx`, `PurchaseOrderDocument.tsx`, `PurchaseOrderPrintToolbar.tsx`, `expenses/actions.ts` | Dépenses, paiements, bons de commande | Impression et modales. |
| `/expenses/[id]/purchase-order/print` | Session, rôles dépenses | `expenses/[id]/purchase-order/print/page.tsx` | Bon de commande imprimable | Impression à adapter. |
| `/rentals` | Session, rôles location | `rentals/page.tsx`, `RentalActionModals.tsx`, `rentals/actions.ts` | Locations, paiements, maintenance, contrats, fiches techniques, demandes | Impression, signatures, partage de contrat, liens WhatsApp. |
| `/rentals/[id]/contrat` | Session, rôles location | `rentals/[id]/contrat/page.tsx`, `RentalContractDocument.tsx` | Contrat interne, signature, impression | `window.print` et signature à adapter. |
| `/rentals/[id]/fiche-technique` | Session, rôles location | `rentals/[id]/fiche-technique/page.tsx` | Fiche technique de véhicule de location | Impression et génération IA. |
| `/fleet` | Session, rôles flotte | `fleet/page.tsx` | Comptes flotte, véhicules, chauffeurs | Formulaires et tableaux. |
| `/charging` | Session, rôles recharge | `charging/page.tsx` | Abonnements recharge, bornes, factures | Tableaux et formulaires. |
| `/charge-requests` | Session, rôles recharge | `charge-requests/page.tsx` | Demandes d'installation de bornes, devis installateurs | Formulaires, sélection de modèles, tableaux. |
| `/installers` | Session, rôles installateurs | `installers/page.tsx` | Installateurs partenaires, spécialités, devis | Formulaires et tableaux. |
| `/terminal` | Session, rôle bornes | `terminal/page.tsx`, `api/terminal/meta`, `api/terminal/pay` | Terminal de recharge, sélection client, paiement simulé, facture | Écran souvent utilisé en kiosque. Le paiement n'est pas un SDK natif. Vérifier verrouillage écran et plein écran. |
| `/services` | Session | `services/page.tsx`, `ServicesView.tsx`, `services/actions.ts` | Articles et services facturables | Formulaires et tableaux. |
| `/hr` | Session, rôles RH | `hr/page.tsx`, `HRView.tsx`, `hr/components/*`, `hr/actions.ts` | Employés, départements, congés, paie, impressions | Données confidentielles. Tables larges et impression. |
| `/users` | Session, rôles administration | `users/page.tsx`, `UsersView.tsx`, `users/actions.ts` | Utilisateurs, rôles, permissions, mots de passe, notifications | Popup de changement de mot de passe déjà présent côté web. Vérifier clavier et modales. |
| `/mailbox` | Session | `mailbox/page.tsx`, `MailboxView.tsx`, `mailbox/actions.ts` | Messagerie interne, lecture, étoiles, envoi, suppression | Aucun client mail natif. Données stockées côté application. |
| `/chat` | Session | `chat/page.tsx`, `ChatView.tsx`, `chat/actions.ts`, `chat/components/CallHistoryView.tsx`, `ConferenceRoomView.tsx`, `components/GlobalCallManager.tsx` | Messagerie, présence, appels audio, conférences, historique | Microphone, WebRTC, polling, notifications, arrière-plan, permissions Android. |
| `/audit` | Session, rôles audit | `audit/page.tsx`, `AuditView.tsx` | Journal d'audit, filtres, actions, rôles | Tableaux larges et lecture seule. |
| `/audit/journalier` | Session, rôles audit | `audit/journalier/page.tsx`, `DailyAuditPrintButton.tsx` | Journalier, impression | `window.print` à adapter. |
| `/garage-supervision` | Session, rôles supervision | `garage-supervision/page.tsx`, `GarageSupervisionView.tsx`, `garage-supervision/actions.ts` | Supervision atelier, coûts, approbations | Liens externes et tableaux. |
| `/presentation` | Session | `presentation/page.tsx`, `PresentationClient.tsx` | Présentation motion design, plein écran, enregistrement d'écran | `getDisplayMedia` et enregistrement ne sont pas garantis sur Android mobile. Fonction à tester ou à adapter nativement. |

### 4.3 Fonctionnalités transverses

| Fonctionnalité | Fichiers principaux | Comportement web | Attente Android et adaptation |
|---|---|---|---|
| Navigation et menu latéral | `components/AppShell.tsx`, `AppShellClient.tsx`, `StickyNav.tsx` | Menu desktop et tiroir mobile, filtrage des liens par rôle | Vérifier le tiroir, le scroll et le bouton retour Android |
| Notifications internes | `components/AdminNotificationsBell.tsx`, `api/notifications/route.ts` | Cloche, polling toutes les 5 secondes, filtres par rôle | Permission de notification, affichage en arrière-plan et notification native |
| Centre d'aide | `components/HelpCenterModal.tsx` | Aide contextuelle par rôle | Modale et clavier à vérifier |
| Onboarding | `components/OnboardingHost.tsx`, `lib/onboarding.ts` | Parcours de découverte au premier usage | Stockage local, fermeture et bouton retour |
| Préférences thème et langue | `components/PrefsProvider.tsx`, `PrefsControls.tsx`, `RootPrefs.tsx` | Thème sombre, clair, auto et langue FR/EN/ZH | Persistance Android et rechargement |
| Permissions appareil | `components/DevicePermissionsSetup.tsx` | Notifications, micro, test audio, stockage local | Permission Android micro et notifications. Ne pas promettre les notifications sans test |
| Changement de mot de passe | `components/ChangePasswordModal.tsx`, `MandatoryPasswordChangeModal.tsx` | Changement volontaire et changement obligatoire | Clavier, champs mot de passe et redirection après changement |
| Appels globaux | `components/GlobalCallManager.tsx` | Appels audio, appels entrants, sonnerie, WebRTC, polling | Micro, arrière-plan, audio focus, TURN et permissions Android |
| Impression centralisée | `components/PrintButton.tsx` | Bouton `window.print` | Adaptation native obligatoire |
| Formulaires publics | `components/site/QuoteRequestProvider.tsx`, `RentalVehiclesCatalog.tsx`, `ContactForm.tsx` | Cotation, location, contact, consentement | Clavier, validation, mailto, WhatsApp et perte de réseau |
| Analytics | `@vercel/analytics` | Mesure des conversions de la vitrine | Vérifier la politique de confidentialité mobile et le consentement |

## 5. Points sensibles mobiles

Cette matrice décrit le comportement attendu sur Android et l'adaptation minimale à prévoir. Aucun de ces points n'a été testé sur Android à ce stade.

| Point | Implémentation web actuelle | Fichiers | Attente Android | Adaptation nécessaire |
|---|---|---|---|---|
| Bouton retour | Aucun gestionnaire `popstate` ou `BackHandler`. Les modales sont souvent de simples états React. | `AppShellClient.tsx`, toutes les vues avec modales | Le retour doit fermer une modale ou revenir à l'écran précédent, pas quitter l'application brutalement | Intercepter le bouton retour natif, fermer la modale active, puis laisser le routeur revenir en arrière |
| Connexion | Email et mot de passe, cookie HttpOnly | `login/page.tsx`, `api/auth/login/route.ts`, `lib/auth.ts` | Même écran de connexion. Cookie persistant | WebView avec gestion des cookies ou TWA. Pas d'OAuth à adapter actuellement |
| Déconnexion | POST vers `/api/auth/logout` | `api/auth/logout/route.ts` | Déconnexion effective et retour au login | Vérifier la suppression du cookie avec le gestionnaire natif |
| Liens WhatsApp | `wa.me`, ouverture dans un nouvel onglet | `components/site/*`, `lib/site-constants.ts` | Ouvrir WhatsApp ou le navigateur | Intercepter les URL externes, ne pas les charger dans la WebView |
| Téléphone et email | `tel:` et `mailto:` | `ClientsView.tsx`, `clients/[id]/page.tsx`, `ContactForm.tsx` | Ouvrir le composeur ou l'application email | Gérer l'absence d'application et les intentions Android |
| Liens Maps | URL Google Maps externe | `site-constants.ts`, `SiteFooter.tsx` | Ouvrir Google Maps | Ouvrir dans une application externe |
| Upload de documents | `FileReader` convertit le fichier en data URL, puis server action | `ClientsView.tsx`, `clients/actions.ts` | Sélectionner un PDF ou une image depuis Android | File chooser natif, gestion des URI de contenu, limite de taille, reprise en cas d'échec |
| Import Excel/CSV | `<input type="file">` puis FormData | `ClientImportModal.tsx`, `WorkshopView.tsx`, `admin/import-pieces/page.tsx` | Sélectionner un fichier local | Vérifier l'accès aux fichiers Android et les gros fichiers |
| Export Excel | Réponse binaire avec `Content-Disposition: attachment` | `api/reports/financial-excel`, `api/workshop/export`, `api/workshop/template` | Le fichier doit être enregistré ou partagé | Écouter les téléchargements de la WebView ou utiliser le gestionnaire de téléchargement natif |
| Export CSV clients | Blob et ancre `download` | `ClientsView.tsx` | Télécharger le fichier | Adapter le téléchargement de data URL et de Blob dans la WebView |
| Documents clients | Lien `download` vers data URL | `ClientsView.tsx`, `clients/[id]/page.tsx` | Ouvrir ou télécharger la pièce | Gérer les data URL et les droits d'accès |
| Impression | `window.print()` sur les pages de documents | `PrintButton.tsx`, `DeliveryNotesView.tsx`, pages print, `PresentationClient.tsx` | Ouvrir l'aperçu d'impression Android ou partager un PDF | `window.print` n'est pas fiable dans une WebView. Utiliser l'API d'impression Android ou générer un PDF côté serveur |
| PDF | Aucun PDF généré côté serveur pour les documents métier | pages print HTML | L'utilisateur veut imprimer ou partager un PDF | Génération PDF serveur ou impression native |
| Caméra | Aucun `capture`, aucun accès caméra explicite. Le sélecteur de documents clients accepte les images | `ClientsView.tsx` | L'utilisateur peut prendre une photo avec le sélecteur Android | Ajouter un file chooser avec caméra si nécessaire. Ne pas déclarer la caméra supportée sans test |
| Localisation | Aucune géolocalisation. La politique bloque `geolocation=()` | `middleware.ts` | Non utilisée aujourd'hui | Aucune permission à ajouter pour le périmètre actuel. Si ajout futur, adapter la politique et les permissions |
| Microphone | `navigator.mediaDevices.getUserMedia({ audio: true })` | `GlobalCallManager.tsx`, `DevicePermissionsSetup.tsx`, `ConferenceRoomView.tsx` | Demander la permission micro et fonctionner en appel | Permission Android, audio focus, routage haut-parleur, cycle de vie |
| WebRTC | `RTCPeerConnection`, STUN Google, signalisation par `/api/calls` | `GlobalCallManager.tsx`, `api/calls/*` | Appels audio et conférences | Vérifier la compatibilité WebView. Prévoir un serveur TURN pour les réseaux mobiles et NAT restrictifs |
| Notifications | API `Notification`, polling des notifications et des messages | `DevicePermissionsSetup.tsx`, `AdminNotificationsBell.tsx`, `GlobalCallManager.tsx` | Permission Android et notification visible | Une WebView ne suffit pas pour des notifications fiables. Prévoir notifications locales ou push natif |
| Appels entrants en arrière-plan | Polling JavaScript `setInterval` | `GlobalCallManager.tsx` | Recevoir l'appel même si l'écran est verrouillé ou l'app en arrière-plan | Service de premier plan ou push. Le polling seul ne suffit pas |
| Paiement | Terminal de recharge simulé par API | `terminal/page.tsx`, `api/terminal/pay` | Même parcours de paiement simulé | Aucun SDK de paiement natif à intégrer aujourd'hui. Ne pas présenter cela comme un paiement réel |
| Nouvelle fenêtre | `target="_blank"` pour print, fiches, liens externes | nombreuses vues | Le lien doit s'ouvrir sans casser la WebView | Intercepter les ouvertures de fenêtre et router vers un navigateur ou une vue interne |
| Perte de réseau | Aucun service worker, aucune file d'attente hors ligne | global | Afficher un message clair et permettre de réessayer | Détection réseau, bannière hors ligne, retry, éventuel cache de lecture |
| Clavier Android | Modales en `position: fixed` et hauteurs `100vh` | `globals.css`, modales | Le clavier ne doit pas masquer les champs | `visualViewport`, redimensionnement, `windowSoftInputMode` natif |
| Bords d'écran | `env(safe-area-inset-bottom)` présent surtout dans le CSS du site | `(site)/site.css` | Éviter le notch, la barre de statut et la barre gestuelle | `viewport-fit=cover`, marges de sécurité, barre de statut native |
| Cookies et localStorage | Cookie de session et préférences locales | `lib/auth.ts`, `PrefsProvider`, `DevicePermissionsSetup` | Les préférences et la session doivent survivre au redémarrage | Activer le stockage persistant du WebView, tester l'effacement des données |
| Deep links | Aucun App Link Android. Les contrats publics utilisent un token dans l'URL | `contrat/[token]/page.tsx` | Un lien de contrat peut être ouvert depuis WhatsApp ou email | Ajouter des App Links si le partage de contrat doit ouvrir l'application |
| Plein écran | `requestFullscreen()` dans la présentation | `PresentationClient.tsx` | Le plein écran peut être refusé par la WebView | Vérifier l'API Fullscreen et le mode immersif natif |
| Enregistrement d'écran | `getDisplayMedia` et `MediaRecorder` | `PresentationClient.tsx` | Android mobile ne garantit pas la capture de l'écran via `getDisplayMedia` | Fonction à tester. Sinon, capture native ou exclusion explicite |
| QR e-MECeF | Image distante `api.qrserver.com` | `invoices/[id]/print/page.tsx` | Le QR doit s'afficher même en réseau faible | Cache local ou génération locale du QR |

## 6. PWA : état actuel

L'application n'est pas une PWA.

Constats :

- aucun `manifest.ts` ni `public/manifest.webmanifest` ;
- aucun service worker ;
- aucun enregistrement `navigator.serviceWorker` ;
- aucun cache hors ligne ;
- aucun écran de démarrage PWA, aucune icône maskable ;
- aucun `beforeinstallprompt` ;
- aucune métadonnée `theme-color` ou `apple-mobile-web-app` ;
- aucune stratégie de mise à jour hors ligne ;
- les pages internes dépendent d'une session et d'une base distante.

Conséquence : une TWA ne peut pas être construite correctement sans ajouter d'abord un manifeste, un service worker et une stratégie de cache. Une TWA qui pointe simplement vers le site serait une coquille sans installation PWA conforme.

## 7. Ce qui n'a pas été testé

- Aucun APK n'existe.
- Aucun émulateur Android n'a été lancé.
- Aucun appareil Android réel n'a été utilisé.
- Aucune connexion, aucun upload, aucun téléchargement, aucune impression, aucun appel audio et aucune notification n'ont été testés sur Android.
- Aucun test de perte de réseau n'a été effectué.
- Aucun test de caméra ou de localisation n'a été effectué, car ces fonctions ne sont pas utilisées par le code actuel.
- Aucun test Google OAuth n'est applicable : le web n'a pas d'OAuth.
- Les tests web n'ont pas été lancés à cette étape, car aucun code n'a été modifié. Ils seront relancés à l'étape 5 et après toute modification web nécessaire au mobile.
- Les comportements décrits dans ce document sont des exigences de parité, pas des preuves de fonctionnement.

## 8. Synthèse pour l'étape 2

L'application est une application Next.js serveur, sans PWA et sans API découplée. Le mobile ne peut donc pas être obtenu par un simple export statique.

Les points structurants pour le choix d'approche seront :

1. accès à toutes les pages et server actions sans réécriture native ;
2. persistance du cookie HttpOnly et des redirections ;
3. gestion des téléchargements XLSX et documents ;
4. impression des contrats, factures, BL et fiches atelier ;
5. microphone et WebRTC pour les appels ;
6. notifications et appels entrants en arrière-plan ;
7. caméra et fichiers, si les parcours KYC et atelier doivent fonctionner sans navigateur ;
8. bouton retour Android, clavier et bords d'écran ;
9. mode hors ligne ou dégradé ;
10. signature Play Store, nom de package et politique de mise à jour.

L'étape 2 comparera Capacitor, TWA et une réécriture native. Aucun projet Android ne sera créé avant validation de cette comparaison.
