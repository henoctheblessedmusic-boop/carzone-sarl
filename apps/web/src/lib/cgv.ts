/**
 * Conditions Générales de Vente & Prestations CARZONE SARL Bénin
 * - Vente de Véhicules (Neufs, Électriques, Hybrides)
 * - Prestations Atelier SAV & Réparations
 */

export type CgvType = "VEHICULE" | "ATELIER";

export const CGV_LABELS: Record<CgvType, string> = {
  VEHICULE: "Vente de Véhicules (Showroom & Import)",
  ATELIER: "Prestations Atelier SAV & Entretien",
};

export const DEFAULT_CGV_VEHICULE = `CONDITIONS GÉNÉRALES DE VENTE DE VÉHICULES — CARZONE SARL (COTONOU, BÉNIN)

ARTICLE 1 — OBJET ET FORMATION DU CONTRAT
La présente proforma ou bon de commande formalise la réservation ou l'acquisition d'un véhicule neuf ou d'occasion garanti commercialisé par CARZONE SARL (Concessionnaire Automobile & Mobilité), concessionnaire à Cotonou (Bénin). La signature du document ou le versement de l'acompte initial emporte acceptation sans réserve des présentes conditions.

ARTICLE 2 — PRIX ET MODALITÉS DE PAIEMENT
1. Les prix sont stipulés en Francs CFA (XOF) Hors Taxes (HT) ou Toutes Taxes Comprises (TTC) selon le régime fiscal applicable.
2. Sauf dérogation écrite, un acompte minimum de 30% du montant total TTC est exigé à la commande pour la réservation ou le lancement de la commande d'importation.
3. Le solde (70%) est payable au plus tard avant la mise à disposition ou remise des clés du véhicule.
4. Tout retard de paiement engendre de plein droit l'application de pénalités de retard au taux légal en vigueur en République du Bénin.

ARTICLE 3 — DÉLAIS DE LIVRAISON ET DÉDOUANEMENT
1. Pour les véhicules en stock showroom : mise à disposition sous 24h à 72h ouvrées après encaissement complet du solde et constitution du dossier d'immatriculation.
2. Pour les véhicules en commande import : le délai indicatif d'acheminement maritime et de dédouanement au Port Autonome de Cotonou est précisé sur le bon de commande. Les cas de force majeure, retards maritimes ou formalités douanières indépendantes d'CARZONE SARL prorogent d'autant ce délai sans pénalité.

ARTICLE 4 — GARANTIES CONSTRUCTEUR & BATTERIE HAUTE TENSION
1. Véhicules électriques / hybrides : la batterie haute tension bénéficie d'une garantie constructeur de 8 ans ou 150 000 km (au premier terme atteint), sous réserve du respect des préconisations de recharge et d'entretien chez CARZONE SARL.
2. Véhicule complet : garantie contractuelle de 5 ans ou 100 000 km couvrant les vices de fabrication et composants mécaniques / électroniques principaux.
3. La garantie est exclue en cas d'accident, de mauvaise utilisation, de modification non agréée ou d'intervention par un tiers non certifié.

ARTICLE 5 — FORMALITÉS D'IMMATRICULATION ET DOSSIER CLIENT
L'acquéreur s'engage à fournir l'ensemble des pièces requises pour l'immatriculation officielle au Bénin (CIP/CNI ou Passeport valide, numéro IFU, justificatif de résidence, procuration légalisée le cas échéant). CARZONE SARL assure l'instruction du dossier auprès des services d'immatriculation de l'ANaTT.

ARTICLE 6 — ENGAGEMENT FERME ET RÉSERVE DE PROPRIÉTÉ
1. Toute commande confirmée engage fermement les parties. Aucune annulation unilatérale de l'acheteur n'est acceptée une fois les engagements logistiques ou bancaires engagés.
2. CARZONE SARL conserve l'entière propriété du véhicule jusqu'au paiement intégral et effectif du prix en principal et accessoires (clause de réserve de propriété).

ARTICLE 7 — JURIDICTION COMPÉTENTE
Les présentes conditions sont régies par le droit béninois. Tout litige relatif à leur interprétation ou exécution sera soumis, à défaut d'accord amiable, au Tribunal de Commerce de Cotonou.`;

export const DEFAULT_CGV_ATELIER = `CONDITIONS GÉNÉRALES DE RÉPARATION & PRESTATIONS SAV — CARZONE ATELIER SAV COTONOU

ARTICLE 1 — ORDRE DE RÉPARATION ET DIAGNOSTIC CONTRADICTOIRE
1. Toute entrée de véhicule dans l'atelier SAV CARZONE (Zone Maro-Militaire, Gbèdomidji, Cotonou) fait l'objet d'un Ordre de Réparation (OR) contradictoire signé par le client, mentionnant le kilométrage au compteur, l'état extérieur et les symptômes signalés.
2. Les opérations de diagnostic préalable font l'objet d'une tarification forfaitaire communiquée avant démontage, déductible des travaux en cas d'acceptation du devis de réparation.

ARTICLE 2 — DEVIS PRÉALABLE ET TRAVAUX SUPPLÉMENTAIRES
1. Un devis chiffré (pièces de rechange et main d'œuvre) est soumis à l'approbation expresse du client avant toute intervention.
2. Si au cours des réparations des travaux imprévus s'avèrent nécessaires pour la sécurité ou la bonne marche du véhicule, un avenant ou devis complémentaire est transmis au client ; aucune intervention supplémentaire n'est réalisée sans son accord écrit (ou confirmation par email / WhatsApp officiel).

ARTICLE 3 — PIÈCES DE RECHANGE D'ORIGINE ET MAIN D'ŒUVRE
1. L'Atelier SAV CARZONE utilise exclusivement des pièces de rechange certifiées d'origine constructeur ou homologuées équivalentes.
2. Les pièces remplacées sont tenues à la disposition du client lors de la restitution du véhicule, sauf si les réparations sont prises en charge au titre de la garantie contractuelle ou d'un sinistre d'assurance.

ARTICLE 4 — GARANTIE DES INTERVENTIONS
1. Les réparations effectuées bénéficient d'une garantie de 3 mois ou 5 000 km (au premier terme atteint) sur la main-d'œuvre et les pièces remplacées, à compter de la date de livraison.
2. Cette garantie ne s'applique pas aux pièces d'usure normale (plaquettes, balais d'essuie-glace, pneumatiques), ni aux dommages résultant d'une utilisation anormale ou d'un défaut de surveillance des niveaux par l'utilisateur.

ARTICLE 5 — RÈGLEMENT DES FACTURES ET DROIT DE RÉTENTION
1. Le paiement des prestations et pièces est exigible au comptant lors de la reprise du véhicule, par virement, chèque certifié, carte bancaire ou terminal de paiement CARZONE SARL.
2. Conformément à la législation en vigueur, CARZONE SARL exerce un droit de rétention légal sur le véhicule jusqu'au complet paiement de la facture de réparation correspondante.

ARTICLE 6 — ENLÈVEMENT DU VÉHICULE ET FRAIS DE GARDIENNAGE
1. Le client est informé par SMS, appel ou email dès l'achèvement des travaux.
2. Un délai de grâce de 48 heures ouvrées est accordé pour récupérer le véhicule. Au-delà de ce délai, des frais de gardiennage et de sécurisation de 5 000 FCFA TTC par jour calendaire seront automatiquement facturés jusqu'au retrait effectif.

ARTICLE 7 — CONTESTATIONS ET ATTRIBUTION DE COMPÉTENCE
Tout différend n'ayant pu trouver de solution amiable sera porté devant le Tribunal de Commerce de Cotonou, seul compétent.`;

export function getDefaultCgv(type: CgvType = "VEHICULE"): string {
  return type === "ATELIER" ? DEFAULT_CGV_ATELIER : DEFAULT_CGV_VEHICULE;
}
