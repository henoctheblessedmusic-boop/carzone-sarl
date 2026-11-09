import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { Badge, DataTable } from "@/components/ui";
import { BrandModelSelect } from "@/components/BrandModelSelect";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof, nextDocNumber } from "@/lib/format";
import { getServerMessages } from "@/lib/i18n/server";
import { logAudit } from "@/lib/audit";
import { syncImportOrderVehicle } from "@/lib/import-orders";
import {
  energyCopy,
  IMPORT_STATUS_KEYS,
  importPortLabel,
  importStatusLabel,
} from "@/lib/i18n/messages/energy";

async function createImport(formData: FormData) {
  "use server";
  const user = await requireUser(["DG", "STOCK", "COMPTA"]);
  const count = await prisma.importOrder.count();
  const originPort = String(formData.get("originPort") || "");
  const expectedBrand = String(formData.get("brand") || "").trim() || null;
  const expectedModel = String(formData.get("model") || "").trim() || null;
  const rawQuantity = Number(formData.get("quantity") || 1);
  const quantity = Number.isFinite(rawQuantity)
    ? Math.min(50, Math.max(1, Math.floor(rawQuantity)))
    : 1;
  const order = await prisma.importOrder.create({
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
      expectedBrand,
      expectedModel,
      quantity,
      notes: String(formData.get("notes") || "") || null,
    },
    select: { id: true, reference: true },
  });

  // Chaque commande import doit immédiatement exister dans le stock véhicules.
  await syncImportOrderVehicle(order.id);

  await logAudit({
    user,
    action: "import.create",
    entityType: "ImportOrder",
    entityId: order.id,
    entityLabel: order.reference,
    details: `${expectedBrand || "Marque à préciser"} ${expectedModel || "Modèle à préciser"} - ${originPort}${quantity > 1 ? ` - ${quantity} unités` : ""}`,
  });

  revalidatePath("/imports");
  revalidatePath("/vehicles");
  revalidatePath("/catalog");
  revalidatePath("/dashboard");
}

async function updateImportStatus(formData: FormData) {
  "use server";
  const user = await requireUser(["DG", "STOCK", "COMPTA"]);
  const order = await prisma.importOrder.update({
    where: { id: String(formData.get("id")) },
    data: { status: String(formData.get("status") || "COMMANDE") },
    select: { id: true, reference: true, status: true },
  });

  // Le statut logistique doit être répercuté immédiatement sur le véhicule du stock.
  const sync = await syncImportOrderVehicle(order.id);

  await logAudit({
    user,
    action: "import.status_change",
    entityType: "ImportOrder",
    entityId: order.id,
    entityLabel: order.reference,
    details: `Statut ${order.status}${sync ? ` - véhicule ${sync.created ? "créé" : "synchronisé"}` : ""}`,
  });

  revalidatePath("/imports");
  revalidatePath("/vehicles");
  revalidatePath("/catalog");
  revalidatePath("/dashboard");
}

export default async function ImportsPage() {
  const user = await requireUser(["DG", "STOCK", "COMPTA"]);
  const { locale } = await getServerMessages();
  const copy = energyCopy[locale];
  const t = copy.imports;
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
      <p style={{ opacity: 0.75 }}>{t.intro}</p>
      <form action={createImport} className="ox-glass" style={{ padding: "1rem", marginBottom: 16 }}>
        <div className="ox-form-row">
          <select name="originPort" className="ox-select" defaultValue="Anvers" title={t.form.portTitle}>
            <option value="Anvers">{importPortLabel(copy, "Anvers")}</option>
            <option value="Dubaï">{importPortLabel(copy, "Dubaï")}</option>
            <option value="Livourne">{importPortLabel(copy, "Livourne")}</option>
          </select>
          <select name="supplierId" className="ox-select" defaultValue="" title={t.form.supplierTitle}>
            <option value="">{t.form.supplierOptional}</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.city ? ` · ${s.city}` : ""}
              </option>
            ))}
          </select>
          <input name="etaDate" type="date" className="ox-input" title={t.form.etaTitle} />
          <input name="costXof" type="number" placeholder={t.form.costPlaceholder} className="ox-input" />
          <input
            name="quantity"
            type="number"
            min={1}
            max={50}
            step={1}
            defaultValue={1}
            required
            placeholder={t.form.quantityPlaceholder}
            title={t.form.quantityTitle}
            className="ox-input"
            style={{ maxWidth: 180 }}
          />
          <input name="notes" placeholder={t.form.notesPlaceholder} className="ox-input" style={{ minWidth: 200 }} />
        </div>
        <div style={{ fontSize: "0.85rem", opacity: 0.75, margin: "10px 0 6px" }}>
          {t.form.catalogHint}
        </div>
        <BrandModelSelect brands={catalog} required={false} allowFreeText={false} />
        <div className="ox-form-row" style={{ marginTop: 10 }}>
          <button type="submit" className="ox-btn" title={t.form.submitTitle}>
            {t.form.submit}
          </button>
        </div>
      </form>
      <DataTable
        headers={[t.table.reference, t.table.port, t.table.supplier, t.table.expected, t.table.eta, t.table.cost, t.table.vehicles, t.table.status, t.table.action]}
        rows={orders.map((o) => [
          o.reference,
          importPortLabel(copy, o.originPort),
          o.supplier?.name || copy.common.notProvided,
          o.expectedBrand
            ? `${o.expectedBrand}${o.expectedModel ? ` ${o.expectedModel}` : ""}`
            : copy.common.notProvided,
          copy.formatDate(o.etaDate),
          o.costXof ? formatXof(o.costXof) : copy.common.notProvided,
          o.vehicles.length,
          <Badge key={o.id} tone={o.status === "ARRIVE" ? "ok" : "warn"}>
            {importStatusLabel(copy, o.status)}
          </Badge>,
          <form key={`f-${o.id}`} action={updateImportStatus} className="ox-form-row" style={{ margin: 0, gap: 4 }}>
            <input type="hidden" name="id" value={o.id} />
            <select name="status" defaultValue={o.status} className="ox-select" style={{ minWidth: 110 }}>
              {IMPORT_STATUS_KEYS.map((s) => (
                <option key={s} value={s}>
                  {t.statusOption[s]}
                </option>
              ))}
            </select>
            <button type="submit" className="ox-btn" style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem" }}>
              {t.confirm}
            </button>
          </form>,
        ])}
      />
    </AppShell>
  );
}
