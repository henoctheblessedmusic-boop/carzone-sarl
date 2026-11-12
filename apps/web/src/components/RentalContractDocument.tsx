import { formatXof } from "@/lib/format";
import {
  formatRentalDateLong,
  rentalContractReference,
  rentalVehicleLabel,
  rentalVehicleSpecs,
  type RentalContractData,
} from "@/lib/rental-contract";
import { SITE_ADDRESS, SITE_EMAILS, SITE_FISCAL, SITE_PRIMARY_PHONE } from "@/lib/site-constants";
import type { CSSProperties, ReactNode } from "react";

const TYPE_LABELS: Record<string, string> = {
  LCD: "Location courte durée",
  LLD: "Location longue durée",
  LOA: "Location avec option d'achat",
};

const STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  ACTIF: "Actif",
  TERMINE: "Terminé",
};

/** Identité et mentions légales officielles, issues des constantes du projet. */
const COMPANY = {
  name: "CARZONE SARL",
  activity: "Concessionnaire automobile multimarques et atelier agréé",
  address: `${SITE_ADDRESS.line1}, ${SITE_ADDRESS.line2}, ${SITE_ADDRESS.city}, ${SITE_ADDRESS.country}`,
  headquarters: `${SITE_ADDRESS.line2}, ${SITE_ADDRESS.city}-${SITE_ADDRESS.country}`,
  phone: SITE_PRIMARY_PHONE,
  email: SITE_EMAILS.contact,
  ifu: SITE_FISCAL.ifu,
  rccm: SITE_FISCAL.rccm,
  city: SITE_ADDRESS.city,
};

const LESSOR_DUTIES = [
  "Mettre à disposition un véhicule en parfait état de fonctionnement ;",
  "Fournir les documents administratifs nécessaires ;",
  "Faire le plein en carburant du véhicule à la remise du véhicule au Locataire ;",
  "Assurer les grosses réparations résultant d'une usure normale ou d'un vice de fonctionnement non imputable au Locataire.",
];

const RENTER_DUTIES = [
  "Utiliser le véhicule conformément à sa destination ;",
  "Veiller à sa bonne conservation ;",
  "Assurer les opérations d'entretien de nettoyage courant ;",
  "Supporter les frais de carburant et autres consommables ;",
  "Informer immédiatement le Loueur en cas de panne ou d'accident (seul le Loueur est autorisé à faire des interventions sur le véhicule) ;",
  "Faire le plein en carburant du véhicule lors du retour au Loueur.",
];

const HANDOVER_REPORTS = ["Lors de la remise du véhicule ;", "Lors de sa restitution."];

const INSURANCE_TEXT =
  "Le Loueur s'engage à souscrire, avant la remise du véhicule au Locataire, une police d'assurance couvrant le véhicule conformément à la législation en vigueur en République du Bénin. Il s'engage également à maintenir cette assurance en vigueur pendant toute la durée de la location.";

const TERMINATION_TEXT =
  "Le contrat pourra être résilié de plein droit en cas de manquement grave de l'une des parties à ses obligations.";

const FORCE_MAJEURE_TEXT =
  "Aucune des parties ne pourra être tenue responsable d'un retard ou d'une inexécution résultant d'un cas de force majeure conformément à la législation en vigueur.";

const AMICABLE_TEXT = "Les parties privilégieront un règlement amiable de tout différend.";

const JURISDICTION_TEXT =
  "À défaut d'accord amiable, le litige sera porté devant les juridictions compétentes de Cotonou (République du Bénin).";

const COPIES_TEXT =
  "Le présent contrat est établi en deux (02) exemplaires originaux ayant la même valeur juridique, un pour chacune des parties.";

const FIRM_PRICE_TEXT = "Les prix sont fermés et non révisables pendant toute la durée du contrat.";

const AMENDMENT_TEXT = "Toute prolongation fera l'objet d'un avenant signé par les parties.";

const PAYMENT_TERMS_TEXT =
  "Le Locataire s'engage à régler les frais de location selon les modalités convenues entre les parties.";

const DEPOSIT_NOTE =
  "Le dépôt de garantie est remboursable et distinct du loyer. Il peut être retenu en cas de dommage, de frais ou de manquement aux obligations du présent contrat.";

const DAMAGE_TEXT =
  "Toute dégradation résultant d'une mauvaise utilisation sera à la charge du Locataire.";

/** Pointillés du canevas papier : la valeur sera complétée à la main si elle manque. */
const BLANK_LINE = "............................";

export function RentalContractDocument({ rental }: { rental: RentalContractData }) {
  const reference = rentalContractReference(rental.id);
  const vehicleLabel = rentalVehicleLabel(rental.vehicle);
  const specs = rentalVehicleSpecs(rental.vehicle);

  const paid = rental.payments.reduce((sum, payment) => sum + payment.amountXof, 0);
  const total = rental.totalXof || 0;
  const balance = Math.max(0, total - paid);

  const renterName = rental.customer.companyName || rental.customer.contactName;
  // Une société est « sise à », une personne physique « demeurant à ».
  const residencePrefix = rental.customer.companyName ? "sise à" : "demeurant à";
  const street = rental.customer.address?.trim() || "";
  const city = rental.customer.city?.trim() || "";
  const sameAsCity = street.toLowerCase() === city.toLowerCase();
  const renterAddress = [street, sameAsCity ? "" : city].filter(Boolean).join(", ");
  const renterIdentity = [
    renterAddress ? `${residencePrefix} ${renterAddress}` : null,
    rental.customer.phone ? `Tél : ${rental.customer.phone}` : null,
    rental.customer.email ? `E-mail : ${rental.customer.email}` : null,
    rental.customer.ifu ? `IFU : ${rental.customer.ifu}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  // Aucun nom inventé : sans signataire enregistré, la représentation reste générique.
  const lessorRepresentative = rental.signedByCompany || "sa Direction Générale";
  const signatureDate = rental.signedAt ? formatRentalDateLong(rental.signedAt) : BLANK_LINE;
  const durationLabel = rental.days ? `${rental.days} jour${rental.days > 1 ? "s" : ""}` : BLANK_LINE;

  return (
    <article className="ox-rental-contract-document" style={sheet}>
      <style>{PRINT_STYLES}</style>

      <header style={headerRow}>
        <div>
          <div style={companyName}>{COMPANY.name}</div>
          <div style={companyActivity}>{COMPANY.activity}</div>
          <div style={companyLine}>{COMPANY.address}</div>
          <div style={companyLine}>
            {COMPANY.phone} · {COMPANY.email}
          </div>
          <div style={companyLine}>
            IFU : {COMPANY.ifu} · RCCM : {COMPANY.rccm}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/carzone-logo-print.png"
            alt="CARZONE SARL"
            style={{ width: 58, height: 58, objectFit: "contain", marginLeft: "auto" }}
          />
          <div style={headerKicker}>Référence</div>
          <div style={headerReference}>{reference}</div>
        </div>
      </header>

      <div style={{ textAlign: "center", margin: "14px 0 10px" }}>
        <h1 style={documentTitle}>Contrat de location de véhicule</h1>
        <div style={documentSubtitle}>{TYPE_LABELS[rental.type] || rental.type}</div>
      </div>

      <section className="contract-parties" style={{ marginBottom: 10 }}>
        <h2 style={blockTitle}>Entre les soussignés :</h2>

        <h3 style={partyTitle}>Le Loueur</h3>
        <p style={paragraph}>
          <strong>{COMPANY.name}</strong>, société de droit béninois, immatriculée au Registre du
          Commerce sous le N° RCCM : <strong>{COMPANY.rccm}</strong>, IFU{" "}
          <strong>{COMPANY.ifu}</strong>, dont le siège social est situé à{" "}
          <strong>{COMPANY.headquarters}</strong>,
        </p>
        <p style={paragraph}>
          Représentée par <strong>{lessorRepresentative}</strong>, agissant en vertu des pouvoirs qui
          lui sont conférés aux fins des présentes,
        </p>
        <p style={paragraph}>Ci-après dénommée « Le Loueur »,</p>
        <p style={partyFooting}>D&apos;une part,</p>

        <p style={partyFooting}>ET</p>

        <h3 style={partyTitle}>Le Locataire</h3>
        <p style={paragraph}>
          <strong>{renterName}</strong>
          {renterIdentity ? `, ${renterIdentity}` : ""}
        </p>
        {rental.customer.contactName === renterName ? null : (
          <p style={paragraph}>
            Personne à contacter : <strong>{rental.customer.contactName}</strong>
          </p>
        )}
        <p style={paragraph}>Ci-après dénommé « Le Locataire »,</p>
        <p style={partyFooting}>D&apos;autre part.</p>

        <p style={{ ...paragraph, marginTop: 6 }}>Il a été convenu ce qui suit :</p>
      </section>

      <Article number={1} title="Objet">
        <p style={paragraph}>
          Le présent contrat a pour objet la location par le Loueur au profit du Locataire d&apos;une
          voiture <strong>{vehicleLabel || BLANK_LINE}</strong>
          {rental.vehicle.registrationNumber ? (
            <>
              , immatriculée <strong>{rental.vehicle.registrationNumber}</strong>
            </>
          ) : null}
          .
        </p>
      </Article>

      <Article number={2} title="Caractéristiques du véhicule">
        <ul style={checklist}>
          {specs.map((spec) => (
            <li key={spec.label} style={checklistItem}>
              <span style={checkMark}>✓</span>
              <span>
                {spec.label} : <strong>{spec.value}</strong>
              </span>
            </li>
          ))}
        </ul>
      </Article>

      <Article number={3} title="Durée de la location">
        <p style={paragraph}>
          Le présent contrat est conclu pour une durée de <strong>{durationLabel}</strong>.
        </p>
        <ul style={bulletList}>
          <li style={bulletItem}>
            La date de prise d&apos;effet correspond à la date de mise à disposition effective de la
            voiture, qui est le <strong>{formatRentalDateLong(rental.startDate)}</strong>.
          </li>
          {rental.endDate ? (
            <li style={bulletItem}>
              La restitution du véhicule est prévue le{" "}
              <strong>{formatRentalDateLong(rental.endDate)}</strong>.
            </li>
          ) : null}
        </ul>
        <p style={paragraph}>{AMENDMENT_TEXT}</p>
      </Article>

      <Article number={4} title="Conditions financières">
        <p style={paragraph}>Le montant de la location est fixé comme suit :</p>
        <ul style={bulletList}>
          <li style={bulletItem}>
            Durée : <strong>{durationLabel}</strong>
          </li>
          <li style={bulletItem}>
            Prix unitaire journalier HT :{" "}
            <strong>{rental.dailyXof ? formatXof(rental.dailyXof) : BLANK_LINE}</strong>
          </li>
          <li style={bulletItem}>
            Montant total HT : <strong>{total ? formatXof(total) : BLANK_LINE}</strong>
          </li>
          {rental.depositXof ? (
            <li style={bulletItem}>
              Dépôt de garantie (caution) : <strong>{formatXof(rental.depositXof)}</strong>
            </li>
          ) : null}
        </ul>
        <p style={paragraph}>{FIRM_PRICE_TEXT}</p>
        {rental.depositXof ? <p style={note}>{DEPOSIT_NOTE}</p> : null}
      </Article>

      <Article number={5} title="Modalités de paiement">
        <p style={paragraph}>{PAYMENT_TERMS_TEXT}</p>
        {rental.payments.length > 0 ? (
          <p style={paragraph}>
            À la date d&apos;édition du présent contrat, le Locataire a déjà réglé{" "}
            <strong>{formatXof(paid)}</strong> ; le solde restant dû s&apos;élève à{" "}
            <strong>{formatXof(balance)}</strong>.
          </p>
        ) : null}
      </Article>

      <Article number={6} title="Lieu de mise à disposition">
        <p style={paragraph}>
          Le véhicule sera mis à disposition du Locataire sur le site de la{" "}
          <strong>{COMPANY.name}</strong>, {COMPANY.address}.
        </p>
        <p style={paragraph}>Un procès-verbal contradictoire sera établi :</p>
        <ul style={bulletList}>
          {HANDOVER_REPORTS.map((item) => (
            <li key={item} style={bulletItem}>
              {item}
            </li>
          ))}
          <li style={bulletItem}>
            Kilométrage relevé au départ :{" "}
            <strong>{rental.vehicle.mileage.toLocaleString("fr-BJ")} km</strong>
          </li>
          <li style={bulletItem}>
            État constaté au départ : <strong>{rental.departureCondition || BLANK_LINE}</strong>
          </li>
        </ul>
      </Article>

      <Article number={7} title="Obligations du Loueur">
        <p style={paragraph}>Le Loueur s&apos;engage à :</p>
        <ul style={bulletList}>
          {LESSOR_DUTIES.map((item) => (
            <li key={item} style={bulletItem}>
              {item}
            </li>
          ))}
        </ul>
      </Article>

      <Article number={8} title="Obligations du Locataire">
        <p style={paragraph}>Le Locataire s&apos;engage à :</p>
        <ul style={bulletList}>
          {RENTER_DUTIES.map((item) => (
            <li key={item} style={bulletItem}>
              {item}
            </li>
          ))}
        </ul>
        <p style={paragraph}>{DAMAGE_TEXT}</p>
      </Article>

      <Article number={9} title="Assurance">
        <p style={paragraph}>{INSURANCE_TEXT}</p>
      </Article>

      <Article number={10} title="Résiliation">
        <p style={paragraph}>{TERMINATION_TEXT}</p>
      </Article>

      <Article number={11} title="Force majeure">
        <p style={paragraph}>{FORCE_MAJEURE_TEXT}</p>
      </Article>

      <Article number={12} title="Règlement des litiges">
        <p style={paragraph}>{AMICABLE_TEXT}</p>
        <p style={paragraph}>{JURISDICTION_TEXT}</p>
      </Article>

      <Article number={13} title="Dispositions finales">
        <p style={paragraph}>{COPIES_TEXT}</p>
        <p style={paragraph}>
          Fait à <strong>{COMPANY.city}</strong>, le <strong>{signatureDate}</strong>
        </p>
      </Article>

      <section className="contract-signatures" style={signatureGrid}>
        <div style={signatureBox}>
          <div style={signatureRole}>Le Loueur :</div>
          <div style={signatureCompany}>{COMPANY.name}</div>
          <div style={signatureName}>{rental.signedByCompany || BLANK_LINE}</div>
          <div style={signatureHint}>Nom, qualité, signature et cachet</div>
        </div>
        <div style={signatureBox}>
          <div style={signatureRole}>Le Locataire :</div>
          <div style={signatureCompany}>{renterName}</div>
          <div style={signatureName}>{rental.signedByClient || BLANK_LINE}</div>
          <div style={signatureHint}>Nom, qualité et signature</div>
        </div>
      </section>

      <footer style={footerRow}>
        <span>
          {COMPANY.name} · {COMPANY.address}
        </span>
        <span>
          {reference} · {STATUS_LABELS[rental.status] || rental.status}
          {rental.createdByName ? ` · Établi par ${rental.createdByName}` : ""}
        </span>
      </footer>
    </article>
  );
}

function Article({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="contract-article" style={articleSection}>
      <h2 style={articleTitle}>
        Article {number} : {title}
      </h2>
      {children}
    </section>
  );
}

const PRINT_STYLES = `
  @media print {
    @page { size: A4; margin: 12mm; }
    html, body { background: #ffffff !important; }
    .ox-aside, .ox-topbar, .ox-drawer-backdrop, .ox-contract-actions, .ox-rental-contract-toolbar { display: none !important; }
    .ox-main { padding: 0 !important; }
    .ox-rental-contract-document {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      font-size: 9.2pt !important;
    }
    .ox-rental-contract-document .contract-article,
    .ox-rental-contract-document .contract-parties,
    .ox-rental-contract-document .contract-signatures {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
`;

const sheet: CSSProperties = {
  width: "210mm",
  maxWidth: "100%",
  margin: "0 auto",
  background: "#ffffff",
  color: "#111827",
  padding: "16mm 15mm",
  boxSizing: "border-box",
  borderRadius: 4,
  boxShadow: "0 12px 40px rgba(0,0,0,0.16)",
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontSize: "9.6pt",
  lineHeight: 1.5,
};

const headerRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 18,
  alignItems: "flex-start",
  borderBottom: "2px solid #be123c",
  paddingBottom: 10,
};

const companyName: CSSProperties = {
  fontSize: "1.4rem",
  fontWeight: 900,
  letterSpacing: "0.02em",
  color: "#0f172a",
};

const companyActivity: CSSProperties = { fontSize: "0.7rem", color: "#475569", fontWeight: 650 };

const companyLine: CSSProperties = { fontSize: "0.68rem", color: "#64748b" };

const headerKicker: CSSProperties = {
  marginTop: 6,
  fontSize: "0.62rem",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const headerReference: CSSProperties = { fontSize: "0.8rem", fontWeight: 900, color: "#be123c" };

const documentTitle: CSSProperties = {
  margin: 0,
  fontSize: "1.2rem",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#0f172a",
};

const documentSubtitle: CSSProperties = { marginTop: 3, fontSize: "0.72rem", color: "#64748b" };

const blockTitle: CSSProperties = {
  margin: "0 0 6px",
  fontSize: "0.86rem",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#0f172a",
};

const partyTitle: CSSProperties = {
  margin: "8px 0 4px",
  fontSize: "0.8rem",
  fontWeight: 850,
  color: "#be123c",
};

const paragraph: CSSProperties = { margin: "0 0 5px", color: "#1f2937", textAlign: "justify" };

const partyFooting: CSSProperties = { ...paragraph, fontWeight: 800 };

const note: CSSProperties = { margin: "5px 0 0", fontSize: "0.72rem", color: "#64748b" };

const articleSection: CSSProperties = {
  marginBottom: 10,
  paddingTop: 8,
  borderTop: "1px solid #e2e8f0",
};

const articleTitle: CSSProperties = {
  margin: "0 0 5px",
  fontSize: "0.82rem",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  color: "#0f172a",
};

const checklist: CSSProperties = {
  listStyle: "none",
  margin: "0 0 0 10px",
  padding: 0,
  display: "grid",
  gap: 2,
};

const checklistItem: CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "baseline",
  color: "#1f2937",
};

const checkMark: CSSProperties = { color: "#be123c", fontWeight: 900, flexShrink: 0 };

const bulletList: CSSProperties = { margin: "0 0 5px", paddingLeft: 20, color: "#1f2937" };

const bulletItem: CSSProperties = { marginBottom: 2 };

const signatureGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginTop: 14,
};

const signatureBox: CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  padding: "8px 10px 40px",
};

const signatureRole: CSSProperties = {
  fontSize: "0.74rem",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#0f172a",
};

const signatureCompany: CSSProperties = { fontSize: "0.76rem", fontWeight: 800, color: "#1f2937" };

const signatureName: CSSProperties = { fontSize: "0.74rem", color: "#334155", marginTop: 4 };

const signatureHint: CSSProperties = { fontSize: "0.62rem", color: "#94a3b8", marginTop: 2 };

const footerRow: CSSProperties = {
  marginTop: 12,
  paddingTop: 8,
  borderTop: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  fontSize: "0.62rem",
  color: "#64748b",
};
