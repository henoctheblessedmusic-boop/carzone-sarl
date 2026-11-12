# Plan d'import de la base clients et location

Date : 2026-11-12
Source analysee : `Base_Clients.xlsx`
Statut : analyse et plan uniquement. Aucun code ni migration n'a ete lance.

---

## 1. Structure reelle du fichier

Le classeur contient une seule feuille, `Feuil1`, avec 59 lignes dont 1 ligne d'en-tetes et 58 lignes de donnees.

Colonnes presentes :

| # | Colonne Excel | Nature |
|---:|---|---|
| 1 | N° D'Ordre | reference de ligne |
| 2 | NOMS | nom du client |
| 3 | ADRESSE | adresse du client |
| 4 | N° CIP/CNI | piece d'identite |
| 5 | CONTACT_CLIENT | telephone principal |
| 6 | PERSONNE A CONTACTER | contact d'urgence |
| 7 | TYPE D'OPERATION | toutes les lignes sont `LOCATION` |
| 8 | AVEC OU SANS CHAUFFEUR | `OUI`, `NON` ou vide |
| 9 | NRE DE JOURS | duree du contrat |
| 10 | EFFET | debut du contrat |
| 11 | ECHEANCE | fin du contrat |
| 12 | (colonne vide) | aucun usage |
| 13 | MARQUE de VOITURE Loue | vehicule |
| 14 | COULEUR | couleur |
| 15 | ANNEE | annee |
| 16 | ENERGIE | energie |
| 17 | PLACE | nombre de places |
| 18 | MONTANT | montant du contrat ou `Pas encore encaisse` |
| 19 | MOYEN DE PAIEMENT | `ESPECES` partout |
| 20 | DATE D'OPERATION | date de saisie |

## 2. Volumetrie et qualite

| Mesure | Resultat |
|---|---:|
| Lignes de contrats | 58 |
| Clients distincts | 36 |
| Lignes clients dupliquees | 22 |
| Configurations de vehicules distinctes | 11 |
| Contrats sans chauffeur | 39 |
| Contrats avec chauffeur | 8 |
| Chauffeur non renseigne | 11 |
| Montants numeriques | 53 |
| Contrats `Pas encore encaisse` | 5 |
| Contrats sans date d'effet | 2 |
| Contrats a 0 jour | 1 |
| Periode couverte | 08/07/2026 au 07/11/2026 |
| Montant total saisi | 19 295 000 FCFA |
| Montant moyen | 364 057 FCFA |

Tous les paiements declares sont en especes.

### Vehicules distincts detectes

| Vehicule | Contrats |
|---|---:|
| CHANGAN X5, blanc, 2026, essence, 5 places | 14 |
| CHANGAN CS55, gris, 2026, essence, 5 places | 11 |
| JETOUR, creme, 2026, essence, 5 places | 10 |
| RAV4, blanc, 2025, hybride, 5 places | 8 |
| GRUE, noire, 2026, essence, 3 places | 4 |
| CHANGAN CS55, creme, 2026, essence, 5 places | 4 |
| GEELY, grise, 2026, essence, 5 places | 2 |
| BYD, noire, 2026, essence, 5 places | 2 |
| CHANGAN CS75, grise, 2026, essence, 5 places | 1 |
| SUZUKI, orange, 2024, essence, 5 places | 1 |
| RAV4, blanc, 2025, essence, 5 places | 1 |

Le fichier ne contient ni immatriculation ni VIN. Les vehicules ne peuvent donc pas etre rapproches automatiquement du stock existant par plaque ou chassis.

## 3. Ce qu'il faut importer separement

Une ligne Excel ne doit pas etre importee comme un simple client. Elle contient trois entites :

1. un **client** ;
2. un **vehicule locatif** ;
3. un **contrat de location**.

L'import doit donc etre un assistant en trois passages, dans une seule transaction :

```text
Fichier Excel
   -> lecture et normalisation
   -> apercu des clients, vehicules et contrats
   -> validation et corrections
   -> import transactionnel
   -> rapport avec lignes creees, doublons, anomalies
```

## 4. Champs de base de donnees a ajouter

### 4.1 Client

| Champ propose | Source | Remarque |
|---|---|---|
| `identityDocumentType` | deduction CIP ou CNI | `CIP` ou `CNI` |
| `identityNumber` | N° CIP/CNI | ne pas mettre dans `ifu` |
| `secondaryContact` | PERSONNE A CONTACTER | contact d'urgence |
| `scopeRental` | deja present | true pour ces clients |
| `source` | `BASE_CLIENTS_LOCATION` | tracabilite de l'import |

Le champ `ifu` reste reserve a l'identifiant fiscal, pas a la piece d'identite.

### 4.2 Vehicule locatif

| Champ propose | Source | Remarque |
|---|---|---|
| `seats` | PLACE | ajout direct sur Vehicle |
| `fleetCode` | genere | identifiant interne stable, faute de VIN |
| `rentalDailyWithoutDriverXof` | tarif calcule ou saisi | tarif par defaut |
| `rentalDailyWithDriverXof` | tarif calcule ou saisi | tarif par defaut |
| `fleetType` | `RENTAL` | parc de location |
| `rentalStatus` | `DISPONIBLE` ou `LOUE` | selon les contrats |
| `source` | `BASE_CLIENTS_LOCATION` | tracabilite |

Les champs `vin`, `registrationNumber`, marque et modele restent renseignables plus tard.

### 4.3 Contrat de location

| Champ propose | Source | Remarque |
|---|---|---|
| `withDriver` | AVEC OU SANS CHAUFFEUR | `true`, `false` ou `null` si vide |
| `sourceReference` | N° D'ORDRE | unicite par fichier |
| `sourceFileHash` | empreinte du fichier | idempotence |
| `operationDate` | DATE D'OPERATION | date de saisie historique |
| `paymentMethod` | MOYEN DE PAIEMENT | `ESPECES` |
| `paymentStatus` | MONTANT | `PAYE` ou `NON_PAYE` |
| `notes` | anomalies | a completer dans le dossier |

Les contrats deja payes doivent creer un `RentalPayment` pour conserver l'encaissement historique. Les contrats `Pas encore encaisse` doivent rester sans paiement et etre signales comme creance.

## 5. Regles de rapprochement

### Clients

Cle de deduplication proposee :

```text
nom normalise + telephone normalise + piece d'identite
```

Regles :

- 58 lignes donnent 36 clients distincts ;
- si le nom et le telephone correspondent deja a un client, reutiliser la fiche ;
- si la piece d'identite existe deja, reutiliser la fiche ;
- si deux fiches existantes sont compatibles, demander la fusion a l'utilisateur ;
- ne jamais supprimer ni ecraser un client existant ;
- les 22 lignes dupliquees doivent generer 22 contrats, pas 22 clients.

### Vehicules

Cle proposee :

```text
marque + modele + couleur + annee + energie + places
```

Regles :

- 11 configurations distinctes dans le fichier ;
- creer un vehicule par configuration ;
- generer un `fleetCode` stable ;
- ne pas considerer 14 contrats CHANGAN X5 comme 14 vehicules : ce sont 14 locations du meme vehicule, sauf indication contraire ;
- si plusieurs exemplaires identiques existent reellement, il faudra une colonne immatriculation ou un identifiant interne dans le fichier.

### Contrats

Cle proposee :

```text
sourceFileHash + N° D'ORDRE
```

Regles :

- une ligne = un contrat ;
- un deuxieme import du meme fichier ne cree aucun doublon ;
- si une ligne a deja ete importee, la signaler comme ignoree ;
- ne jamais modifier silencieusement un contrat existant.

## 6. Tarification avec ou sans chauffeur

Le fichier ne contient pas de tarif journalier explicite. Le tarif peut etre deduit du montant et du nombre de jours, mais les valeurs varient pour un meme vehicule.

Exemples de tarifs journaliers deduits :

| Vehicule | Sans chauffeur | Avec chauffeur |
|---|---:|---:|
| CHANGAN X5 | environ 38 750 FCFA | environ 47 500 FCFA |
| CHANGAN CS55 gris | environ 53 750 FCFA | environ 62 500 FCFA |
| JETOUR | environ 54 375 FCFA | environ 70 000 FCFA |
| RAV4 hybride | environ 52 000 FCFA | non renseigne |
| BYD | environ 60 000 FCFA | non renseigne |
| GRUE | environ 350 000 FCFA | non renseigne |

Ces valeurs sont des moyennes observees, pas des tarifs officiels. Il faut valider une grille tarifaire avant de les utiliser comme valeurs par defaut.

Regle proposee :

- conserver le montant reel du contrat historique dans `Rental.totalXof` ;
- calculer le tarif journalier du contrat a partir du montant et des jours ;
- utiliser les tarifs avec/sans chauffeur du vehicule pour les nouveaux contrats ;
- ne jamais recalculer un contrat historique apres import ;
- permettre au gestionnaire de modifier les deux tarifs du vehicule.

## 7. Cas particuliers a traiter avant import

| Cas | Nombre | Decision proposee |
|---|---:|---|
| Chauffeur vide | 11 | importer en `non renseigne`, ne pas inventer OUI ou NON |
| Pas encore encaisse | 5 | importer le contrat sans paiement, statut creance |
| Date d'effet vide | 2 | importer en brouillon/incomplet, ne pas activer le vehicule |
| Duree 0 | 1 | importer en brouillon et signaler |
| GRUE | 4 contrats | verifier s'il s'agit d'un vehicule locatif ou d'un engin a traiter a part |
| RAV4 sans marque | 1 | rattacher a Toyota RAV4 ou demander confirmation |
| CIP/CNI vides | plusieurs | importer sans identifiant et signaler la fiche incomplete |
| Formats de dates | 58 | confirmer le format M/J/AA, coherent avec les durees du fichier |
| Montants atypiques | plusieurs | conserver le montant historique, ne pas lisser automatiquement |

## 8. Ecrans et parcours utilisateur

### Ecran d'import

Ajouter un ecran dedie dans l'espace Location :

```text
/rentals/import
```

Etapes :

1. depot du fichier Excel ;
2. detection des colonnes et de la feuille ;
3. apercu separe en trois tableaux ;
4. rapport d'anomalies ;
5. choix des regles de rapprochement ;
6. confirmation ;
7. resultat detaille.

### Apercu clients

Colonnes : nom, telephone, adresse, CIP/CNI, contact d'urgence, nombre de contrats detectes, doublon eventuel.

### Apercu vehicules

Colonnes : configuration, couleur, annee, energie, places, nombre de contrats, tarif avec chauffeur, tarif sans chauffeur, code interne propose.

### Apercu contrats

Colonnes : client, vehicule, dates, duree, chauffeur, montant, paiement, anomalies, statut propose.

## 9. Import transactionnel

Ordre d'ecriture :

1. creation ou rapprochement des clients ;
2. creation ou rapprochement des vehicules ;
3. creation des contrats ;
4. creation des paiements historiques pour les contrats payes ;
5. mise a jour du statut des vehicules ;
6. ecriture du rapport d'import et du journal d'audit.

Une erreur critique annule tout le lot. Les lignes invalides peuvent etre ignorees avec un rapport, mais aucune donnee partielle ne doit etre invisible.

## 10. Tests prevus

### Tests unitaires

- lecture des en-tetes ;
- normalisation des noms et telephones ;
- detection CIP/CNI vide ou mal formee ;
- deux formats de dates ;
- montant numerique et `Pas encore encaisse` ;
- chauffeur OUI/NON/vide ;
- deduplication clients ;
- deduplication vehicules ;
- cle d'idempotence des contrats.

### Tests d'integration

- import sur base de test ;
- 58 contrats, 36 clients, 11 vehicules ;
- 22 lignes clients dupliquees ne creent pas 22 clients ;
- 5 contrats non payes sans paiement ;
- 2 contrats sans date en brouillon ;
- second import du meme fichier : 0 doublon ;
- verification des montants et des dates.

### Test reel

- fichier fourni ;
- compte `GESTIONNAIRE_LOCATION` ;
- base de test ;
- rapport final controle ligne par ligne ;
- aucune donnee de production modifiee avant validation.

## 11. Ordre d'implementation propose

| Phase | Livrable |
|---|---|
| 1 | Champs Prisma et migration additive |
| 2 | Parseur pur et tests unitaires |
| 3 | Service de rapprochement et dry-run |
| 4 | Ecran d'import et apercu |
| 5 | Import transactionnel et rapport |
| 6 | Test sur base de test avec le fichier reel |
| 7 | Validation metier puis execution en production avec sauvegarde |

## 12. Decisions a confirmer avant implementation

1. Le format des dates est-il bien `M/J/AAAA` ?
2. Les 11 configurations sont-elles bien 11 vehicules distincts, et non plusieurs exemplaires du meme modele ?
3. La `GRUE` doit-elle etre importee dans le parc locatif ou traitee comme un engin separe ?
4. Pour les 11 lignes sans chauffeur renseigne, faut-il laisser le champ vide ou appliquer un defaut ?
5. Les 5 contrats `Pas encore encaisse` doivent-ils etre importes en creance, ou seulement en brouillon ?
6. Les 2 contrats sans date et le contrat a 0 jour doivent-ils etre importes en brouillon ou refuses ?
7. Les tarifs avec/sans chauffeur doivent-ils etre calcules a partir des moyennes du fichier ou saisis manuellement ?
8. Les paiements historiques en especes doivent-ils creer un `RentalPayment` pour chaque contrat marque paye ?
9. Le CIP/CNI doit-il etre unique par client ou une meme personne peut-elle avoir plusieurs pieces ?
10. Le fichier doit-il etre importe une seule fois, ou doit-il pouvoir etre reimporte pour mise a jour ?

Aucune implementation ne sera lancee avant validation de ces points.

---

## 13. Decisions validees le 2026-11-12

| Sujet | Decision |
|---|---|
| Format des dates | `M/J/AAAA` confirme |
| Nombre de vehicules reels | 5 vehicules et 1 grue, pas 11 vehicules |
| Grue | integree au meme parc locatif |
| Chauffeur non renseigne | champ laisse vide |
| Contrats non encaisses | importes comme creances |
| Contrats sans date ou a 0 jour | importes en brouillon |
| Tarifs avec et sans chauffeur | saisis manuellement par la gestionnaire |
| Paiements historiques | la gestionnaire decide de creer ou non les encaissements |
| CIP/CNI | unique par client |
| Reimport du fichier | pas necessaire |

## 14. Point bloquant a clarifier avant implementation

Le fichier detecte 11 configurations distinctes, mais le parc reel ne compte que 5 vehicules et 1 grue.

Il faut identifier parmi les configurations suivantes les 6 actifs reels et dire si les variantes de couleur ou d'energie correspondent au meme vehicule :

| Configuration detectee | Contrats |
|---|---:|
| CHANGAN X5, blanc, 2026, essence, 5 places | 14 |
| CHANGAN CS55, gris, 2026, essence, 5 places | 11 |
| JETOUR, creme, 2026, essence, 5 places | 10 |
| RAV4, blanc, 2025, hybride, 5 places | 8 |
| GRUE, noire, 2026, essence, 3 places | 4 |
| CHANGAN CS55, creme, 2026, essence, 5 places | 4 |
| GEELY, grise, 2026, essence, 5 places | 2 |
| BYD, noire, 2026, essence, 5 places | 2 |
| CHANGAN CS75, grise, 2026, essence, 5 places | 1 |
| SUZUKI, orange, 2024, essence, 5 places | 1 |
| RAV4, blanc, 2025, essence, 5 places | 1 |

Sans cette correspondance, les contrats historiques risquent d'etre rattaches a de mauvais vehicules ou de creer de faux doublons de flotte.

