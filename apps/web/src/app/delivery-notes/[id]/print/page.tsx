import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { ACTIVITY } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatXof, formatDate } from "@/lib/format";
import { getServerMessages } from "@/lib/i18n/server";
import { deliveryNotesCopy } from "@/lib/i18n/messages/delivery-notes";
import { PrintButton } from "@/components/PrintButton";

export default async function DeliveryNotePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["PDG", "SG", "DG", "ADV", "RF", "COMPTA", "COMPTA_GARAGE", "ADMIN"]);
  const { locale } = await getServerMessages();
  const copy = deliveryNotesCopy[locale];
  const { id } = await params;

  const note = await prisma.deliveryNote.findUnique({
    where: { id },
    include: {
      customer: true,
      lines: { include: { vehicle: true, partItem: true } },
    },
  });

  if (!note) notFound();
  if (user.role === "COMPTA_GARAGE" && note.activity !== ACTIVITY.GARAGE) notFound();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f8fb",
        color: "#122028",
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        className="no-print"
        style={{
          padding: "1rem",
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          background: "#0f1f2e",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Link href="/delivery-notes" className="ox-btn ox-btn-ghost" style={{ color: "#fff" }}>
          {copy.print.back}
        </Link>
        <PrintButton />
      </div>

      <article
        style={{
          maxWidth: 820,
          margin: "1.5rem auto 3rem",
          padding: "2.5rem 3rem",
          background: "#fff",
          border: "1px solid #c5d8e4",
          boxShadow: "0 8px 32px rgba(20,60,90,0.08)",
        }}
      >
        <div
          style={{
            border: "3px solid #b91c1c",
            background: "#fef2f2",
            color: "#991b1b",
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            textAlign: "center",
            fontWeight: 800,
            fontSize: "1rem",
            letterSpacing: "0.03em",
          }}
        >
          {copy.nonFiscalBanner}
        </div>

        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
            borderBottom: "2px solid #64748b",
            paddingBottom: "1.25rem",
          }}
        >
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element -- print-friendly static asset */}
            <img
              src="/brand/carzone-logo-print.png"
              alt="CARZONE SARL"
              width={75}
              height={75}
              style={{ display: "block", borderRadius: "50%", objectFit: "contain", marginBottom: 8 }}
            />
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>CARZONE SARL</div>
            <div style={{ fontSize: "0.82rem", opacity: 0.8, lineHeight: 1.4 }}>
              Zone Maro-Militaire, Gbèdomidji · Cotonou, Bénin
              <br />
              +229 01 92 61 61 61 · contact@topcarzone.com
              <br />
              IFU 3202496111617 · RCCM RB/ABC/24 B 38665
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#64748b" }}>{copy.print.docTitle}</div>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, marginTop: 4 }}>
              {copy.print.number} {note.number}
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.75, marginTop: 2 }}>
              {copy.print.activityLabel} : {note.activity === "GARAGE" ? copy.tabs.garage : copy.tabs.showroom}
            </div>
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "1.5rem",
            padding: "1rem 1.25rem",
            background: "#f8fafc",
            borderRadius: 6,
            border: "1px solid #e2e8f0",
          }}
        >
          <div>
            <div style={{ fontSize: "0.78rem", textTransform: "uppercase", opacity: 0.6, fontWeight: 700 }}>
              {copy.print.customer}
            </div>
            <div style={{ fontWeight: 700 }}>
              {note.customer ? note.customer.companyName || note.customer.contactName : "-"}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "0.85rem" }}>
            <strong>{copy.print.date}</strong> {formatDate(note.createdAt)}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem" }}>
          <thead>
            <tr style={{ background: "#eef5f9" }}>
              <th style={{ textAlign: "left", padding: "0.7rem 0.6rem", borderBottom: "2px solid #64748b", fontSize: "0.85rem" }}>
                {copy.print.columns.designation}
              </th>
              <th style={{ textAlign: "center", padding: "0.7rem 0.6rem", borderBottom: "2px solid #64748b", fontSize: "0.85rem", width: "15%" }}>
                {copy.print.columns.quantity}
              </th>
              <th style={{ textAlign: "right", padding: "0.7rem 0.6rem", borderBottom: "2px solid #64748b", fontSize: "0.85rem", width: "25%" }}>
                {copy.print.columns.unitPrice}
              </th>
            </tr>
          </thead>
          <tbody>
            {note.lines.map((l) => (
              <tr key={l.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "0.7rem 0.6rem", fontSize: "0.9rem" }}>
                  <div style={{ fontWeight: 600 }}>{l.description}</div>
                  {l.vehicle && (
                    <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                      VIN {l.vehicle.vin || "non assigné"} · {l.vehicle.brand} {l.vehicle.model}
                    </div>
                  )}
                  {l.partItem && (
                    <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Réf. {l.partItem.partNumber}</div>
                  )}
                </td>
                <td style={{ padding: "0.7rem 0.6rem", textAlign: "center" }}>{l.quantity}</td>
                <td style={{ padding: "0.7rem 0.6rem", textAlign: "right" }}>
                  {l.unitPriceXof != null ? formatXof(l.unitPriceXof) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            border: "1px dashed #94a3b8",
            borderRadius: 6,
            padding: "0.85rem 1.1rem",
            marginBottom: "2rem",
            fontSize: "0.85rem",
            color: "#334155",
            textAlign: "center",
          }}
        >
          {copy.print.legalNotice}
        </div>

        {note.status === "ANNULE" && (
          <div
            style={{
              border: "2px solid #b91c1c",
              background: "#fef2f2",
              color: "#991b1b",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              borderRadius: 6,
              fontSize: "0.85rem",
            }}
          >
            <strong>ANNULÉ</strong> le {formatDate(note.cancelledAt)} par {note.cancelledByName} - motif : {note.cancelReason}
          </div>
        )}

        <footer
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginTop: "2.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #e2e8f0",
            fontSize: "0.85rem",
          }}
        >
          <div>
            <strong>{copy.print.signatures.issuedBy}</strong>
            <div style={{ marginTop: 4 }}>{note.createdByName}</div>
            <div style={{ height: 50 }} />
          </div>
          <div style={{ textAlign: "right" }}>
            <strong>{copy.print.signatures.receivedBy}</strong>
            <div style={{ height: 50 }} />
          </div>
        </footer>
      </article>
    </div>
  );
}
