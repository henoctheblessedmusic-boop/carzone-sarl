import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { Badge, DataTable } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof } from "@/lib/format";

async function createOpp(formData: FormData) {
  "use server";
  const user = await requireUser(["DG", "COMMERCIAL", "ADMIN"]);
  await prisma.opportunity.create({
    data: {
      title: String(formData.get("title") || ""),
      customerId: String(formData.get("customerId") || "") || null,
      vehicleId: String(formData.get("vehicleId") || "") || null,
      ownerId: user.id,
      stage: "LEAD",
      amountXof: Number(formData.get("amountXof") || 0) || null,
    },
  });
  revalidatePath("/opportunities");
}

async function setStage(formData: FormData) {
  "use server";
  await requireUser(["DG", "COMMERCIAL", "ADMIN"]);
  const id = String(formData.get("id"));
  const stage = String(formData.get("stage"));
  await prisma.opportunity.update({
    where: { id },
    data: {
      stage,
      closedAt: stage === "LIVRE" || stage === "PERDU" ? new Date() : null,
    },
  });
  if (stage === "LIVRE") {
    const opp = await prisma.opportunity.findUnique({ where: { id } });
    if (opp?.vehicleId) {
      await prisma.vehicle.update({ where: { id: opp.vehicleId }, data: { status: "VENDU" } });
    }
  }
  revalidatePath("/opportunities");
  revalidatePath("/vehicles");
}

export default async function OpportunitiesPage() {
  const user = await requireUser(["DG", "COMMERCIAL", "COMPTA", "ADMIN"]);
  const [opps, customers, vehicles] = await Promise.all([
    prisma.opportunity.findMany({
      include: { customer: true, vehicle: true, owner: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.customer.findMany({ orderBy: { contactName: "asc" } }),
    prisma.vehicle.findMany({ where: { status: { in: ["EN_STOCK", "RESERVE"] } }, orderBy: { brand: "asc" } }),
  ]);

  const stages = ["LEAD", "MATCHING", "ESSAI", "DEVIS", "NEGOCIATION", "CLOSING", "LIVRE", "PERDU"];

  return (
    <AppShell user={user} titleKey="opportunities">
      <form action={createOpp} style={formRow}>
        <input name="title" placeholder="Titre opportunité *" required style={{ ...input, minWidth: 220 }} />
        <select name="customerId" style={input} defaultValue="">
          <option value="">Client</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.contactName}</option>
          ))}
        </select>
        <select name="vehicleId" style={input} defaultValue="">
          <option value="">Véhicule (matching)</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.brand} {v.model} · {formatXof(v.priceXof)}</option>
          ))}
        </select>
        <input name="amountXof" type="number" placeholder="Montant XOF" style={input} />
        <button type="submit" style={btn}>Créer</button>
      </form>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {stages.map((s) => (
          <Badge key={s}>{s}: {opps.filter((o) => o.stage === s).length}</Badge>
        ))}
      </div>

      <DataTable
        headers={["Titre", "Client", "Véhicule", "Montant", "Étape", "Avancer"]}
        rows={opps.map((o) => [
          o.title,
          o.customer?.contactName || "-",
          o.vehicle ? `${o.vehicle.brand} ${o.vehicle.model}` : "-",
          o.amountXof ? formatXof(o.amountXof) : "-",
          <Badge key={o.id} tone={o.stage === "LIVRE" ? "ok" : o.stage === "PERDU" ? "bad" : "warn"}>{o.stage}</Badge>,
          <form key={`f-${o.id}`} action={setStage} style={{ display: "flex", gap: 4 }}>
            <input type="hidden" name="id" value={o.id} />
            <select name="stage" defaultValue={o.stage} style={input}>
              {stages.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="submit" style={btnSmall}>OK</button>
          </form>,
        ])}
      />
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
  minWidth: 140,
};
const btn: React.CSSProperties = {
  padding: "0.55rem 0.9rem",
  borderRadius: 8,
  border: 0,
  background: "linear-gradient(135deg, #c4a35a, #8b6914)",
  color: "#111",
  fontWeight: 650,
};
const btnSmall: React.CSSProperties = { ...btn, padding: "0.35rem 0.6rem", fontSize: "0.8rem" };
