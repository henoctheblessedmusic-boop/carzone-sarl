import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { Badge, Card } from "@/components/ui";
import { BrandModelSelect } from "@/components/BrandModelSelect";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof, formatDate } from "@/lib/format";
import {
  Zap,
  Wrench,
  CheckCircle,
  Send,
  Award,
} from "lucide-react";

async function createRequest(formData: FormData) {
  "use server";
  await requireUser(["DG", "BORNES_OPS", "COMMERCIAL"]);
  const customerId = String(formData.get("customerId"));
  const installers = await prisma.installer.findMany({ where: { active: true } });
  await prisma.chargeInstallRequest.create({
    data: {
      customerId,
      address: String(formData.get("address") || ""),
      city: String(formData.get("city") || "Cotonou"),
      powerKw: Number(formData.get("powerKw") || 0) || null,
      vehicleBrand: String(formData.get("brand") || formData.get("vehicleBrand") || "") || null,
      vehicleModel: String(formData.get("model") || formData.get("vehicleModel") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      status: "ENVOYEE_INSTALLATEURS",
      installerQuotes: {
        create: installers.map((i) => ({ installerId: i.id, status: "EN_ATTENTE" })),
      },
    },
  });
  revalidatePath("/charge-requests");
}

async function submitInstallerQuote(formData: FormData) {
  "use server";
  const user = await requireUser(["DG", "BORNES_OPS", "INSTALLATEUR"]);
  const quoteId = String(formData.get("quoteId"));
  const amountXof = Number(formData.get("amountXof") || 0);
  const leadDays = Number(formData.get("leadDays") || 7);
  const quote = await prisma.installerQuote.findUniqueOrThrow({
    where: { id: quoteId },
    include: { installer: { include: { users: true } } },
  });
  if (user.role === "INSTALLATEUR" && user.id) {
    const me = await prisma.user.findUnique({ where: { id: user.id } });
    if (me?.installerId !== quote.installerId) throw new Error("FORBIDDEN");
  }
  await prisma.installerQuote.update({
    where: { id: quoteId },
    data: {
      amountXof,
      leadDays,
      status: "SOUMIS",
      submittedAt: new Date(),
      notes: String(formData.get("notes") || "") || null,
    },
  });
  await prisma.chargeInstallRequest.update({
    where: { id: quote.requestId },
    data: { status: "DEVIS_RECUS" },
  });
  revalidatePath("/charge-requests");
}

async function chooseQuote(formData: FormData) {
  "use server";
  await requireUser(["DG", "BORNES_OPS", "COMMERCIAL"]);
  const quoteId = String(formData.get("quoteId"));
  const quote = await prisma.installerQuote.findUniqueOrThrow({ where: { id: quoteId } });
  await prisma.installerQuote.updateMany({
    where: { requestId: quote.requestId },
    data: { status: "REFUSE" },
  });
  await prisma.installerQuote.update({ where: { id: quoteId }, data: { status: "ACCEPTE" } });
  await prisma.chargeInstallRequest.update({
    where: { id: quote.requestId },
    data: { status: "CHOISI" },
  });
  revalidatePath("/charge-requests");
}

export default async function ChargeRequestsPage() {
  const user = await requireUser(["DG", "BORNES_OPS", "COMMERCIAL", "INSTALLATEUR"]);
  const me = await prisma.user.findUnique({ where: { id: user.id } });

  const [requests, customers, brands] = await Promise.all([
    prisma.chargeInstallRequest.findMany({
      include: {
        customer: true,
        installerQuotes: {
          include: { installer: true },
          orderBy: [{ status: "desc" }, { amountXof: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({ orderBy: { contactName: "asc" } }),
    prisma.vehicleBrand.findMany({
      where: { active: true },
      include: { models: { where: { active: true }, orderBy: { name: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const catalog = brands.map((b) => ({
    id: b.id,
    name: b.name,
    models: b.models.map((m) => ({
      id: m.id,
      name: m.name,
      energy: m.energy,
      vehicleType: m.vehicleType,
    })),
  }));

  const visibleRequests = requests
    .map((r) => ({
      ...r,
      installerQuotes:
        user.role === "INSTALLATEUR" && me?.installerId
          ? r.installerQuotes.filter((q) => q.installerId === me.installerId)
          : r.installerQuotes,
    }))
    .filter((r) => user.role !== "INSTALLATEUR" || r.installerQuotes.length > 0);

  // KPIs
  const totalRequests = requests.length;
  const pendingQuotes = requests.filter((r) => r.status === "ENVOYEE_INSTALLATEURS").length;
  const quotesReceived = requests.filter((r) => r.status === "DEVIS_RECUS").length;
  const assignedProjects = requests.filter((r) => r.status === "CHOISI").length;

  return (
    <AppShell user={user} titleKey="chargeRequests">
      {/* Top KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          className="ox-glass"
          style={{ padding: "1.1rem", borderRadius: 12, borderLeft: "4px solid var(--ice)" }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Total Demandes Bornes
          </div>
          <div className="ox-metric-val" style={{ fontSize: "1.6rem", marginTop: 4 }}>
            {totalRequests}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--ice-text-muted)", marginTop: 2 }}>
            Showroom &amp; Clients Particuliers/Pro
          </div>
        </div>

        <div
          className="ox-glass"
          style={{ padding: "1.1rem", borderRadius: 12, borderLeft: "4px solid #f59e0b" }}
        >
          <div style={{ fontSize: "0.8rem", opacity: 0.7, textTransform: "uppercase" }}>
            En Appel d&apos;Offres
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f59e0b", marginTop: 4 }}>
            {pendingQuotes}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: 2 }}>
            En attente des chiffrages électriciens
          </div>
        </div>

        <div
          className="ox-glass"
          style={{ padding: "1.1rem", borderRadius: 12, borderLeft: "4px solid #38bdf8" }}
        >
          <div style={{ fontSize: "0.8rem", opacity: 0.7, textTransform: "uppercase" }}>
            Devis Reçus à Arbitrer
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#38bdf8", marginTop: 4 }}>
            {quotesReceived}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: 2 }}>
            Mise en concurrence disponible
          </div>
        </div>

        <div
          className="ox-glass"
          style={{ padding: "1.1rem", borderRadius: 12, borderLeft: "4px solid #10b981" }}
        >
          <div style={{ fontSize: "0.8rem", opacity: 0.7, textTransform: "uppercase" }}>
            Chantiers Attribués
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#10b981", marginTop: 4 }}>
            {assignedProjects}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: 2 }}>
            Installateur retenu &amp; travaux engagés
          </div>
        </div>
      </div>

      {/* Formulaire de nouvelle demande */}
      {user.role !== "INSTALLATEUR" && (
        <form
          action={createRequest}
          className="ox-glass"
          style={{
            padding: "1.25rem 1.5rem",
            marginBottom: "1.5rem",
            borderRadius: 14,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            border: "1px solid rgba(197, 216, 228, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gold)" }}>
            <Zap size={20} />
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
              Lancer un Appel d&apos;Offres Installation Borne (Panel Agréé CARZONE SARL)
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
            <select name="customerId" required className="ox-select" defaultValue="" title="Client">
              <option value="" disabled>
                Sélectionner le Client *
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.contactName} {c.companyName ? `(${c.companyName})` : ""} {c.phone ? `· ${c.phone}` : ""}
                </option>
              ))}
            </select>

            <input
              name="address"
              placeholder="Adresse d'installation (ex: Cité Houéyiho, Lot 14) *"
              required
              className="ox-input"
            />

            <input
              name="city"
              placeholder="Ville"
              defaultValue="Cotonou"
              className="ox-input"
            />

            <select name="powerKw" className="ox-select" defaultValue="7.4">
              <option value="7.4">Borne 7.4 kW (Monophasé 32A)</option>
              <option value="11">Borne 11 kW (Triphasé 16A)</option>
              <option value="22">Borne 22 kW (Triphasé 32A)</option>
              <option value="50">Borne Rapide DC 50 kW</option>
            </select>
          </div>

          <BrandModelSelect brands={catalog} required={false} brandName="brand" modelName="model" />

          <div>
            <input
              name="notes"
              placeholder="Précisions chantier (ex: distance disjoncteur 15m, passage de câble en goulotte extérieure...)"
              className="ox-input"
              style={{ width: "100%", fontSize: "0.85rem" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="ox-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(135deg, var(--gold) 0%, #b89130 100%)",
                color: "#0a1622",
                fontWeight: 700,
                padding: "0.65rem 1.25rem",
              }}
            >
              <Send size={16} />
              Diffuser la demande au Panel Installateurs
            </button>
          </div>
        </form>
      )}

      {/* Liste des Demandes et Comparateur Côte-à-Côte */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {visibleRequests.map((r) => {
          return (
            <Card key={r.id}>
              {/* Entête demande */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingBottom: "1rem",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--ice-text-strong)" }}>
                      {r.customer.contactName}
                      {r.customer.companyName && (
                        <span style={{ fontSize: "0.9rem", opacity: 0.7, fontWeight: 400 }}>
                          {" "}— {r.customer.companyName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: 4, display: "flex", flexWrap: "wrap", gap: 12 }}>
                    <span>📍 {r.address}, {r.city}</span>
                    <span>⚡ Puissance demandée : <strong>{r.powerKw ? `${r.powerKw} kW` : "7.4 kW"}</strong></span>
                    {r.vehicleBrand && (
                      <span>🚗 Véhicule : {r.vehicleBrand} {r.vehicleModel || ""}</span>
                    )}
                    <span>📅 Créée le : {formatDate(r.createdAt)}</span>
                  </div>

                  {r.notes && (
                    <div style={{ fontSize: "0.8rem", opacity: 0.7, fontStyle: "italic", marginTop: 4 }}>
                      Note : {r.notes}
                    </div>
                  )}
                </div>

                <Badge tone={r.status === "CHOISI" ? "ok" : r.status === "DEVIS_RECUS" ? "ice" : "warn"}>
                  {r.status === "CHOISI"
                    ? "Installateur Retenu"
                    : r.status === "DEVIS_RECUS"
                      ? "Devis à Comparer"
                      : "En Attente de Devis"}
                </Badge>
              </div>

              {/* Comparatif des devis installateurs */}
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 650, color: "var(--ice)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Wrench size={16} />
                  Mise en Concurrence des Installateurs Partenaires ({r.installerQuotes.length} consultés) :
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {r.installerQuotes.map((q) => {
                    const isSelected = q.status === "ACCEPTE";
                    const isRejected = q.status === "REFUSE";
                    const isSubmitted = q.status === "SOUMIS";

                    return (
                      <div
                        key={q.id}
                        style={{
                          background: isSelected
                            ? "rgba(16, 185, 129, 0.1)"
                            : isRejected
                              ? "rgba(239, 68, 68, 0.05)"
                              : "rgba(255, 255, 255, 0.03)",
                          border: isSelected
                            ? "2px solid #10b981"
                            : isRejected
                              ? "1px solid rgba(239, 68, 68, 0.2)"
                              : "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: 12,
                          padding: "1.1rem",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: 12,
                          position: "relative",
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              position: "absolute",
                              top: -10,
                              right: 12,
                              background: "#10b981",
                              color: "#fff",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              padding: "0.2rem 0.6rem",
                              borderRadius: 20,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Award size={12} />
                            OFFRE RETENUE
                          </div>
                        )}

                        <div>
                          <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--ice-text-strong)" }}>
                            {q.installer.companyName}
                          </div>
                          <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: 2 }}>
                            {q.installer.contactName} · {q.installer.city || "Cotonou"}
                          </div>

                          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                              <span style={{ opacity: 0.7 }}>Montant Chiffré :</span>
                              <strong style={{ fontSize: "1.05rem", color: q.amountXof ? "#10b981" : "inherit" }}>
                                {q.amountXof != null ? formatXof(q.amountXof) : "En attente..."}
                              </strong>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                              <span style={{ opacity: 0.7 }}>Délai d&apos;exécution :</span>
                              <span>{q.leadDays != null ? `${q.leadDays} jours ouvrés` : "—"}</span>
                            </div>

                            {q.notes && (
                              <div style={{ fontSize: "0.78rem", opacity: 0.7, fontStyle: "italic", marginTop: 4 }}>
                                &ldquo;{q.notes}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions selon le rôle */}
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
                          {/* Cas 1 : L'installateur saisit son devis */}
                          {q.status === "EN_ATTENTE" && (user.role === "INSTALLATEUR" || user.role === "DG" || user.role === "BORNES_OPS") ? (
                            <form action={submitInstallerQuote} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <input type="hidden" name="quoteId" value={q.id} />
                              <div style={{ display: "flex", gap: 6 }}>
                                <input
                                  name="amountXof"
                                  type="number"
                                  placeholder="Montant XOF *"
                                  required
                                  className="ox-input"
                                  style={{ flex: 1, fontSize: "0.85rem" }}
                                />
                                <input
                                  name="leadDays"
                                  type="number"
                                  placeholder="Délai (j)"
                                  defaultValue={7}
                                  className="ox-input"
                                  style={{ width: 80, fontSize: "0.85rem" }}
                                />
                              </div>
                              <input
                                name="notes"
                                placeholder="Matériel inclus / spécificités"
                                className="ox-input"
                                style={{ width: "100%", fontSize: "0.8rem" }}
                              />
                              <button
                                type="submit"
                                className="ox-btn ox-btn-sm"
                                style={{
                                  background: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
                                  fontWeight: 650,
                                }}
                              >
                                Soumettre l&apos;offre chiffrée
                              </button>
                            </form>
                          ) : isSubmitted && user.role !== "INSTALLATEUR" ? (
                            /* Cas 2 : La direction/bornes ops arbitre et choisit le meilleur devis */
                            <form action={chooseQuote}>
                              <input type="hidden" name="quoteId" value={q.id} />
                              <button
                                type="submit"
                                className="ox-btn"
                                style={{
                                  width: "100%",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 6,
                                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                  fontWeight: 700,
                                  padding: "0.6rem",
                                  fontSize: "0.88rem",
                                }}
                              >
                                <CheckCircle size={15} />
                                Retenir cet installateur
                              </button>
                            </form>
                          ) : (
                            <div style={{ textAlign: "center", fontSize: "0.78rem", opacity: 0.65 }}>
                              {isSelected ? (
                                <span style={{ color: "#10b981", fontWeight: 700 }}>Chantier confié</span>
                              ) : isRejected ? (
                                <span style={{ color: "#ef4444" }}>Offre non retenue</span>
                              ) : (
                                "Devis en cours de rédaction"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
