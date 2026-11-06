# Catalogue general de pieces OEM - CARZONE SARL

Livrable de preparation pour le catalogue general de pieces (modeles Prisma `GeneralPart`,
`GeneralPartReference`, `GeneralPartCompatibility`, `GeneralPartOrder`,
`GeneralPartOrderLine`), independant du stock existant (`PartItem`). Ce dossier ne modifie
ni le schema Prisma ni le code de production ; il contient uniquement des livrables de
donnees/documentation.

Marques prioritaires : Changan, Jetour, BYD, Geely, BAIC, Forthing, Toyota, Suzuki,
Mercedes-Benz, BMW.

## 1. Faisabilite : un catalogue "toutes les pieces, toutes les references OEM"

**Reponse honnete : pas en une seule operation, et pas sans acces a des sources
payantes/professionnelles.**

- Un catalogue exhaustif pour 10 marques represente potentiellement plusieurs centaines
  de milliers de references (piece x variante x annee x marche). Aucune source unique,
  gratuite et legale ne couvre cela.
- Les sources les plus fiables (EPC constructeur, TecDoc, Autodata) sont payantes et
  contractuellement reservees a un usage professionnel ; voir `sources-report.md` pour le
  detail par source.
- La couverture documentaire des marques chinoises prioritaires (Changan, Jetour, BYD,
  Geely, BAIC, Forthing) est nettement moins standardisee a l'international que celle de
  Toyota, Suzuki, Mercedes-Benz et BMW. Les variantes "export" (Afrique/Moyen-Orient)
  peuvent avoir des references differentes de la version marche chinois pour une piece
  visuellement identique.
- Approche realiste recommandee : construction **progressive et pilotee par la demande**,
  en commencant par les pieces d'entretien courant (filtres, plaquettes/disques,
  bougies, amortisseurs) sur les modeles reellement vendus/entretenus par CARZONE, puis
  extension au fil des commandes fournisseurs et des interventions atelier.

## 2. Limite majeure de cette session : aucun acces internet disponible

Avant de produire quoi que ce soit, les outils de recherche web (`WebSearch`) et de
recuperation de page (`WebFetch`, via l'agent `web-fetch`) ont ete testes. Les deux ont
systematiquement echoue avec l'erreur :

```
This unattended Claude Code subagent cannot request human approval.
```

Consequence directe et assumee : **aucune reference OEM n'a pu etre recherchee ni
verifiee en direct pendant cette session.** Conformement a la consigne du projet
("Ne genere jamais une reference OEM sans source verifiable"), aucun numero de piece n'a
ete invente pour compenser cette limite. Le dataset "verifie" livre ici est donc
volontairement vide (voir section 4), et toutes les pieces candidates sont placees dans
la liste "a importer" sans numero.

Note sur les donnees existantes du projet : le seed de demonstration
`apps/web/prisma/seed-parts-and-catalog.ts` contient des numeros au format OEM (ex.
`3501110-M01`, `DK7RTI`) utilises pour peupler le **stock de demonstration** (`PartItem`).
Ces numeros n'ont pas de source documentee dans le code et ne doivent pas etre consideres
comme verifies pour le catalogue general. Ils ne sont pas repris ici tant qu'une source
reelle n'a pas ete identifiee pour chacun.

## 3. Contenu de ce dossier

```
apps/web/data/oem-catalog/
  README.md                                    (ce fichier)
  sources-report.md                            (evaluation detaillee des sources, couverture/cout/conditions)
  schema/
    general-part-import.schema.json            (JSON Schema de validation d'un lot d'import)
  templates/
    template-general-part.csv                  (modele CSV -> table GeneralPart)
    template-general-part-reference.csv        (modele CSV -> table GeneralPartReference)
    template-general-part-compatibility.csv    (modele CSV -> table GeneralPartCompatibility)
  dataset/
    verified-oem-references.json               (dataset verifie - vide cette session, structure prete)
    a-importer.csv                              (pieces prioritaires sans numero OEM invente, a verifier)
```

## 4. Schema d'import normalise

Le fichier `schema/general-part-import.schema.json` (JSON Schema draft 2020-12) definit la
structure d'un lot d'import correspondant exactement aux 3 tables Prisma du catalogue
general. Regles de validation cles :

- Chaque `GeneralPart` a une reference interne unique prefixee `GEN-` (distincte du
  prefixe `CZ-` deja utilise par `PartItem`, pour ne jamais confondre catalogue et stock).
- Chaque `GeneralPartReference` est **obligatoirement** accompagnee de `sourceType`
  (liste fermee : EPC constructeur, TecDoc, Autodata, catalogue fournisseur PDF/papier,
  site officiel, documentation technique vehicule, facture d'achat anterieure, ou autre
  source verifiable explicite), de `sourceRef` (identifiant precis et consultable : URL,
  page de PDF, numero de facture + date) et de `verifiedAt` (date de verification).
- Le schema **rejette explicitement** les valeurs de `sourceRef` du type "invente",
  "estimation", "IA", "inconnu", "n/a", "todo" - ce qui bloque techniquement
  l'introduction d'une reference sans provenance reelle lors d'une validation automatisee
  du fichier avant import.
- Les 3 modeles CSV dans `templates/` sont la version tabulaire du meme schema (une ligne
  d'exemple explicitement marquee "EXEMPLE-NE-PAS-IMPORTER" dans chacun, a supprimer avant
  tout import reel).

Le champ Prisma `notes` (sur `GeneralPartReference`) est le point d'ancrage recommande
pour conserver la tracabilite de la source au moment de l'import effectif en base, par
exemple : `"Source: catalogue fournisseur Changan 2026, page 42, verifie le 2026-11-06"`.

## 5. Dataset de demarrage verifie

`dataset/verified-oem-references.json` est conforme au schema d'import mais contient un
tableau `parts` vide. Raison : zero reference OEM a pu etre verifiee contre une source
reelle pendant cette session (voir section 2). Ce fichier est pret a recevoir des entrees
dès qu'une source fiable sera disponible (catalogue fournisseur numerise, acces EPC, ou
acces web retabli dans une prochaine session) : il suffira de remplir `parts[]` en
respectant le schema, sourceType/sourceRef/verifiedAt obligatoires sur chaque reference.

## 6. Liste "a importer"

`dataset/a-importer.csv` liste 15 lignes de pieces candidates prioritaires (filtres a
huile/air/habitacle, plaquettes et disques de frein avant, bougies d'allumage,
amortisseur avant) pour les marques prioritaires, **sans aucun numero OEM** dans la
colonne `oemReference` (laissee vide par construction). Chaque ligne indique la source a
consulter en priorite (`suggestedSourceType`) : catalogue fournisseur pour les marques
chinoises, EPC constructeur pour Toyota/Suzuki/Mercedes-Benz/BMW. C'est la liste de
travail pour la prochaine etape d'import.

## 7. Prochaine etape d'import (concrete)

1. Reunir les catalogues/factures fournisseurs deja en possession de CARZONE (Dubai,
   Chine) pour les modeles effectivement vendus/entretenus.
2. Pour chaque ligne de `dataset/a-importer.csv`, renseigner la reference OEM reelle +
   `sourceType` + `sourceRef` + `verifiedAt`, en respectant
   `schema/general-part-import.schema.json`.
3. Valider le fichier d'import resultant contre le schema JSON (ou les 3 CSV contre leurs
   modeles) avant toute ecriture en base - cette etape n'a pas ete scriptee ici
   volontairement, pour eviter d'ajouter une dependance ou de toucher au code de
   production sans validation prealable du Lead.
4. Une fois valide, importer dans `GeneralPart` / `GeneralPartReference` /
   `GeneralPartCompatibility` via un script d'import a ecrire separement (hors perimetre
   de cette tache).
5. Repeter progressivement par famille de pieces, en priorisant les pieces a forte
   rotation identifiees par l'atelier et le stock existant.

## 8. Rapport final (synthese)

- **References OEM verifiees livrees cette session : 0.** Cause : aucun acces internet
  disponible (WebSearch et WebFetch bloques - voir section 2). Aucune reference n'a ete
  inventee pour compenser cette limite.
- **Categories couvertes par la liste "a importer" :** FILTRATION (huile, air,
  habitacle), FREINAGE (plaquettes avant, disques avant), MOTEUR (bougies), SUSPENSION
  (amortisseur avant) - 15 lignes, 10 marques prioritaires.
- **Sources identifiees et evaluees :** EPC constructeurs (Toyota TIS, Suzuki EPC,
  Mercedes-Benz WIS/EPC, BMW ETK, EPC marques chinoises via distributeur regional),
  TecDoc, Autodata, catalogues/factures fournisseurs CARZONE, catalogues publics
  (consultation manuelle ponctuelle uniquement, pas de moissonnage). Detail complet :
  `sources-report.md`.
- **Limites principales :** acces internet indisponible cette session ; licences EPC/
  TecDoc payantes et reservees aux professionnels agrees ; couverture internationale
  faible et non standardisee pour les marques chinoises prioritaires ; volume total hors
  de portee d'une seule operation ; necessite de verification VIN/variante avant tout
  achat en volume.
- **Prochaine etape :** executer la section 7 ci-dessus, en commencant par les catalogues
  fournisseurs deja disponibles en interne (cout nul, fiabilite maximale).
