import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { Badge, DataTable } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatDate, formatXof } from "@/lib/format";

async function createRental(formData: FormData) {
  "use server";
  await requireUser(["DG", "COMMERCIAL", "COMPTA"]);
  const vehicleId = String(formData.get("vehicleId"));
  await prisma.rental.create({
    data: {
      type: String(formData.get("type") || "LCD"),
      status: "ACTIF",
      customerId: String(formData.get("customerId")),
      vehicleId,
      startDate: new Date(String(formData.get("startDate") || new Date().toISOString())),
      endDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))) : null,
      monthlyXof: Number(formData.get("monthlyXof") || 0) || null,
      depositXof: Number(formData.get("depositXof") || 0) || null,
    },
  });
  await prisma.vehicle.update({ where: { id: vehicleId }, data: { status: "LOUE" } });
  revalidatePath("/rentals");
  revalidatePath("/vehicles");
}

export default async function RentalsPage() {
  const user = await requireUser(["DG", "COMMERCIAL", "COMPTA"]);
  const [rentals, customers, vehicles] = await Promise.all([
    prisma.rental.findMany({
      include: { customer: true, vehicle: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({ orderBy: { contactName: "asc" } }),
    prisma.vehicle.findMany({ where: { status: "EN_STOCK" } }),
  ]);

  return (
    <AppShell user={user} titleKey="rentals">
      <form action={createRental} style={formRow}>
        <select name="type" style={input} defaultValue="LCD">
          <option value="LCD">LCD — courte durée</option>
          <option value="LLD">LLD — longue durée</option>
          <option value="LOA">LOA — option d&apos;achat</option>
        </select>
        <select name="customerId" required style={input} defaultValue="">
          <option value="" disabled>Client *</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.contactName}</option>)}
        </select>
        <select name="vehicleId" required style={input} defaultValue="">
          <option value="" disabled>Véhicule stock *</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
          ))}
        </select>
        <input name="startDate" type="date" style={input} />
        <input name="endDate" type="date" style={input} />
        <input name="monthlyXof" type="number" placeholder="Mensualité XOF" style={input} />
        <input name="depositXof" type="number" placeholder="Caution XOF" style={input} />
        <button type="submit" style={btn}>Créer contrat</button>
      </form>
      <DataTable
        headers={["Type", "Client", "Véhicule", "Début", "Fin", "Mensualité", "Statut"]}
        rows={rentals.map((r) => [
          r.type,
          r.customer.contactName,
          `${r.vehicle.brand} ${r.vehicle.model}`,
          formatDate(r.startDate),
          formatDate(r.endDate),
          r.monthlyXof ? formatXof(r.monthlyXof) : "—",
          <Badge key={r.id} tone={r.status === "ACTIF" ? "ok" : "neutral"}>{r.status}</Badge>,
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
