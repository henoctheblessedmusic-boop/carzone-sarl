import { CarzoneLogo } from "@/components/CarzoneLogo";
import { formatXof } from "@/lib/format";
import { SITE_ADDRESS, SITE_EMAILS, SITE_FISCAL, SITE_PHONES, SITE_WEBSITE } from "@/lib/site-constants";

export type PurchaseOrderLineView = {
  id?: string;
  description: string;
  quantity: number;
  unit?: string | null;
  unitPriceXof: number;
  totalXof: number;
};

export type PurchaseOrderExpenseView = {
  id: string;
  expenseNumber: string;
  purchaseOrderNo: string | null;
  category: string;
  title: string;
  description: string | null;
  supplierName: string;
  supplierPhone: string | null;
  supplierEmail: string | null;
  proformaRef: string | null;
  serviceDate: string;
  dueDate: string | null;
  deliveryAddress: string | null;
  deliveryDate: string | null;
  paymentTerms: string | null;
  budgetLine: string | null;
  fundingSource: string | null;
  taxRatePct: number;
  amountHtXof: number;
  taxXof: number;
  amountTtcXof: number;
  authorizedByName: string | null;
  authorizedTitle: string | null;
  authorizedAt: string | null;
  supplierAcceptedByName: string | null;
  supplierAcceptedAt: string | null;
  lines: PurchaseOrderLineView[];
  registeredBy: string | null;
  createdAt: string;
};

const RED = "#E11D48";
const GOLD = "#C99400";
const INK = "#111827";
const MUTED = "#64748b";
const BORDER = "#d7dee7";

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value || 0);
}

export function PurchaseOrderDocument({ expense }: { expense: PurchaseOrderExpenseView }) {
  const lines: PurchaseOrderLineView[] = expense.lines.length
    ? expense.lines
    : [{
        id: "fallback",
        description: expense.description || expense.title,
        quantity: 1,
        unit: "U",
        unitPriceXof: expense.amountHtXof,
        totalXof: expense.amountHtXof,
      }];

  const number = expense.purchaseOrderNo || expense.expenseNumber;
  const phone = SITE_PHONES.join(" / ");

  return (
    <article
      className="purchase-order-document"
      style={{
        background: "#ffffff",
        color: INK,
        width: "100%",
        maxWidth: 860,
        margin: "0 auto",
        padding: "32px 40px 28px",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: 12,
        lineHeight: 1.45,
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .purchase-order-document * { box-sizing: border-box; }
        .purchase-order-document table { border-collapse: collapse; width: 100%; }
        .purchase-order-document th, .purchase-order-document td { border: 1px solid ${BORDER}; padding: 7px 8px; vertical-align: top; }
        @media print {
          @page { size: A4; margin: 10mm; }
          body * { visibility: hidden !important; }
          .purchase-order-document, .purchase-order-document * { visibility: visible !important; }
          .purchase-order-document { position: absolute; left: 0; top: 0; width: 100%; max-width: none; padding: 0 !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* EN-TÊTE */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, paddingBottom: 14, borderBottom: `3px solid ${RED}` }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <CarzoneLogo size="md" />
          <div style={{ paddingTop: 2 }}>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>CARZONE SARL</div>
            <div style={{ fontSize: 10.5, color: MUTED, marginTop: 2 }}>Concessionnaire automobile multimarques</div>
            <div style={{ fontSize: 10.5, color: MUTED, marginTop: 5, lineHeight: 1.45 }}>
              {SITE_ADDRESS.line1}, {SITE_ADDRESS.line2}<br />
              {SITE_ADDRESS.city}, {SITE_ADDRESS.country}<br />
              Tél. : {phone}<br />
              {SITE_EMAILS.contact} · {SITE_WEBSITE}
            </div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>
              IFU : {SITE_FISCAL.ifu} · RCCM : {SITE_FISCAL.rccm}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", minWidth: 230 }}>
          <div style={{ display: "inline-block", background: RED, color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "0.10em", padding: "7px 14px" }}>
            BON DE COMMANDE
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8, fontFamily: "Consolas, monospace", color: INK }}>{number}</div>
          <div style={{ fontSize: 10.5, color: MUTED, marginTop: 2 }}>Date d&apos;émission : {formatDate(expense.serviceDate)}</div>
          <div style={{ fontSize: 10.5, color: MUTED }}>Réf. interne : {expense.expenseNumber}</div>
        </div>
      </header>

      {/* BLOCS D'INFORMATION */}
      <section style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr 1fr", gap: 10, marginTop: 14 }}>
        <div style={{ border: `1px solid ${BORDER}`, borderTop: `2px solid ${RED}`, padding: "9px 10px" }}>
          <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: RED, fontWeight: 800 }}>Fournisseur</div>
          <div style={{ fontWeight: 800, fontSize: 13, marginTop: 3 }}>{expense.supplierName}</div>
          {expense.supplierPhone && <div style={{ color: MUTED, fontSize: 10.5 }}>Tél. : {expense.supplierPhone}</div>}
          {expense.supplierEmail && <div style={{ color: MUTED, fontSize: 10.5 }}>E-mail : {expense.supplierEmail}</div>}
          {expense.proformaRef && <div style={{ color: MUTED, fontSize: 10.5, marginTop: 3 }}>Réf. devis : {expense.proformaRef}</div>}
        </div>
        <div style={{ border: `1px solid ${BORDER}`, borderTop: `2px solid ${GOLD}`, padding: "9px 10px" }}>
          <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: GOLD, fontWeight: 800 }}>Émetteur</div>
          <div style={{ fontWeight: 800, fontSize: 12, marginTop: 3 }}>CARZONE SARL</div>
          <div style={{ color: MUTED, fontSize: 10.5 }}>{SITE_ADDRESS.line1}, {SITE_ADDRESS.city}</div>
          <div style={{ color: MUTED, fontSize: 10.5 }}>Tél. : {SITE_PHONES[0]}</div>
          <div style={{ color: MUTED, fontSize: 10.5 }}>{SITE_EMAILS.contact}</div>
          <div style={{ color: MUTED, fontSize: 10.5, marginTop: 3 }}>Saisi par : {expense.registeredBy || "-"}</div>
        </div>
        <div style={{ border: `1px solid ${BORDER}`, borderTop: `2px solid #0f766e`, padding: "9px 10px" }}>
          <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "#0f766e", fontWeight: 800 }}>Livraison & paiement</div>
          <div style={{ fontSize: 10.5, marginTop: 3 }}><strong>Adresse :</strong> {expense.deliveryAddress || "-"}</div>
          <div style={{ fontSize: 10.5 }}><strong>Date prévue :</strong> {formatDate(expense.deliveryDate || expense.dueDate)}</div>
          <div style={{ fontSize: 10.5 }}><strong>Paiement :</strong> {expense.paymentTerms || "À réception de la facture"}</div>
          <div style={{ fontSize: 10.5 }}><strong>Ligne budgétaire :</strong> {expense.budgetLine || "-"}</div>
          <div style={{ fontSize: 10.5 }}><strong>Financement :</strong> {expense.fundingSource || "-"}</div>
        </div>
      </section>

      {expense.title && (
        <div style={{ marginTop: 12, padding: "8px 10px", background: "#f8fafc", border: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: MUTED, fontWeight: 800 }}>Objet : </span>
          <strong>{expense.title}</strong>
          {expense.description && <div style={{ color: MUTED, fontSize: 10.5, marginTop: 2 }}>{expense.description}</div>}
        </div>
      )}

      {/* LIGNES */}
      <section style={{ marginTop: 14 }}>
        <table>
          <thead>
            <tr style={{ background: "#f1f5f9", color: "#334155", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <th style={{ width: 30, textAlign: "center" }}>N°</th>
              <th style={{ textAlign: "left" }}>Description des biens ou services</th>
              <th style={{ width: 55, textAlign: "right" }}>Qté</th>
              <th style={{ width: 48, textAlign: "center" }}>Unité</th>
              <th style={{ width: 105, textAlign: "right" }}>P.U. (FCFA)</th>
              <th style={{ width: 115, textAlign: "right" }}>Total (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={line.id || index} style={{ fontSize: 11 }}>
                <td style={{ textAlign: "center", color: MUTED }}>{index + 1}</td>
                <td style={{ fontWeight: 600 }}>{line.description}</td>
                <td style={{ textAlign: "right" }}>{formatQuantity(line.quantity)}</td>
                <td style={{ textAlign: "center" }}>{line.unit || "U"}</td>
                <td style={{ textAlign: "right" }}>{formatXof(line.unitPriceXof)}</td>
                <td style={{ textAlign: "right", fontWeight: 700 }}>{formatXof(line.totalXof)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* TOTAUX */}
      <section style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <table style={{ width: 310 }}>
          <tbody>
            <tr>
              <td style={{ background: "#f8fafc", color: MUTED, fontSize: 10.5 }}>Sous-total HT</td>
              <td style={{ textAlign: "right", fontWeight: 700 }}>{formatXof(expense.amountHtXof)}</td>
            </tr>
            <tr>
              <td style={{ background: "#f8fafc", color: MUTED, fontSize: 10.5 }}>TVA ({expense.taxRatePct || 0} %)</td>
              <td style={{ textAlign: "right", fontWeight: 700 }}>{formatXof(expense.taxXof)}</td>
            </tr>
            <tr>
              <td style={{ background: RED, color: "#fff", fontWeight: 800, fontSize: 11 }}>MONTANT TOTAL TTC</td>
              <td style={{ background: RED, color: "#fff", textAlign: "right", fontWeight: 800, fontSize: 12 }}>{formatXof(expense.amountTtcXof)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* CONDITIONS */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <div style={{ border: `1px solid ${BORDER}`, padding: "9px 10px" }}>
          <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: MUTED, fontWeight: 800, marginBottom: 3 }}>Conditions de livraison</div>
          <div style={{ fontSize: 10.5, color: "#334155" }}>
            Adresse : {expense.deliveryAddress || "CARZONE SARL, Cotonou"}<br />
            Date prévue : {formatDate(expense.deliveryDate || expense.dueDate)}<br />
            Délai : à convenir avec le fournisseur.
          </div>
        </div>
        <div style={{ border: `1px solid ${BORDER}`, padding: "9px 10px" }}>
          <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: MUTED, fontWeight: 800, marginBottom: 3 }}>Conditions de paiement</div>
          <div style={{ fontSize: 10.5, color: "#334155" }}>
            {expense.paymentTerms || "Paiement à 30 jours après réception de la facture."}<br />
            Échéance : {formatDate(expense.dueDate)}<br />
            Mode : virement bancaire, chèque ou espèces.
          </div>
        </div>
      </section>

      {/* SIGNATURES */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
        <div style={{ border: `1px solid ${BORDER}`, padding: "10px 12px", minHeight: 110 }}>
          <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: INK, fontWeight: 800 }}>Autorisation CARZONE</div>
          <div style={{ fontSize: 10.5, color: MUTED, marginTop: 4 }}>Nom : <strong style={{ color: INK }}>{expense.authorizedByName || "-"}</strong></div>
          <div style={{ fontSize: 10.5, color: MUTED }}>Fonction : {expense.authorizedTitle || "-"}</div>
          <div style={{ fontSize: 10.5, color: MUTED }}>Date : {formatDate(expense.authorizedAt || expense.createdAt)}</div>
          <div style={{ marginTop: 24, borderTop: `1px dashed ${BORDER}`, paddingTop: 4, fontSize: 9.5, color: MUTED }}>Signature et cachet</div>
        </div>
        <div style={{ border: `1px solid ${BORDER}`, padding: "10px 12px", minHeight: 110 }}>
          <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: INK, fontWeight: 800 }}>Acceptation du fournisseur</div>
          <div style={{ fontSize: 10.5, color: MUTED, marginTop: 4 }}>Nom : <strong style={{ color: INK }}>{expense.supplierAcceptedByName || expense.supplierName}</strong></div>
          <div style={{ fontSize: 10.5, color: MUTED }}>Fonction : {expense.supplierAcceptedByName ? "Représentant du fournisseur" : "-"}</div>
          <div style={{ fontSize: 10.5, color: MUTED }}>Date : {formatDate(expense.supplierAcceptedAt)}</div>
          <div style={{ marginTop: 24, borderTop: `1px dashed ${BORDER}`, paddingTop: 4, fontSize: 9.5, color: MUTED }}>Signature et cachet du fournisseur</div>
        </div>
      </section>

      <div style={{ marginTop: 12, paddingTop: 8, borderTop: `1px solid ${BORDER}`, fontSize: 9, color: MUTED, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span>Ce bon de commande est soumis à la politique d&apos;approvisionnement de CARZONE SARL. Aucune modification ne peut être apportée sans accord écrit.</span>
        <span style={{ whiteSpace: "nowrap" }}>CARZONE SARL · {SITE_FISCAL.ifu}</span>
      </div>
    </article>
  );
}
