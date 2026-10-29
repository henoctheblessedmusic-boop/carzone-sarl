import { revalidatePath } from "next/cache";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge, DataTable } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { getServerMessages } from "@/lib/i18n/server";
import {
  energyCopy,
  energyKindLabel,
  ENERGY_KIND_KEYS,
  ENERGY_VEHICLE_TYPE_KEYS,
  energyVehicleTypeLabel,
  SUPPLIER_TYPE_KEYS,
  supplierTypeLabel,
} from "@/lib/i18n/messages/energy";

async function createBrand(formData: FormData) {
  "use server";
  await requireUser(["DG", "STOCK"]);
  const name = String(formData.get("name") || "").trim().toUpperCase();
  if (!name) return;
  const maxSort = await prisma.vehicleBrand.aggregate({ _max: { sortOrder: true } });
  await prisma.vehicleBrand.create({
    data: {
      name,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      active: true,
    },
  });
  revalidatePath("/catalog");
  revalidatePath("/vehicles");
  revalidatePath("/imports");
}

async function toggleBrand(formData: FormData) {
  "use server";
  await requireUser(["DG", "STOCK"]);
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "1";
  await prisma.vehicleBrand.update({ where: { id }, data: { active: !active } });
  revalidatePath("/catalog");
  revalidatePath("/vehicles");
}

async function createModel(formData: FormData) {
  "use server";
  await requireUser(["DG", "STOCK"]);
  const brandId = String(formData.get("brandId") || "");
  const name = String(formData.get("name") || "").trim().toUpperCase();
  const vehicleType = String(formData.get("vehicleType") || "") || null;
  const energy = String(formData.get("energy") || "") || null;
  if (!brandId || !name) return;
  await prisma.vehicleModel.create({
    data: { brandId, name, vehicleType, energy, active: true },
  });
  revalidatePath("/catalog");
  revalidatePath("/vehicles");
  revalidatePath("/imports");
}

async function toggleModel(formData: FormData) {
  "use server";
  await requireUser(["DG", "STOCK"]);
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "1";
  await prisma.vehicleModel.update({ where: { id }, data: { active: !active } });
  revalidatePath("/catalog");
  revalidatePath("/vehicles");
}

async function createSupplier(formData: FormData) {
  "use server";
  await requireUser(["DG", "STOCK"]);
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await prisma.supplier.create({
    data: {
      name,
      country: String(formData.get("country") || "") || null,
      city: String(formData.get("city") || "") || null,
      contact: String(formData.get("contact") || "") || null,
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      type: String(formData.get("type") || "OTHER"),
      active: true,
    },
  });
  revalidatePath("/catalog");
  revalidatePath("/vehicles");
  revalidatePath("/imports");
}

async function toggleSupplier(formData: FormData) {
  "use server";
  await requireUser(["DG", "STOCK"]);
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "1";
  await prisma.supplier.update({ where: { id }, data: { active: !active } });
  revalidatePath("/catalog");
  revalidatePath("/vehicles");
  revalidatePath("/imports");
}

export default async function CatalogPage() {
  const user = await requireUser(["DG", "STOCK"]);
  const { locale } = await getServerMessages();
  const copy = energyCopy[locale];
  const t = copy.catalog;
  const [brands, suppliers] = await Promise.all([
    prisma.vehicleBrand.findMany({
      include: { models: { orderBy: { name: "asc" } }, _count: { select: { models: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  const modelRows: ReactNode[][] = [];
  for (const b of brands) {
    for (const m of b.models) {
      modelRows.push([
        b.name,
        m.name,
        m.vehicleType ? energyVehicleTypeLabel(copy, m.vehicleType) : copy.common.notProvided,
        m.energy ? energyKindLabel(copy, m.energy) : copy.common.notProvided,
        <Badge key={`ma-${m.id}`} tone={m.active ? "ok" : "neutral"}>
          {m.active ? copy.common.active : copy.common.inactive}
        </Badge>,
        <form key={`mt-${m.id}`} action={toggleModel} style={{ display: "inline" }}>
          <input type="hidden" name="id" value={m.id} />
          <input type="hidden" name="active" value={m.active ? "1" : "0"} />
          <button type="submit" className="ox-btn ox-btn-ghost" style={{ padding: "0.25rem 0.55rem", fontSize: "0.8rem" }}>
            {m.active ? t.toggle.deactivate : t.toggle.reactivate}
          </button>
        </form>,
      ]);
    }
  }

  return (
    <AppShell user={user} titleKey="catalog">
      <p style={{ opacity: 0.75, marginTop: 0 }}>{t.intro}</p>

      <section className="ox-glass" style={{ padding: "1rem", marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.05rem" }}>{t.brand.title}</h2>
        <form action={createBrand} className="ox-form-row" style={{ marginBottom: 12 }}>
          <input
            name="name"
            placeholder={t.brand.placeholder}
            required
            className="ox-input"
            title={t.brand.titleAttr}
          />
          <button type="submit" className="ox-btn" title={t.brand.addTitle}>
            {t.brand.add}
          </button>
        </form>
        <DataTable
          headers={[t.brand.table.brand, t.brand.table.models, t.brand.table.status, t.brand.table.action]}
          rows={brands.map((b) => [
            b.name,
            b._count.models,
            <Badge key={`ba-${b.id}`} tone={b.active ? "ok" : "neutral"}>
              {b.active ? copy.common.active : copy.common.inactive}
            </Badge>,
            <form key={`bt-${b.id}`} action={toggleBrand} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="active" value={b.active ? "1" : "0"} />
              <button type="submit" className="ox-btn ox-btn-ghost" style={{ padding: "0.25rem 0.55rem", fontSize: "0.8rem" }}>
                {b.active ? t.toggle.deactivate : t.toggle.reactivate}
              </button>
            </form>,
          ])}
        />
      </section>

      <section className="ox-glass" style={{ padding: "1rem", marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.05rem" }}>{t.model.title}</h2>
        <form action={createModel} className="ox-form-row" style={{ marginBottom: 12 }}>
          <select name="brandId" required className="ox-select" defaultValue="" title={t.model.brandTitle}>
            <option value="" disabled>
              {t.model.brandPlaceholder}
            </option>
            {brands
              .filter((b) => b.active)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </select>
          <input name="name" placeholder={t.model.modelPlaceholder} required className="ox-input" title={t.model.modelTitle} />
          <select name="vehicleType" className="ox-select" defaultValue="SUV" title={t.model.typeTitle}>
            {ENERGY_VEHICLE_TYPE_KEYS.map((value) => (
              <option key={value} value={value}>
                {energyVehicleTypeLabel(copy, value)}
              </option>
            ))}
          </select>
          <select name="energy" className="ox-select" defaultValue="" title={t.model.energyTitle}>
            <option value="">{t.model.energyOptional}</option>
            {ENERGY_KIND_KEYS.map((value) => (
              <option key={value} value={value}>
                {energyKindLabel(copy, value)}
              </option>
            ))}
          </select>
          <button type="submit" className="ox-btn" title={t.model.addTitle}>
            {t.model.add}
          </button>
        </form>
        <DataTable
          headers={[t.model.table.brand, t.model.table.model, t.model.table.type, t.model.table.energy, t.model.table.status, t.model.table.action]}
          rows={modelRows}
        />
      </section>

      <section className="ox-glass" style={{ padding: "1rem", marginBottom: 8 }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.05rem" }}>{t.supplier.title}</h2>
        <form action={createSupplier} className="ox-form-row" style={{ marginBottom: 12 }}>
          <input name="name" placeholder={t.supplier.namePlaceholder} required className="ox-input" title={t.supplier.nameTitle} />
          <select name="type" className="ox-select" defaultValue="IMPORT_PORT" title={t.supplier.typeTitle}>
            {SUPPLIER_TYPE_KEYS.map((value) => (
              <option key={value} value={value}>
                {supplierTypeLabel(copy, value)}
              </option>
            ))}
          </select>
          <input name="country" placeholder={t.supplier.countryPlaceholder} className="ox-input" />
          <input name="city" placeholder={t.supplier.cityPlaceholder} className="ox-input" />
          <input name="contact" placeholder={t.supplier.contactPlaceholder} className="ox-input" />
          <input name="email" placeholder={t.supplier.emailPlaceholder} className="ox-input" />
          <input name="phone" placeholder={t.supplier.phonePlaceholder} className="ox-input" />
          <input name="notes" placeholder={t.supplier.notesPlaceholder} className="ox-input" style={{ minWidth: 180 }} />
          <button type="submit" className="ox-btn" title={t.supplier.addTitle}>
            {t.supplier.add}
          </button>
        </form>
        <DataTable
          headers={[t.supplier.table.name, t.supplier.table.type, t.supplier.table.location, t.supplier.table.contact, t.supplier.table.phone, t.supplier.table.status, t.supplier.table.action]}
          rows={suppliers.map((s) => [
            s.name,
            supplierTypeLabel(copy, s.type),
            [s.country, s.city].filter(Boolean).join(" · ") || copy.common.notProvided,
            s.contact || copy.common.notProvided,
            s.phone || copy.common.notProvided,
            <Badge key={`sa-${s.id}`} tone={s.active ? "ok" : "neutral"}>
              {s.active ? copy.common.active : copy.common.inactive}
            </Badge>,
            <form key={`st-${s.id}`} action={toggleSupplier} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="active" value={s.active ? "1" : "0"} />
              <button type="submit" className="ox-btn ox-btn-ghost" style={{ padding: "0.25rem 0.55rem", fontSize: "0.8rem" }}>
                {s.active ? t.toggle.deactivate : t.toggle.reactivate}
              </button>
            </form>,
          ])}
        />
      </section>
    </AppShell>
  );
}
