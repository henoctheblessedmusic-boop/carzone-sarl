import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { Badge, DataTable } from "@/components/ui";
import { BrandModelSelect } from "@/components/BrandModelSelect";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatDate, formatXof, nextDocNumber } from "@/lib/format";

async function createImport(formData: FormData) {
  "use server";
  await requireUser(["DG", "STOCK", "COMPTA"]);
  const count = await prisma.importOrder.count();
  const originPort = String(formData.get("originPort") || "");
  await prisma.importOrder.create({
    data: {
      reference: nextDocNumber("IMP", count).replace(
        "IMP",
        `IMP-${originPort.slice(0, 3).toUpperCase() || "PORT"}`,
      ),
      originPort,
      status: "COMMANDE",
      etaDate: formData.get("etaDate") ? new Date(String(formData.get("etaDate"))) : null,
      costXof: Number(formData.get("costXof") || 0) || null,
      supplierId: String(formData.get("supplierId") || "") || null,
      expectedBrand: String(formData.get("brand") || "").trim() || null,
      expectedModel: String(formData.get("model") || "").trim() || null,
      notes: String(formData.get("notes") || "") || null,
    },
  });
  revalidatePath("/imports");
}

async function updateImportStatus(formData: FormData) {
  "use server";
  await requireUser(["DG", "STOCK", "COMPTA"]);
  await prisma.importOrder.update({
    where: { id: String(formData.get("id")) },
    data: { status: String(formData.get("status") || "COMMANDE") },
  });
  revalidatePath("/imports");
}

export default async function ImportsPage() {
  const user = await requireUser(["DG", "STOCK", "COMPTA"]);
  const [orders, suppliers, brands] = await Promise.all([
    prisma.importOrder.findMany({
      include: { vehicles: true, customer: true, supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
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

  return (
    <AppShell user={user} titleKey="imports">
      <p style={{ opacity: 0.75 }}>
        Suivi des arrivages Anvers · Dubaï · Livourne · lien stock, fournisseur & catalogue.
      </p>
      <form action={createImport} className="ox-glass" style={{ padding: "1rem", marginBottom: 16 }}>
        <div className="ox-form-row">
          <select name="originPort" className="ox-select" defaultValue="Anvers" title="Port d'origine">
            <option value="Anvers">Anvers</option>
            <option value="Dubaï">Dubaï</option>
            <option value="Livourne">Livourne</option>
          </select>
          <select name="supplierId" className="ox-select" defaultValue="" title="Fournisseur">
            <option value="">Fournisseur (opt.)</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.city ? ` · ${s.city}` : ""}
              </option>
            ))}
          </select>
          <input name="etaDate" type="date" className="ox-input" title="ETA" />
          <input name="costXof" type="number" placeholder="Coût XOF" className="ox-input" />
          <input name="notes" placeholder="Notes" className="ox-input" style={{ minWidth: 200 }} />
        </div>
        <div style={{ fontSize: "0.85rem", opacity: 0.75, margin: "10px 0 6px" }}>
          Marque / modèle attendus (catalogue, optionnel)
        </div>
        <BrandModelSelect brands={catalog} required={false} allowFreeText={false} />
        <div className="ox-form-row" style={{ marginTop: 10 }}>
          <button type="submit" className="ox-btn" title="Créer la commande d'import">
            Nouvelle commande import
          </button>
        </div>
      </form>
      <DataTable
        headers={["Réf.", "Port", "Fournisseur", "Attendu", "ETA", "Coût", "Véhicules", "Statut", "Action"]}
        rows={orders.map((o) => [
          o.reference,
          o.originPort,
          o.supplier?.name || "-",
          o.expectedBrand
            ? `${o.expectedBrand}${o.expectedModel ? ` ${o.expectedModel}` : ""}`
            : "-",
          formatDate(o.etaDate),
          o.costXof ? formatXof(o.costXof) : "-",
          o.vehicles.length,
          <Badge key={o.id} tone={o.status === "ARRIVE" ? "ok" : "warn"}>
            {o.status}
          </Badge>,
          <form key={`f-${o.id}`} action={updateImportStatus} className="ox-form-row" style={{ margin: 0, gap: 4 }}>
            <input type="hidden" name="id" value={o.id} />
            <select name="status" defaultValue={o.status} className="ox-select" style={{ minWidth: 110 }}>
              {["COMMANDE", "EN_TRANSIT", "DOUANE", "ARRIVE", "ANNULE"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button type="submit" className="ox-btn" style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem" }}>
              OK
            </button>
          </form>,
        ])}
      />
    </AppShell>
  );
}
