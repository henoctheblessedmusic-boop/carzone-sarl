# Rapport de sources - Catalogue general de pieces OEM (CARZONE SARL)

Date : 2026-11-06
Perimetre : Changan, Jetour, BYD, Geely, BAIC, Forthing, Toyota, Suzuki, Mercedes-Benz, BMW

## Avertissement sur cette session

Les outils d'acces web (recherche et recuperation de pages) ont ete testes au debut de
cette tache et ont echoue systematiquement avec l'erreur : "This unattended Claude Code
subagent cannot request human approval." Concretement : aucune recherche web ni aucune
recuperation de page n'a pu etre effectuee pendant cette session. Ce rapport decrit donc
les sources de maniere factuelle generale (nature, couverture typique, modele de licence
connus de l'ecosysteme EPC/aftermarket), sans avoir pu verifier en direct une URL, un prix
ou une condition contractuelle actuelle. Toute information de prix ou de disponibilite
ci-dessous doit etre reconfirmee auprès de la source avant engagement commercial.

## 1. EPC constructeurs (Electronic Parts Catalog officiels)

| Constructeur | Nom du systeme (typique) | Couverture | Acces / cout | Conditions |
|---|---|---|---|---|
| Toyota | TIS / EPC Toyota | Tres large, historique profond, tres fiable par VIN | Abonnement payant, generalement reserve au reseau de concessionnaires/reparateurs agrees | Licence d'usage professionnel, redistribution des donnees brutes du catalogue generalement interdite |
| Suzuki | EPC Suzuki | Large sur les modeles vendus officiellement par marche | Abonnement payant via distributeur national Suzuki | Idem : usage interne reparateur/concessionnaire, pas de revente de la base |
| Mercedes-Benz | WIS/ASRA + EPC (via Xentry ou portail pieces) | Tres large et tres precis (VIN complet) | Abonnement payant, souvent couple a l'outil de diagnostic Xentry | Reserve reseau agree, licence stricte |
| BMW | ETK (Electronic Parts Catalog) | Tres large et tres precis (VIN complet) | Abonnement payant via ISTA/AIR ou portail pieces BMW | Reserve reseau agree, licence stricte |
| Changan / Jetour / BYD / Geely / BAIC / Forthing | EPC marque, generalement via le portail du distributeur regional ou de l'usine | Variable, souvent partielle hors Chine continentale ; les variantes "export" (Afrique, Moyen-Orient) peuvent avoir des numeros de piece differents de la version marche chinois | Generalement fourni au distributeur/importateur officiel du marche, rarement vendu au detail a un reparateur independant | Depend entierement du contrat de distribution de la marque sur le marche beninois/africain ; a demander directement aux fournisseurs CARZONE (Dubai, Chine) |

Point d'attention specifique aux marques chinoises prioritaires : la documentation EPC
pour Changan, Jetour, BYD, Geely, BAIC et Forthing est largement produite et mise a jour
en chinois, avec une diffusion internationale beaucoup moins standardisee que chez
Toyota/Suzuki/Mercedes-Benz/BMW. Le chemin le plus realiste pour CARZONE est d'obtenir
les catalogues pieces (PDF/Excel) directement auprès de l'usine ou du distributeur
regional avec lequel CARZONE importe deja ses vehicules, plutot que de chercher un acces
EPC public.

## 2. Bases de cross-reference commerciales

| Source | Nature | Couverture | Cout / licence |
|---|---|---|---|
| TecDoc (TecAlliance) | Base de cross-reference aftermarket multi-marques, standard de facto en Europe/Afrique francophone | Tres large sur marques generalistes (Toyota, Suzuki, Mercedes-Benz, BMW) ; couverture des marques chinoises recentes partielle et evolutive | Abonnement B2B payant (catalogueur, grossiste, reseau), contrat avec TecAlliance ou un revendeur agree ; pas d'acces gratuit en direct |
| Autodata | Donnees techniques de reparation (temps, couples, intervalles) plus que repertoire de references OEM | Bonne sur marques generalistes, limitee sur marques chinoises | Abonnement payant |

## 3. Catalogues et documentation fournisseurs (chemin le plus realiste a court terme)

CARZONE importe deja des vehicules via des fournisseurs identifies (ex. fournisseur Dubai
deja present dans les donnees internes du projet). Ces relations commerciales incluent
generalement :

- Catalogues pieces PDF/Excel fournis par l'usine ou le distributeur regional au moment
  de la commande de vehicules ou de pieces de rechange.
- Factures d'achat anterieures mentionnant la reference OEM et la designation exacte de
  la piece livree.
- Fiches techniques jointes aux vehicules neufs (carnet d'entretien, etiquette moteur).

Ce sont les sources les plus fiables et les moins couteuses a court terme : elles sont
deja dans le circuit commercial de CARZONE, ne necessitent pas de nouvel abonnement, et
sont directement verifiables (document date, numero de facture).

## 4. Catalogues publics / sites de pieces en ligne

Certains sites marchands de pieces detachees affichent des numeros OEM pour aider la
recherche de leurs clients. Ils peuvent servir de verification croisee ponctuelle et
manuelle (recherche au cas par cas d'une reference precise), mais :

- Il ne faut pas moissonner (scraper) ces sites en masse : cela viole generalement leurs
  conditions d'utilisation et peut etre illegal selon les cas. Cette pratique n'est pas
  recommandee par ce rapport.
- Une consultation manuelle, ponctuelle, pour verifier une reference specifique avant un
  achat reste une utilisation normale d'un site public, a condition de respecter ses
  conditions d'utilisation (pas d'automatisation, pas de republication en masse de leur
  contenu).

## 5. APIs commerciales

Des fournisseurs de donnees pieces (dont TecAlliance/TecDoc) proposent des APIs B2B
payantes pour integrer la recherche de references dans un logiciel metier. Cela
correspondrait a terme a une integration technique dans l'application CARZONE, mais
suppose un contrat commercial prealable ; ce rapport ne recommande pas de mise en oeuvre
technique avant qu'un tel contrat soit signe.

## 6. Limites generales identifiees

1. **Licence** : la quasi-totalite des sources fiables (EPC constructeur, TecDoc,
   Autodata) sont payantes et contractuellement reservees a un usage professionnel
   defini (reparateur agree, grossiste). Aucune ne permet une redistribution libre de
   leur base de donnees.
2. **Couverture marques chinoises** : Changan, Jetour, BYD, Geely, BAIC, Forthing ont une
   couverture documentaire internationale nettement plus faible et moins standardisee
   que Toyota/Suzuki/Mercedes-Benz/BMW. Les variantes export (Afrique/Moyen-Orient)
   peuvent differer des references marche chinois pour une piece visuellement identique.
   -> Verification VIN/variante obligatoire avant tout achat en volume.
3. **Volume** : un catalogue "toutes pieces, toutes references" pour 10 marques
   represente potentiellement plusieurs centaines de milliers de lignes de reference. Ce
   n'est pas atteignable en une seule operation ; une approche progressive, pilotee par
   la demande reelle de l'atelier et du stock, est recommandee (voir README.md).
4. **Fraicheur** : les references OEM changent avec les evolutions de gamme (mid-cycle
   refresh, changement de fournisseur equipementier). Une base figee se degrade dans le
   temps sans processus de mise a jour.
5. **Session actuelle** : aucun acces internet disponible (voir avertissement en tete de
   document) -> aucune nouvelle reference n'a pu etre verifiee aujourd'hui.

## 7. Recommandation de sourcing, par priorite

1. Recuperer et numeriser les catalogues/factures fournisseurs deja en possession de
   CARZONE (Dubai, Chine) - cout nul, fiabilite maximale, disponible immediatement.
2. Demander aux distributeurs regionaux Changan/Jetour/BYD/Geely/BAIC/Forthing un export
   de leur catalogue pieces (PDF/Excel) pour les modeles effectivement vendus par
   CARZONE.
3. Evaluer un abonnement TecDoc (ou un revendeur TecDoc local/regional) pour la
   cross-reference aftermarket sur les marques generalistes (Toyota, Suzuki,
   Mercedes-Benz, BMW), ou la couverture est la plus solide.
4. Pour les marques chinoises, privilegier le lien direct usine/distributeur plutot
   qu'un abonnement EPC generaliste, dont la couverture restera partielle.
5. Mettre en place un processus manuel de verification croisee (notes + sourceRef) a
   chaque nouvelle piece ajoutee au catalogue general, tel que defini dans le schema
   d'import (`schema/general-part-import.schema.json`).
