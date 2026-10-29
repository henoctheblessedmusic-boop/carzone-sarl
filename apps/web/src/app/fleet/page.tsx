import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { Badge, DataTable } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";

async function createFleet(formData: FormData) {
  "use server";
  await requireUser(["DG", "COMMERCIAL", "BORNES_OPS"]);
  await prisma.fleetAccount.create({
    data: {
      name: String(formData.get("name") || ""),
      company: String(formData.get("company") || "") || null,
    },
  });
  revalidatePath("/fleet");
}

async function addFleetVehicle(formData: FormData) {
  "use server";
  await requireUser(["DG", "COMMERCIAL", "BORNES_OPS"]);
  await prisma.fleetVehicle.create({
    data: {
      fleetAccountId: String(formData.get("fleetAccountId")),
      vehicleId: String(formData.get("vehicleId") || "") || null,
      customerId: String(formData.get("customerId") || "") || null,
      plateNumber: String(formData.get("plateNumber") || "") || null,
      driverName: String(formData.get("driverName") || "") || null,
    },
  });
  revalidatePath("/fleet");
}

export default async function FleetPage() {
  const user = await requireUser(["DG", "COMMERCIAL", "BORNES_OPS"]);
  const [fleets, vehicles, customers] = await Promise.all([
    prisma.fleetAccount.findMany({
      include: { vehicles: { include: { vehicle: true, customer: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vehicle.findMany({ orderBy: { brand: "asc" } }),
    prisma.customer.findMany({ orderBy: { contactName: "asc" } }),
  ]);

  return (
    <AppShell user={user} titleKey="fleet">
      <form action={createFleet} style={formRow}>
        <input name="name" placeholder="Nom flotte *" required style={input} />
        <input name="company" placeholder="Entreprise" style={input} />
        <button type="submit" style={btn}>Créer compte flotte</button>
      </form>

      <form action={addFleetVehicle} style={formRow}>
        <select name="fleetAccountId" required style={input} defaultValue="">
          <option value="" disabled>Flotte *</option>
          {fleets.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select name="vehicleId" style={input} defaultValue="">
          <option value="">Véhicule CARZONE</option>
          {vehicles.map((v) => <option key={v.id} value={v.id}>{v.brand} {v.model}</option>)}
        </select>
        <select name="customerId" style={input} defaultValue="">
          <option value="">Client</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.contactName}</option>)}
        </select>
        <input name="plateNumber" placeholder="Immatriculation" style={input} />
        <input name="driverName" placeholder="Conducteur" style={input} />
        <button type="submit" style={btn}>Ajouter véhicule</button>
      </form>

      {fleets.map((f) => (
        <div key={f.id} style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1.05rem" }}>
            {f.name} {f.company ? <span style={{ opacity: 0.65 }}>· {f.company}</span> : null}
          </h2>
          <DataTable
            headers={["Immat.", "Véhicule", "Conducteur", "Client", "Actif"]}
            rows={f.vehicles.map((fv) => [
              fv.plateNumber || "-",
              fv.vehicle ? `${fv.vehicle.brand} ${fv.vehicle.model}` : "-",
              fv.driverName || "-",
              fv.customer?.contactName || "-",
              <Badge key={fv.id} tone={fv.active ? "ok" : "bad"}>{fv.active ? "Oui" : "Non"}</Badge>,
            ])}
          />
        </div>
      ))}
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
