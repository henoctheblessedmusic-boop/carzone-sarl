import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Receipt,
  Car,
  Zap,
  FolderCheck,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, DataTable } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof } from "@/lib/format";
import { getServerMessages } from "@/lib/i18n/server";
import { clientsCopy } from "@/lib/i18n/messages/clients";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { locale } = await getServerMessages();
  const copy = clientsCopy[locale];
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      documents: {
        orderBy: { uploadedAt: "desc" },
      },
      quotes: {
        orderBy: { createdAt: "desc" },
        include: { lines: true, invoice: true },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        include: { payments: true, quote: true },
      },
      opportunities: {
        orderBy: { createdAt: "desc" },
        include: { vehicle: true, owner: true, testDrives: true },
      },
      rentals: {
        orderBy: { createdAt: "desc" },
        include: { vehicle: true },
      },
      fleetVehicles: {
        include: { vehicle: true, fleetAccount: true },
      },
      installRequests: {
        orderBy: { createdAt: "desc" },
        include: { installerQuotes: { include: { installer: true } } },
      },
      subscriptions: {
        orderBy: { createdAt: "desc" },
        include: { plan: true },
      },
      chargingInvoices: {
        orderBy: { createdAt: "desc" },
        include: { session: { include: { station: true } } },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  // Financial aggregates
  const totalInvoicedXof = customer.invoices.reduce((s, inv) => s + inv.totalXof, 0);
  const totalPaidXof = customer.invoices.reduce((s, inv) => s + inv.paidXof, 0);
  const remainingDueXof = totalInvoicedXof - totalPaidXof;

  const activeSub = customer.subscriptions.find((s) => s.active);

  const initials = customer.contactName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AppShell user={user} title={copy.detail.pageTitle(customer.contactName)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Top Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link
            href="/clients"
            className="ox-btn ox-btn-ghost"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.88rem" }}
          >
            <ArrowLeft size={16} />
            {copy.detail.backToList}
          </Link>
          <div style={{ display: "flex", gap: 8 }}>
            <span
              className={`ox-badge ox-badge--${customer.active ? "ok" : "bad"}`}
              style={{ fontSize: "0.85rem", padding: "0.3rem 0.8rem" }}
            >
              {customer.active ? copy.detail.accountActive : copy.detail.accountInactive}
            </span>
          </div>
        </div>

        {/* Customer Header Card */}
        <div
          className="ox-glass"
          style={{
            padding: "1.5rem 1.75rem",
            borderRadius: 20,
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--brand), var(--brand-deep))",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: "1.3rem",
                fontWeight: 750,
                boxShadow: "0 8px 24px rgba(0, 120, 212, 0.35)",
              }}
            >
              {initials}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
                  {customer.contactName}
                </h2>
                {customer.companyName && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "0.2rem 0.6rem",
                      borderRadius: 8,
                      background: "rgba(196, 163, 90, 0.15)",
                      color: "var(--gold)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                    }}
                  >
                    <Building2 size={13} />
                    {customer.companyName}
                  </span>
                )}
                {customer.ifu && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "0.2rem 0.6rem",
                      borderRadius: 8,
                      background: "rgba(0, 120, 212, 0.15)",
                      color: "var(--ice-highlight)",
                      fontSize: "0.82rem",
                      fontWeight: 650,
                      border: "1px solid rgba(0, 120, 212, 0.3)",
                    }}
                  >
                    {copy.detail.ifuPrefix}{customer.ifu}
                  </span>
                )}
                <span
                  className="ox-badge"
                  style={{
                    background: "rgba(126, 200, 227, 0.12)",
                    color: "var(--ice-highlight)",
                    fontSize: "0.8rem",
                  }}
                >
                  {customer.category ? copy.categoryLabel(customer.category) : copy.category.individual}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 16,
                  marginTop: 8,
                  fontSize: "0.88rem",
                  opacity: 0.85,
                }}
              >
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--ice-text)" }}
                  >
                    <Mail size={14} style={{ opacity: 0.6 }} />
                    {customer.email}
                  </a>
                )}
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--ice-text)" }}
                  >
                    <Phone size={14} style={{ opacity: 0.6 }} />
                    {customer.phone}
                  </a>
                )}
                {customer.address && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={14} style={{ opacity: 0.6 }} />
                    {customer.address}
                  </span>
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <MapPin size={14} style={{ opacity: 0.6 }} />
                  {customer.city || "Cotonou"}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, opacity: 0.65 }}>
                  <Calendar size={14} />
                  {copy.detail.clientSince(copy.formatDate(customer.createdAt))}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/quotes" className="ox-btn ox-btn-ghost ox-btn-sm">
              <FileText size={14} style={{ marginRight: 5 }} />
              {copy.detail.quickNewQuote}
            </Link>
            <Link href="/clients" className="ox-btn ox-btn-ghost ox-btn-sm">
              <FolderCheck size={14} style={{ marginRight: 5 }} />
              {copy.detail.quickDocuments}
            </Link>
            <Link href="/charge-requests" className="ox-btn ox-btn-ghost ox-btn-sm">
              <Zap size={14} style={{ marginRight: 5 }} />
              {copy.detail.quickChargeRequest}
            </Link>
          </div>
        </div>

        {/* Visite & Récapitulatif Showroom */}
        {customer.showroomNotes && (
          <div
            className="ox-glass"
            style={{
              padding: "1rem 1.25rem",
              borderRadius: 16,
              background: "rgba(212, 175, 55, 0.08)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <span style={{ fontSize: "1.2rem", marginTop: 2 }}>🏷️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--gold)" }}>
                {copy.detail.showroomNotesTitle}
              </div>
              <div style={{ fontSize: "0.88rem", opacity: 0.9, marginTop: 4, lineHeight: 1.5 }}>
                {customer.showroomNotes}
              </div>
            </div>
          </div>
        )}

        {/* Financial & Operational KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
          }}
        >
          <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
            <span style={{ fontSize: "0.82rem", opacity: 0.7, fontWeight: 550 }}>
              {copy.detail.kpi.totalInvoiced}
            </span>
            <div style={{ fontSize: "1.55rem", fontWeight: 750, marginTop: 4 }}>
              {formatXof(totalInvoicedXof)}
            </div>
            <div style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: 2 }}>
              {copy.detail.kpi.invoicesIssued(customer.invoices.length)}
            </div>
          </div>

          <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
            <span style={{ fontSize: "0.82rem", opacity: 0.7, fontWeight: 550 }}>
              {copy.detail.kpi.totalCollected}
            </span>
            <div style={{ fontSize: "1.55rem", fontWeight: 750, marginTop: 4, color: "var(--ok)" }}>
              {formatXof(totalPaidXof)}
            </div>
            <div style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: 2 }}>
              {copy.detail.kpi.paymentsReceived}
            </div>
          </div>

          <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
            <span style={{ fontSize: "0.82rem", opacity: 0.7, fontWeight: 550 }}>
              {copy.detail.kpi.remainingDue}
            </span>
            <div
              style={{
                fontSize: "1.55rem",
                fontWeight: 750,
                marginTop: 4,
                color: remainingDueXof > 0 ? "var(--bad)" : "var(--ok)",
              }}
            >
              {formatXof(remainingDueXof)}
            </div>
            <div style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: 2 }}>
              {copy.detail.kpi.remainingDueHint(remainingDueXof > 0)}
            </div>
          </div>

          <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
            <span style={{ fontSize: "0.82rem", opacity: 0.7, fontWeight: 550 }}>
              {copy.detail.kpi.chargingPlan}
            </span>
            <div style={{ fontSize: "1.2rem", fontWeight: 750, marginTop: 6, color: "var(--brand)" }}>
              {activeSub ? activeSub.plan.name : copy.detail.kpi.noPlan}
            </div>
            <div style={{ fontSize: "0.78rem", opacity: 0.65, marginTop: 2 }}>
              {activeSub ? `${formatXof(activeSub.plan.kwhPriceXof)}/kWh` : "125 XOF/kWh"}
            </div>
          </div>
        </div>

        {/* Section 1: Factures & Règlements */}
        <div className="ox-glass" style={{ padding: "1.25rem 1.5rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <Receipt size={18} style={{ color: "var(--brand)" }} />
              {copy.detail.invoices.title(customer.invoices.length)}
            </h3>
            <Link href="/invoices" className="ox-btn ox-btn-ghost ox-btn-sm">
              {copy.detail.invoices.viewAll}
            </Link>
          </div>

          {customer.invoices.length === 0 ? (
            <p style={{ opacity: 0.6, fontSize: "0.9rem", margin: "1rem 0" }}>
              {copy.detail.invoices.empty}
            </p>
          ) : (
            <DataTable
              headers={copy.detail.invoices.headers}
              rows={customer.invoices.map((inv) => {
                const bal = inv.totalXof - inv.paidXof;
                return [
                  <strong key={`inv-num-${inv.id}`}>{inv.number}</strong>,
                  copy.invoiceKindLabel(inv.kind),
                  copy.formatDate(inv.dueDate),
                  formatXof(inv.totalXof),
                  <span key={`p-${inv.id}`} style={{ color: "var(--ok)", fontWeight: 600 }}>
                    {formatXof(inv.paidXof)}
                  </span>,
                  <span
                    key={`b-${inv.id}`}
                    style={{ color: bal > 0 ? "var(--bad)" : "inherit", fontWeight: bal > 0 ? 600 : 400 }}
                  >
                    {formatXof(bal)}
                  </span>,
                  <Badge
                    key={`s-${inv.id}`}
                    tone={inv.status === "PAYEE" ? "ok" : inv.status === "EN_RETARD" ? "bad" : "warn"}
                  >
                    {copy.statusLabel(inv.status)}
                  </Badge>,
                  <span key={`pay-${inv.id}`} style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                    {copy.detail.invoices.payments(inv.payments.length)}
                  </span>,
                ];
              })}
            />
          )}
        </div>

        {/* Section 2: Devis & Proformas */}
        <div className="ox-glass" style={{ padding: "1.25rem 1.5rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={18} style={{ color: "var(--ice-highlight)" }} />
              {copy.detail.quotes.title(customer.quotes.length)}
            </h3>
            <Link href="/quotes" className="ox-btn ox-btn-ghost ox-btn-sm">
              {copy.detail.quotes.manage}
            </Link>
          </div>

          {customer.quotes.length === 0 ? (
            <p style={{ opacity: 0.6, fontSize: "0.9rem", margin: "1rem 0" }}>
              {copy.detail.quotes.empty}
            </p>
          ) : (
            <DataTable
              headers={copy.detail.quotes.headers}
              rows={customer.quotes.map((q) => [
                <strong key={`q-num-${q.id}`}>{q.number}</strong>,
                copy.formatDate(q.createdAt),
                <div key={`lines-${q.id}`}>
                  {q.lines.map((l, idx) => (
                    <div key={idx} style={{ fontSize: "0.85rem" }}>
                      {l.quantity}x {l.description}
                    </div>
                  ))}
                </div>,
                <strong key={`q-tot-${q.id}`}>{formatXof(q.totalXof)}</strong>,
                copy.formatDate(q.validUntil),
                <Badge
                  key={`qs-${q.id}`}
                  tone={
                    q.status === "FACTURE_NORMALISEE" || q.status === "COMMANDE_CONFIRMEE"
                      ? "ok"
                      : q.status === "ANNULEE_INTERNE"
                      ? "bad"
                      : "ice"
                  }
                >
                  {copy.statusLabel(q.status)}
                </Badge>,
                <Link
                  key={`print-${q.id}`}
                  href={`/quotes/${q.id}/print`}
                  target="_blank"
                  className="ox-btn ox-btn-ghost ox-btn-sm"
                >
                  {copy.detail.quotes.print}
                </Link>,
              ])}
            />
          )}
        </div>

        {/* Section 3: Dossier Documents & Immatriculation (ANaTT) */}
        <div className="ox-glass" style={{ padding: "1.25rem 1.5rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <FolderCheck size={18} style={{ color: "var(--gold)" }} />
              {copy.detail.documents.title(customer.documents.length)}
            </h3>
            <Link href="/clients" className="ox-btn ox-btn-ghost ox-btn-sm">
              {copy.detail.documents.add}
            </Link>
          </div>

          {customer.documents.length === 0 ? (
            <p style={{ opacity: 0.6, fontSize: "0.9rem", margin: "1rem 0" }}>
              {copy.detail.documents.empty}
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {customer.documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    padding: "0.85rem 1rem",
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--ice-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 650, fontSize: "0.9rem" }}>{doc.title}</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: 2 }}>
                      {copy.docTypeLabel(doc.docType)} · {doc.fileName}
                    </div>
                    <div style={{ fontSize: "0.72rem", opacity: 0.5, marginTop: 1 }}>
                      {copy.detail.documents.addedOn(copy.formatDate(doc.uploadedAt))}
                    </div>
                    {doc.notes && (
                      <div style={{ fontSize: "0.74rem", color: "var(--gold)", marginTop: 3 }}>
                        {doc.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <Badge tone={doc.status === "TRANSMIS_ANATT" ? "ok" : "ice"}>
                      {doc.status === "TRANSMIS_ANATT" ? copy.documentStatus.transmitted : copy.documentStatus.validated}
                    </Badge>
                    <a
                      href={doc.fileUrl}
                      download={doc.fileName}
                      target="_blank"
                      rel="noreferrer"
                      className="ox-btn ox-btn-ghost ox-btn-sm"
                      style={{ padding: "0.25rem 0.55rem", fontSize: "0.75rem" }}
                    >
                      {copy.detail.documents.download}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Écosystème Bornes de Recharge */}
        <div className="ox-glass" style={{ padding: "1.25rem 1.5rem", borderRadius: 16 }}>
          <h3 style={{ margin: "0 0 14px 0", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={18} style={{ color: "var(--ok)" }} />
            {copy.detail.charging.title}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Demandes d'installation bornes */}
            <div>
              <h4 style={{ fontSize: "0.95rem", margin: "0 0 8px 0", opacity: 0.85 }}>
                {copy.detail.charging.installTitle(customer.installRequests.length)}
              </h4>
              {customer.installRequests.length === 0 ? (
                <p style={{ opacity: 0.55, fontSize: "0.85rem" }}>{copy.detail.charging.installEmpty}</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {customer.installRequests.map((req) => (
                    <div
                      key={req.id}
                      style={{
                        padding: "0.8rem",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--ice-border)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong>{req.address} ({req.city})</strong>
                        <Badge tone={req.status === "TERMINEE" ? "ok" : "warn"}>{copy.statusLabel(req.status)}</Badge>
                      </div>
                      <div style={{ fontSize: "0.82rem", opacity: 0.7, marginTop: 4 }}>
                        {copy.detail.charging.powerLabel}
                        {req.powerKw ? `${req.powerKw} kW` : copy.detail.notAvailable} ·{" "}
                        {copy.detail.charging.vehicleLabel}
                        {req.vehicleBrand} {req.vehicleModel}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--ice-highlight)", marginTop: 6 }}>
                        {copy.detail.charging.installerQuotes(req.installerQuotes.length)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sessions de recharge publiques */}
            <div>
              <h4 style={{ fontSize: "0.95rem", margin: "0 0 8px 0", opacity: 0.85 }}>
                {copy.detail.charging.historyTitle(customer.chargingInvoices.length)}
              </h4>
              {customer.chargingInvoices.length === 0 ? (
                <p style={{ opacity: 0.55, fontSize: "0.85rem" }}>{copy.detail.charging.historyEmpty}</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {customer.chargingInvoices.slice(0, 5).map((ci) => (
                    <div
                      key={ci.id}
                      style={{
                        padding: "0.7rem 0.8rem",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.02)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{ci.session.station.name}</div>
                        <div style={{ fontSize: "0.78rem", opacity: 0.6 }}>
                          {copy.detail.charging.kwhLine(ci.session.kwhDelivered, ci.session.pricePerKwh)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "var(--brand)" }}>{formatXof(ci.totalXof)}</div>
                        <Badge tone="ok">{copy.statusLabel(ci.status)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Véhicules & Contrats (Flotte & Location) */}
        {(customer.rentals.length > 0 || customer.fleetVehicles.length > 0) && (
          <div className="ox-glass" style={{ padding: "1.25rem 1.5rem", borderRadius: 16 }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <Car size={18} style={{ color: "var(--gold)" }} />
              {copy.detail.vehicles.title}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {customer.rentals.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: "0.9rem",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--ice-border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{copy.detail.vehicles.contract(copy.rentalTypeLabel(r.type))}</strong>
                    <Badge tone={r.status === "ACTIF" ? "ok" : "neutral"}>{copy.statusLabel(r.status)}</Badge>
                  </div>
                  <div style={{ marginTop: 6, fontWeight: 600 }}>
                    {r.vehicle.brand} {r.vehicle.model} ({r.vehicle.vin || copy.detail.vehicles.noVin})
                  </div>
                  <div style={{ fontSize: "0.82rem", opacity: 0.7, marginTop: 4 }}>
                    {copy.detail.vehicles.rent(r.monthlyXof ? formatXof(r.monthlyXof) : null)} ·{" "}
                    {copy.detail.vehicles.period(
                      copy.formatDate(r.startDate),
                      copy.formatDate(r.endDate)
                    )}
                  </div>
                </div>
              ))}

              {customer.fleetVehicles.map((fv) => (
                <div
                  key={fv.id}
                  style={{
                    padding: "0.9rem",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--ice-border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{copy.detail.vehicles.fleet(fv.fleetAccount.name)}</strong>
                    <Badge tone={fv.active ? "ok" : "bad"}>{fv.active ? copy.status.active : copy.status.inactive}</Badge>
                  </div>
                  <div style={{ marginTop: 6, fontWeight: 600 }}>
                    {fv.vehicle ? `${fv.vehicle.brand} ${fv.vehicle.model}` : copy.detail.vehicles.fleetVehicle}
                  </div>
                  <div style={{ fontSize: "0.82rem", opacity: 0.7, marginTop: 4 }}>
                    {copy.detail.vehicles.plateLabel}
                    {fv.plateNumber || copy.detail.notAvailable} ·{" "}
                    {copy.detail.vehicles.driverLabel}
                    {fv.driverName || copy.detail.notAvailable}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
