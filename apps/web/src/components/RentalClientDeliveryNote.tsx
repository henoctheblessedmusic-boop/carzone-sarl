import Link from "next/link";
import { formatDate, formatXof } from "@/lib/format";
import { PrintButton } from "@/components/PrintButton";

type ClientDeliveryNoteProps = {
  note: {
    number: string;
    createdAt: Date;
    customer: { contactName: string; phone: string | null; address: string | null } | null;
    rental: {
      startDate: Date;
      endDate: Date | null;
      days: number | null;
      totalXof: number | null;
      vehicle: { brand: string; model: string; registrationNumber: string | null; color: string | null };
      payments: { amountXof: number }[];
    } | null;
    lines: { id: string; description: string; quantity: number; unitPriceXof: number | null }[];
  };
};

/**
 * BL remis au client. Volontairement sans en-tête CARZONE, sans IFU, sans RCCM
 * et sans mention fiscale : c'est une preuve de paiement de location.
 */
export function RentalClientDeliveryNote({ note }: ClientDeliveryNoteProps) {
  const rental = note.rental;
  const total = rental?.totalXof ?? note.lines.reduce((sum, line) => sum + (line.unitPriceXof || 0) * line.quantity, 0);
  const paid = rental?.payments.reduce((sum, payment) => sum + payment.amountXof, 0) ?? 0;
  const balance = Math.max(0, total - paid);

  return (
    <div style={{ minHeight: "100vh", background: "#eef2f6", color: "#13212b", fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div className="no-print" style={{ padding: "0.9rem 1rem", display: "flex", gap: 10, alignItems: "center", background: "#13212b" }}>
        <Link href="/rentals/contracts" className="ox-btn ox-btn-ghost" style={{ color: "#fff" }}>Retour aux contrats</Link>
        <PrintButton />
      </div>

      <article style={{ maxWidth: 760, margin: "2rem auto 3rem", background: "#fff", border: "1px solid #d7e0e8", borderRadius: 14, overflow: "hidden", boxShadow: "0 18px 55px rgba(15,35,50,0.12)" }}>
        <header style={{ padding: "2rem 2.4rem 1.5rem", background: "linear-gradient(135deg,#103242 0%,#1b5366 100%)", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.74rem", letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.75 }}>Location de véhicule</div>
              <h1 style={{ margin: "0.45rem 0 0", fontSize: "2rem", letterSpacing: "-0.02em" }}>Bon de location</h1>
              <div style={{ marginTop: 5, opacity: 0.82, fontSize: "0.9rem" }}>Preuve de paiement remise au client</div>
            </div>
            <div style={{ textAlign: "right", fontSize: "0.88rem", lineHeight: 1.6 }}>
              <div style={{ opacity: 0.75 }}>Référence</div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800 }}>{note.number}</div>
              <div style={{ marginTop: 6, opacity: 0.75 }}>Émis le</div>
              <div style={{ fontWeight: 600 }}>{formatDate(note.createdAt)}</div>
            </div>
          </div>
        </header>

        <div style={{ padding: "2rem 2.4rem", display: "grid", gap: "1.4rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <section style={{ border: "1px solid #e2e9ef", borderRadius: 10, padding: "1rem 1.1rem" }}>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b", fontWeight: 700 }}>Client</div>
              <div style={{ marginTop: 6, fontSize: "1.05rem", fontWeight: 800 }}>{note.customer?.contactName || "-"}</div>
              {note.customer?.phone ? <div style={{ marginTop: 3, fontSize: "0.85rem", color: "#475569" }}>{note.customer.phone}</div> : null}
              {note.customer?.address ? <div style={{ marginTop: 2, fontSize: "0.85rem", color: "#475569" }}>{note.customer.address}</div> : null}
            </section>
            <section style={{ border: "1px solid #e2e9ef", borderRadius: 10, padding: "1rem 1.1rem" }}>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b", fontWeight: 700 }}>Période de location</div>
              <div style={{ marginTop: 6, fontSize: "0.95rem", fontWeight: 700 }}>
                {formatDate(rental?.startDate)} au {rental?.endDate ? formatDate(rental.endDate) : "-"}
              </div>
              <div style={{ marginTop: 3, fontSize: "0.85rem", color: "#475569" }}>{rental?.days || 0} jour(s)</div>
            </section>
          </div>

          <section style={{ border: "1px solid #e2e9ef", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "0.8rem 1.1rem", background: "#f6f9fb", borderBottom: "1px solid #e2e9ef", fontWeight: 800 }}>Véhicule loué</div>
            <div style={{ padding: "1rem 1.1rem", display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800 }}>{rental ? `${rental.vehicle.brand} ${rental.vehicle.model}` : "-"}</div>
                <div style={{ marginTop: 3, fontSize: "0.85rem", color: "#475569" }}>
                  {rental?.vehicle.registrationNumber || "Sans plaque"}{rental?.vehicle.color ? ` · ${rental.vehicle.color}` : ""}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.85rem", color: "#475569" }}>
                <div>Contrat de location</div>
                <div style={{ fontWeight: 700 }}>{note.lines[0]?.description || "-"}</div>
              </div>
            </div>
          </section>

          <section style={{ display: "grid", gap: 8, padding: "0.4rem 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span style={{ color: "#475569" }}>Montant de la location</span>
              <strong>{formatXof(total)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span style={{ color: "#475569" }}>Montant réglé</span>
              <strong style={{ color: "#0f766e" }}>{formatXof(paid)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "2px solid #13212b", fontSize: "1.1rem" }}>
              <strong>Reste à régler</strong>
              <strong style={{ color: balance > 0 ? "#b45309" : "#0f766e" }}>{formatXof(balance)}</strong>
            </div>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 6 }}>
            <div>
              <div style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: 32 }}>Le client</div>
              <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 6, fontSize: "0.78rem", color: "#64748b" }}>Nom et signature</div>
            </div>
            <div>
              <div style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: 32 }}>Le loueur</div>
              <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 6, fontSize: "0.78rem", color: "#64748b" }}>Nom et signature</div>
            </div>
          </section>

          <footer style={{ borderTop: "1px solid #e2e9ef", paddingTop: 12, fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>
            Ce document est une preuve de paiement remise au client. Il ne constitue pas une facture fiscale.
          </footer>
        </div>
      </article>
    </div>
  );
}
