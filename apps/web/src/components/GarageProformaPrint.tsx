import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import { formatXof } from "@/lib/format";
import { formatLegalAmountNotice } from "@/lib/number-to-words-fr";
import { SITE_ADDRESS, SITE_EMAILS, SITE_FISCAL, SITE_PRIMARY_PHONE } from "@/lib/site-constants";

type GarageProformaLine = {
  id: string;
  description: string;
  quantity: number;
  unitPriceXof: number;
};

type GarageProformaQuote = {
  id: string;
  number: string;
  activity: string;
  taxMode: string;
  taxRatePct: number;
  subtotalHtXof: number;
  taxXof: number;
  totalXof: number;
  notes: string | null;
  createdAt: Date;
  customer: {
    contactName: string;
    companyName: string | null;
    address: string | null;
    city: string | null;
    phone: string | null;
    ifu: string | null;
  };
  vehicleImmatriculation: string | null;
  vehicleBrand: string | null;
  vehicleModel: string | null;
  vehicleMileage: number | null;
  vehicleVin: string | null;
  vehicleDiagnostic: string | null;
  lines: GarageProformaLine[];
};

const COMPANY = {
  name: "CARZONE SARL",
  address: `${SITE_ADDRESS.line1}, ${SITE_ADDRESS.line2}, ${SITE_ADDRESS.city}, ${SITE_ADDRESS.country}`,
  phone: SITE_PRIMARY_PHONE,
  email: SITE_EMAILS.contact,
  ifu: SITE_FISCAL.ifu,
  rccm: SITE_FISCAL.rccm,
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-BJ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function amountInWords(value: number): string {
  return formatLegalAmountNotice(value, "proforma");
}

function lineTotalTtc(line: GarageProformaLine, taxRatePct: number, taxMode: string): number {
  const base = line.quantity * line.unitPriceXof;
  return taxMode === "TTC" ? base : Math.round(base * (1 + taxRatePct / 100));
}

export function GarageProformaPrint({ quote }: { quote: GarageProformaQuote }) {
  const customerName = quote.customer.companyName || quote.customer.contactName;
  const customerAddress = [quote.customer.address, quote.customer.city].filter(Boolean).join(", ") || "-";
  const vehicleLabel = [quote.vehicleBrand, quote.vehicleModel].filter(Boolean).join(" ") || "-";
  const totalHt = quote.subtotalHtXof;
  const totalTva = quote.taxXof;
  const totalTtc = quote.totalXof;

  return (
    <div style={{ minHeight: "100vh", background: "#eef2f6", color: "#111827", fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          html, body { background: #ffffff !important; }
          .garage-proforma-toolbar { display: none !important; }
          .garage-proforma-document { width: 100% !important; margin: 0 !important; box-shadow: none !important; padding: 0 !important; }
        }
      `}</style>

      <div className="garage-proforma-toolbar no-print" style={{ maxWidth: 900, margin: "0 auto", padding: "1rem", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/quotes" className="ox-btn ox-btn-ghost">Retour aux devis</Link>
        <PrintButton />
      </div>

      <article className="garage-proforma-document" style={{ width: "210mm", maxWidth: "100%", margin: "0 auto 2rem", padding: "14mm 13mm", background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.12)", fontSize: "9pt", lineHeight: 1.35 }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 20, borderBottom: "2px solid #b91c1c", paddingBottom: 8, marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/carzone-logo-print.png" alt="CARZONE SARL" width={58} height={58} style={{ objectFit: "contain" }} />
            <div>
              <div style={{ fontSize: "1.15rem", fontWeight: 900 }}>{COMPANY.name}</div>
              <div style={{ fontSize: "0.7rem", color: "#475569" }}>Concessionnaire automobile multimarques et atelier agréé</div>
              <div style={{ fontSize: "0.66rem", color: "#475569", marginTop: 3 }}>{COMPANY.address}</div>
              <div style={{ fontSize: "0.66rem", color: "#475569" }}>{COMPANY.phone} · {COMPANY.email}</div>
              <div style={{ fontSize: "0.63rem", color: "#475569" }}>IFU : {COMPANY.ifu} · RCCM : {COMPANY.rccm}</div>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: "1.35rem", fontWeight: 900, letterSpacing: "0.06em" }}>PROFORMA</div>
            <div style={{ fontSize: "0.72rem", marginTop: 3 }}>N° Facture : <strong>{quote.number}</strong></div>
            <div style={{ fontSize: "0.72rem" }}>Date : <strong>{formatDate(quote.createdAt)}</strong></div>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
          <section style={{ border: "1px solid #cbd5e1", padding: "7px 9px" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 900, color: "#b91c1c", marginBottom: 4 }}>INFORMATIONS CLIENT</div>
            <div><strong>Nom / Raison sociale :</strong> {customerName}</div>
            <div><strong>Adresse :</strong> {customerAddress}</div>
            <div><strong>Téléphone :</strong> {quote.customer.phone || "-"}</div>
            <div><strong>IFU :</strong> {quote.customer.ifu || "-"}</div>
          </section>
          <section style={{ border: "1px solid #cbd5e1", padding: "7px 9px" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 900, color: "#b91c1c", marginBottom: 4 }}>INFORMATIONS VÉHICULE</div>
            <div><strong>Immatriculation :</strong> {quote.vehicleImmatriculation || "-"}</div>
            <div><strong>Marque / Modèle :</strong> {vehicleLabel}</div>
            <div><strong>Kilométrage :</strong> {quote.vehicleMileage != null ? `${quote.vehicleMileage.toLocaleString("fr-BJ")} km` : "-"}</div>
            <div><strong>N° Châssis (VIN) :</strong> {quote.vehicleVin || "-"}</div>
            <div><strong>Services :</strong> {quote.vehicleDiagnostic || "-"}</div>
          </section>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.73rem", marginBottom: 8 }}>
          <thead>
            <tr style={{ background: "#e2e8f0" }}>
              <th style={{ border: "1px solid #94a3b8", padding: "4px 5px", width: "6%" }}>Réf</th>
              <th style={{ border: "1px solid #94a3b8", padding: "4px 5px", textAlign: "left" }}>Désignation des prestations / pièces</th>
              <th style={{ border: "1px solid #94a3b8", padding: "4px 5px", width: "8%" }}>Qté</th>
              <th style={{ border: "1px solid #94a3b8", padding: "4px 5px", width: "16%" }}>Prix unitaire (FCFA)</th>
              <th style={{ border: "1px solid #94a3b8", padding: "4px 5px", width: "9%" }}>TVA (%)</th>
              <th style={{ border: "1px solid #94a3b8", padding: "4px 5px", width: "17%" }}>Total TTC (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((line, index) => (
              <tr key={line.id}>
                <td style={{ border: "1px solid #cbd5e1", padding: "4px 5px", textAlign: "center" }}>{index + 1}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "4px 5px" }}>{line.description.replace(/\s*\(\s*\)/g, "").trim()}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "4px 5px", textAlign: "center" }}>{line.quantity}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "4px 5px", textAlign: "right" }}>{formatXof(line.unitPriceXof)}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "4px 5px", textAlign: "center" }}>{quote.taxRatePct.toFixed(1)}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "4px 5px", textAlign: "right" }}>{formatXof(lineTotalTtc(line, quote.taxRatePct, quote.taxMode))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 9 }}>
          <table style={{ borderCollapse: "collapse", fontSize: "0.76rem", minWidth: 260 }}>
            <tbody>
              <tr><td style={{ padding: "3px 8px", border: "1px solid #cbd5e1" }}>Total HT</td><td style={{ padding: "3px 8px", border: "1px solid #cbd5e1", textAlign: "right" }}>{formatXof(totalHt)}</td></tr>
              <tr><td style={{ padding: "3px 8px", border: "1px solid #cbd5e1" }}>Total TVA</td><td style={{ padding: "3px 8px", border: "1px solid #cbd5e1", textAlign: "right" }}>{formatXof(totalTva)}</td></tr>
              <tr style={{ background: "#f1f5f9", fontWeight: 900 }}><td style={{ padding: "3px 8px", border: "1px solid #94a3b8" }}>Net à Payer TTC</td><td style={{ padding: "3px 8px", border: "1px solid #94a3b8", textAlign: "right" }}>{formatXof(totalTtc)}</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ border: "1px solid #cbd5e1", padding: "7px 9px", marginBottom: 8, fontSize: "0.74rem" }}>
          <div><strong>Conditions de règlement :</strong> Paiement à réception par espèces, Mobile Money ou chèque.</div>
          {quote.notes ? <div><strong>Notes :</strong> {quote.notes}</div> : null}
          <div style={{ marginTop: 5 }}><strong>Arrêtée la présente proforma à la somme de :</strong> {amountInWords(totalTtc)}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginTop: 16, fontSize: "0.75rem" }}>
          <div><div style={{ fontWeight: 800 }}>Le Client</div><div style={{ height: 34 }} /></div>
          <div><div style={{ fontWeight: 800 }}>La Gestionnaire</div><div style={{ height: 34 }} /></div>
        </div>

        <footer style={{ borderTop: "1px solid #cbd5e1", marginTop: 10, paddingTop: 5, fontSize: "0.64rem", color: "#64748b", display: "flex", justifyContent: "space-between", gap: 10 }}>
          <span>{COMPANY.name} · {COMPANY.address}</span>
          <span>IFU {COMPANY.ifu} · RCCM {COMPANY.rccm}</span>
        </footer>
      </article>
    </div>
  );
}
