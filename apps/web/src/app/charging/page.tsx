import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { Badge, DataTable, PrimaryLink, Stat } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof, formatDate } from "@/lib/format";

async function subscribe(formData: FormData) {
  "use server";
  await requireUser(["DG", "BORNES_OPS", "COMPTA"]);
  const customerId = String(formData.get("customerId"));
  const planId = String(formData.get("planId"));
  await prisma.chargingSubscription.updateMany({
    where: { customerId, active: true },
    data: { active: false, endsAt: new Date() },
  });
  await prisma.chargingSubscription.create({
    data: { customerId, planId, active: true },
  });
  revalidatePath("/charging");
}

export default async function ChargingPage() {
  const user = await requireUser(["DG", "BORNES_OPS", "COMPTA"]);
  const [plans, subs, stations, invoices, customers] = await Promise.all([
    prisma.chargingPlan.findMany({ orderBy: { kwhPriceXof: "asc" } }),
    prisma.chargingSubscription.findMany({
      where: { active: true },
      include: { customer: true, plan: true },
    }),
    prisma.chargingStation.findMany({ include: { site: true } }),
    prisma.chargingInvoice.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { customer: true, session: true },
    }),
    prisma.customer.findMany({ orderBy: { contactName: "asc" } }),
  ]);

  return (
    <AppShell user={user} titleKey="charging">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
        <Stat label="Plans" value={plans.length} />
        <Stat label="Abonnés actifs" value={subs.length} />
        <Stat label="Bornes" value={stations.length} />
        <Stat label="Factures recharge" value={invoices.length} />
      </div>

      <h2 style={{ fontSize: "1.05rem" }}>Plans tarifaires (kWh)</h2>
      <DataTable
        headers={["Plan", "Mensualité", "Prix kWh", "Public", "Actif"]}
        rows={plans.map((p) => [
          <div key={p.id}>
            <strong>{p.name}</strong>
            <div style={{ opacity: 0.65, fontSize: "0.8rem" }}>{p.description}</div>
          </div>,
          formatXof(p.monthlyFeeXof),
          formatXof(p.kwhPriceXof),
          formatXof(p.publicKwhPriceXof),
          <Badge key={`b-${p.id}`} tone={p.active ? "ok" : "bad"}>{p.active ? "Oui" : "Non"}</Badge>,
        ])}
      />

      <h2 style={{ fontSize: "1.05rem", marginTop: 24 }}>Souscrire un client</h2>
      <form action={subscribe} style={formRow}>
        <select name="customerId" required style={input} defaultValue="">
          <option value="" disabled>Client</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.contactName}</option>)}
        </select>
        <select name="planId" required style={input} defaultValue="">
          <option value="" disabled>Plan</option>
          {plans.filter((p) => p.active).map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {formatXof(p.kwhPriceXof)}/kWh</option>
          ))}
        </select>
        <button type="submit" style={btn}>Activer abonnement</button>
      </form>

      <h2 style={{ fontSize: "1.05rem", marginTop: 8 }}>Abonnés</h2>
      <DataTable
        headers={["Client", "Plan", "kWh", "Depuis"]}
        rows={subs.map((s) => [
          s.customer.contactName,
          s.plan.name,
          formatXof(s.plan.kwhPriceXof),
          formatDate(s.startedAt),
        ])}
      />

      <h2 style={{ fontSize: "1.05rem", marginTop: 24 }}>Stations</h2>
      <DataTable
        headers={["Code", "Nom", "Site", "Puissance", "Terminal"]}
        rows={stations.map((s) => [
          s.code,
          s.name,
          s.site?.name || "—",
          s.powerKw ? `${s.powerKw} kW` : "—",
          s.terminalId || "—",
        ])}
      />

      <h2 style={{ fontSize: "1.05rem", marginTop: 24 }}>Factures de recharge</h2>
      <DataTable
        headers={["N°", "Client", "kWh", "Tarif", "Total", "Statut", "Date"]}
        rows={invoices.map((inv) => [
          inv.number,
          inv.customer?.contactName || "Anonyme",
          `${inv.session.kwhDelivered} kWh`,
          formatXof(inv.session.pricePerKwh),
          formatXof(inv.totalXof),
          <Badge key={inv.id} tone={inv.status === "PAYEE" ? "ok" : "warn"}>{inv.status}</Badge>,
          formatDate(inv.createdAt),
        ])}
      />

      <div style={{ marginTop: 16 }}>
        <PrimaryLink href="/terminal">Ouvrir le terminal de borne →</PrimaryLink>
      </div>
    </AppShell>
  );
}

const formRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 };
const input: React.CSSProperties = {
  padding: "0.55rem 0.7rem",
  borderRadius: 8,
  border: "1px solid var(--ice-border)",
  background: "var(--ice-input-bg)",
  color: "var(--ice-text)",
  minWidth: 160,
};
const btn: React.CSSProperties = {
  padding: "0.55rem 0.9rem",
  borderRadius: 8,
  border: 0,
  background: "linear-gradient(135deg, #c4a35a, #8b6914)",
  color: "#111",
  fontWeight: 650,
};
