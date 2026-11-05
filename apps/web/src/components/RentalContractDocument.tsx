import { formatXof } from "@/lib/format";
import {
  formatRentalDate,
  rentalContractReference,
  type RentalContractData,
} from "@/lib/rental-contract";
import type { CSSProperties } from "react";

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

const COMPANY = {
  name: "CARZONE SARL",
  activity: "Concessionnaire automobile multimarques et atelier agréé",
  address: "Zone Maro-Militaire, Quartier Gbèdomidji, Cotonou, Bénin",
  phone: "+229 01 92 61 61 61",
  email: "contact@topcarzone.com",
  ifu: "0202314589201",
  rccm: "RB/COT/23 B 34567",
};

export function RentalContractDocument({ rental }: { rental: RentalContractData }) {
  const reference = rentalContractReference(rental.id);
  const paid = rental.payments.reduce((sum, payment) => sum + payment.amountXof, 0);
  const total = rental.totalXof || 0;
  const balance = Math.max(0, total - paid);
  const customerAddress = [rental.customer.address, rental.customer.city].filter(Boolean).join(", ") || "-";
  const vehicleLabel = [rental.vehicle.brand, rental.vehicle.model, rental.vehicle.variant].filter(Boolean).join(" ");
  const signatureDate = rental.signedAt ? formatRentalDate(rental.signedAt) : "-";

  return (
    <article
      className="ox-rental-contract-document"
      style={{
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
        fontSize: "9.5pt",
        lineHeight: 1.45,
      }}
    >
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
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
            font-size: 9pt !important;
          }
          .ox-rental-contract-document .contract-section { break-inside: avoid; }
          .ox-rental-contract-document .contract-signatures { break-inside: avoid; }
        }
      `}</style>

      <header style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", borderBottom: "2px solid #be123c", paddingBottom: 10 }}>
        <div>
          <div style={{ fontSize: "1.45rem", fontWeight: 900, letterSpacing: "0.02em", color: "#0f172a" }}>{COMPANY.name}</div>
          <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 650 }}>{COMPANY.activity}</div>
          <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: 4 }}>{COMPANY.address}</div>
          <div style={{ fontSize: "0.68rem", color: "#64748b" }}>{COMPANY.phone} · {COMPANY.email}</div>
          <div style={{ fontSize: "0.65rem", color: "#64748b" }}>IFU : {COMPANY.ifu} · RCCM : {COMPANY.rccm}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/carzone-logo-print.png" alt="CARZONE SARL" style={{ width: 58, height: 58, objectFit: "contain", marginLeft: "auto" }} />
          <div style={{ marginTop: 6, fontSize: "0.64rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Contrat de location</div>
          <div style={{ fontSize: "0.78rem", fontWeight: 900, color: "#be123c" }}>{reference}</div>
        </div>
      </header>

      <div style={{ textAlign: "center", margin: "14px 0 12px" }}>
        <h1 style={{ margin: 0, fontSize: "1.25rem", letterSpacing: "0.04em", textTransform: "uppercase", color: "#0f172a" }}>Contrat de location de véhicule</h1>
        <div style={{ marginTop: 4, fontSize: "0.72rem", color: "#64748b" }}>
          {TYPE_LABELS[rental.type] || rental.type} · Statut : {STATUS_LABELS[rental.status] || rental.status}
        </div>
      </div>

      <section className="contract-section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: 10 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 900, color: "#be123c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Le loueur</div>
          <div style={{ fontWeight: 850, color: "#0f172a" }}>{COMPANY.name}</div>
          <div style={{ color: "#475569" }}>{COMPANY.address}</div>
          <div style={{ color: "#475569" }}>{COMPANY.phone}</div>
          <div style={{ color: "#475569" }}>{COMPANY.email}</div>
          <div style={{ color: "#475569" }}>Représenté par : {rental.createdByName || "La Direction"}</div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: 10 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 900, color: "#be123c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Le locataire</div>
          <div style={{ fontWeight: 850, color: "#0f172a" }}>{rental.customer.companyName || rental.customer.contactName}</div>
          {rental.customer.companyName && <div style={{ color: "#475569" }}>Contact : {rental.customer.contactName}</div>}
          <div style={{ color: "#475569" }}>{customerAddress}</div>
          <div style={{ color: "#475569" }}>Tél. : {rental.customer.phone || "-"}</div>
          <div style={{ color: "#475569" }}>E-mail : {rental.customer.email || "-"}</div>
          {rental.customer.ifu && <div style={{ color: "#475569" }}>IFU : {rental.customer.ifu}</div>}
        </div>
      </section>

      <section className="contract-section" style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: "0.82rem", margin: "0 0 6px", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>1. Véhicule loué</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
          <tbody>
            {[
              ["Véhicule", vehicleLabel],
              ["Immatriculation", rental.vehicle.registrationNumber || "-"],
              ["N° de châssis (VIN)", rental.vehicle.vin || "-"],
              ["Énergie", rental.vehicle.energy || "-"],
              ["Couleur", rental.vehicle.color || "-"],
              ["Kilométrage au départ", rental.vehicle.mileage ? `${rental.vehicle.mileage.toLocaleString("fr-BJ")} km` : "-"],
              ["État au départ", rental.departureCondition || "-"],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={{ padding: "3px 6px", borderBottom: "1px solid #f1f5f9", color: "#64748b", width: "34%" }}>{label}</td>
                <td style={{ padding: "3px 6px", borderBottom: "1px solid #f1f5f9", fontWeight: 650 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="contract-section" style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: "0.82rem", margin: "0 0 6px", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>2. Durée et conditions financières</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
          <tbody>
            <tr><td style={cellLabel}>Date de début</td><td style={cellValue}>{formatRentalDate(rental.startDate)}</td><td style={cellLabel}>Date de fin</td><td style={cellValue}>{formatRentalDate(rental.endDate)}</td></tr>
            <tr><td style={cellLabel}>Durée facturée</td><td style={cellValue}>{rental.days ? `${rental.days} jour(s)` : "-"}</td><td style={cellLabel}>Tarif journalier</td><td style={cellValue}>{rental.dailyXof ? formatXof(rental.dailyXof) : "-"}</td></tr>
            <tr><td style={cellLabel}>Total du contrat</td><td style={{ ...cellValue, fontWeight: 900 }}>{total ? formatXof(total) : "-"}</td><td style={cellLabel}>Caution / dépôt de garantie</td><td style={cellValue}>{rental.depositXof ? formatXof(rental.depositXof) : "-"}</td></tr>
            <tr><td style={cellLabel}>Déjà encaissé</td><td style={cellValue}>{formatXof(paid)}</td><td style={cellLabel}>Solde restant</td><td style={cellValue}>{formatXof(balance)}</td></tr>
          </tbody>
        </table>
        <p style={{ margin: "6px 0 0", fontSize: "0.68rem", color: "#64748b" }}>
          La caution est un dépôt de garantie remboursable, distinct du loyer. Elle peut être retenue en cas de dommage, de frais ou de manquement aux obligations du contrat.
        </p>
      </section>

      <section className="contract-section" style={{ marginBottom: 10 }}>
        <h2 style={{ fontSize: "0.82rem", margin: "0 0 6px", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>3. Obligations et conditions de retour</h2>
        <ol style={{ margin: 0, paddingLeft: 18, color: "#334155", fontSize: "0.74rem", lineHeight: 1.5 }}>
          <li>Le locataire déclare être titulaire d&apos;un permis de conduire valide et avoir la capacité de conduire le véhicule.</li>
          <li>Le véhicule est loué pour un usage personnel ou professionnel licite, à l&apos;exclusion de toute sous-location, revente, compétition ou transport non autorisé.</li>
          <li>Le locataire s&apos;engage à restituer le véhicule à la date convenue, dans l&apos;état constaté au départ, avec le carburant ou la charge indiqués.</li>
          <li>Les carburants, péages, amendes et frais liés à l&apos;usage du véhicule pendant la location sont à la charge du locataire.</li>
          <li>Tout dommage, vol ou accident doit être signalé immédiatement à CARZONE SARL. Les réparations non autorisées sont interdites.</li>
          <li>Tout retard de restitution peut donner lieu à la facturation de jours supplémentaires et à des frais de retard.</li>
          <li>Le véhicule reste la propriété de CARZONE SARL. Le contrat ne confère aucun droit de propriété au locataire.</li>
          <li>Les parties reconnaissent avoir pris connaissance des conditions ci-dessus et acceptent le présent contrat.</li>
        </ol>
      </section>

      <section className="contract-signatures" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 14 }}>
        <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 6 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#0f172a" }}>Signature du locataire</div>
          <div style={{ fontSize: "0.65rem", color: "#64748b" }}>Nom : {rental.signedByClient || "____________________________"}</div>
          <div style={{ fontSize: "0.65rem", color: "#64748b" }}>Date : {rental.signedAt ? signatureDate : "________________"}</div>
          <div style={{ height: 34 }} />
        </div>
        <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 6 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#0f172a" }}>Pour CARZONE SARL</div>
          <div style={{ fontSize: "0.65rem", color: "#64748b" }}>Nom : {rental.signedByCompany || "____________________________"}</div>
          <div style={{ fontSize: "0.65rem", color: "#64748b" }}>Date : {rental.signedAt ? signatureDate : "________________"}</div>
          <div style={{ height: 34 }} />
        </div>
      </section>

      <footer style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", gap: 12, fontSize: "0.62rem", color: "#64748b" }}>
        <span>{COMPANY.name} · {COMPANY.address}</span>
        <span>{reference} · Document contractuel</span>
      </footer>
    </article>
  );
}

const cellLabel: CSSProperties = {
  padding: "3px 6px",
  borderBottom: "1px solid #f1f5f9",
  color: "#64748b",
  width: "23%",
};

const cellValue: CSSProperties = {
  padding: "3px 6px",
  borderBottom: "1px solid #f1f5f9",
  fontWeight: 650,
};
