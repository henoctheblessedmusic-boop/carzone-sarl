import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { Badge, DataTable, PrimaryLink, Stat } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof } from "@/lib/format";
import { getServerMessages } from "@/lib/i18n/server";
import { chargingInvoiceStatusLabel, energyCopy } from "@/lib/i18n/messages/energy";

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
  const { locale } = await getServerMessages();
  const copy = energyCopy[locale];
  const t = copy.charging;
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
        <Stat label={t.kpi.plans} value={plans.length} />
        <Stat label={t.kpi.subscribers} value={subs.length} />
        <Stat label={t.kpi.stations} value={stations.length} />
        <Stat label={t.kpi.invoices} value={invoices.length} />
      </div>

      <h2 style={{ fontSize: "1.05rem" }}>{t.plansTitle}</h2>
      <DataTable
        headers={t.planHeaders}
        rows={plans.map((p) => [
          <div key={p.id}>
            <strong>{p.name}</strong>
            <div style={{ opacity: 0.65, fontSize: "0.8rem" }}>{p.description}</div>
          </div>,
          formatXof(p.monthlyFeeXof),
          formatXof(p.kwhPriceXof),
          formatXof(p.publicKwhPriceXof),
          <Badge key={`b-${p.id}`} tone={p.active ? "ok" : "bad"}>{p.active ? copy.common.yes : copy.common.no}</Badge>,
        ])}
      />

      <h2 style={{ fontSize: "1.05rem", marginTop: 24 }}>{t.subscribeTitle}</h2>
      <form action={subscribe} style={formRow}>
        <select name="customerId" required style={input} defaultValue="">
          <option value="" disabled>{t.customerSelect}</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.contactName}</option>)}
        </select>
        <select name="planId" required style={input} defaultValue="">
          <option value="" disabled>{t.planSelect}</option>
          {plans.filter((p) => p.active).map((p) => (
            <option key={p.id} value={p.id}>{p.name} · {formatXof(p.kwhPriceXof)}/kWh</option>
          ))}
        </select>
        <button type="submit" style={btn}>{t.subscribeSubmit}</button>
      </form>

      <h2 style={{ fontSize: "1.05rem", marginTop: 8 }}>{t.subscribersTitle}</h2>
      <DataTable
        headers={t.subscriberHeaders}
        rows={subs.map((s) => [
          s.customer.contactName,
          s.plan.name,
          formatXof(s.plan.kwhPriceXof),
          copy.formatDate(s.startedAt),
        ])}
      />

      <h2 style={{ fontSize: "1.05rem", marginTop: 24 }}>{t.stationsTitle}</h2>
      <DataTable
        headers={t.stationHeaders}
        rows={stations.map((s) => [
          s.code,
          s.name,
          s.site?.name || copy.common.notProvided,
          s.powerKw ? `${s.powerKw} kW` : copy.common.notProvided,
          s.terminalId || copy.common.notProvided,
        ])}
      />

      <h2 style={{ fontSize: "1.05rem", marginTop: 24 }}>{t.invoicesTitle}</h2>
      <DataTable
        headers={t.invoiceHeaders}
        rows={invoices.map((inv) => [
          inv.number,
          inv.customer?.contactName || t.anonymous,
          `${inv.session.kwhDelivered} kWh`,
          formatXof(inv.session.pricePerKwh),
          formatXof(inv.totalXof),
          <Badge key={inv.id} tone={inv.status === "PAYEE" ? "ok" : "warn"}>{chargingInvoiceStatusLabel(copy, inv.status)}</Badge>,
          copy.formatDate(inv.createdAt),
        ])}
      />

      <div style={{ marginTop: 16 }}>
        <PrimaryLink href="/terminal">{t.openTerminal}</PrimaryLink>
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
