import { revalidatePath } from "next/cache";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge, DataTable } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";

const VEHICLE_TYPES = [
  { value: "SUV", label: "SUV" },
  { value: "PICKUP", label: "Pick-up" },
  { value: "BERLINE", label: "Berline" },
  { value: "VAN", label: "Van / Minibus" },
] as const;

const SUPPLIER_TYPES = [
  { value: "IMPORT_PORT", label: "Port d'import" },
  { value: "DEALER", label: "Dealer" },
  { value: "OTHER", label: "Autre" },
] as const;

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  VEHICLE_TYPES.map((t) => [t.value, t.label]),
);
const SUPPLIER_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  SUPPLIER_TYPES.map((t) => [t.value, t.label]),
);

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
        m.vehicleType ? TYPE_LABEL[m.vehicleType] || m.vehicleType : "-",
        m.energy || "-",
        <Badge key={`ma-${m.id}`} tone={m.active ? "ok" : "neutral"}>
          {m.active ? "Actif" : "Inactif"}
        </Badge>,
        <form key={`mt-${m.id}`} action={toggleModel} style={{ display: "inline" }}>
          <input type="hidden" name="id" value={m.id} />
          <input type="hidden" name="active" value={m.active ? "1" : "0"} />
          <button type="submit" className="ox-btn ox-btn-ghost" style={{ padding: "0.25rem 0.55rem", fontSize: "0.8rem" }}>
            {m.active ? "Désactiver" : "Réactiver"}
          </button>
        </form>,
      ]);
    }
  }

  return (
    <AppShell user={user} titleKey="catalog">
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Marques et modèles CARZONE (site officiel + BYD EV), utilisés pour le stock et les imports.
        Ajoutez une marque, un modèle ou un fournisseur quand CARZONE élargit l&apos;offre.
      </p>

      <section className="ox-glass" style={{ padding: "1rem", marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.05rem" }}>Marques</h2>
        <form action={createBrand} className="ox-form-row" style={{ marginBottom: 12 }}>
          <input
            name="name"
            placeholder="Nouvelle marque *"
            required
            className="ox-input"
            title="Nom de marque (ex. BYD, VOYAH)"
          />
          <button type="submit" className="ox-btn" title="Ajouter une marque au catalogue">
            Ajouter marque
          </button>
        </form>
        <DataTable
          headers={["Marque", "Modèles", "Statut", "Action"]}
          rows={brands.map((b) => [
            b.name,
            b._count.models,
            <Badge key={`ba-${b.id}`} tone={b.active ? "ok" : "neutral"}>
              {b.active ? "Actif" : "Inactif"}
            </Badge>,
            <form key={`bt-${b.id}`} action={toggleBrand} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="active" value={b.active ? "1" : "0"} />
              <button type="submit" className="ox-btn ox-btn-ghost" style={{ padding: "0.25rem 0.55rem", fontSize: "0.8rem" }}>
                {b.active ? "Désactiver" : "Réactiver"}
              </button>
            </form>,
          ])}
        />
      </section>

      <section className="ox-glass" style={{ padding: "1rem", marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.05rem" }}>Modèles</h2>
        <form action={createModel} className="ox-form-row" style={{ marginBottom: 12 }}>
          <select name="brandId" required className="ox-select" defaultValue="" title="Marque parente">
            <option value="" disabled>
              Marque *
            </option>
            {brands
              .filter((b) => b.active)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </select>
          <input name="name" placeholder="Modèle *" required className="ox-input" title="Nom du modèle" />
          <select name="vehicleType" className="ox-select" defaultValue="SUV" title="Type / gamme">
            {VEHICLE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select name="energy" className="ox-select" defaultValue="" title="Énergie par défaut">
            <option value="">Énergie (opt.)</option>
            <option value="ELECTRIQUE">Électrique</option>
            <option value="HYBRIDE">Hybride</option>
            <option value="PHEV">PHEV</option>
            <option value="ESSENCE">Essence</option>
            <option value="DIESEL">Diesel</option>
          </select>
          <button type="submit" className="ox-btn" title="Ajouter un modèle">
            Ajouter modèle
          </button>
        </form>
        <DataTable
          headers={["Marque", "Modèle", "Gamme", "Énergie", "Statut", "Action"]}
          rows={modelRows}
        />
      </section>

      <section className="ox-glass" style={{ padding: "1rem", marginBottom: 8 }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.05rem" }}>Fournisseurs</h2>
        <form action={createSupplier} className="ox-form-row" style={{ marginBottom: 12 }}>
          <input name="name" placeholder="Nom fournisseur *" required className="ox-input" title="Nom" />
          <select name="type" className="ox-select" defaultValue="IMPORT_PORT" title="Type">
            {SUPPLIER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input name="country" placeholder="Pays" className="ox-input" />
          <input name="city" placeholder="Ville / port" className="ox-input" />
          <input name="contact" placeholder="Contact" className="ox-input" />
          <input name="email" placeholder="Email" className="ox-input" />
          <input name="phone" placeholder="Téléphone" className="ox-input" />
          <input name="notes" placeholder="Notes" className="ox-input" style={{ minWidth: 180 }} />
          <button type="submit" className="ox-btn" title="Ajouter un fournisseur">
            Ajouter fournisseur
          </button>
        </form>
        <DataTable
          headers={["Nom", "Type", "Pays / ville", "Contact", "Tél.", "Statut", "Action"]}
          rows={suppliers.map((s) => [
            s.name,
            SUPPLIER_TYPE_LABEL[s.type] || s.type,
            [s.country, s.city].filter(Boolean).join(" · ") || "-",
            s.contact || "-",
            s.phone || "-",
            <Badge key={`sa-${s.id}`} tone={s.active ? "ok" : "neutral"}>
              {s.active ? "Actif" : "Inactif"}
            </Badge>,
            <form key={`st-${s.id}`} action={toggleSupplier} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="active" value={s.active ? "1" : "0"} />
              <button type="submit" className="ox-btn ox-btn-ghost" style={{ padding: "0.25rem 0.55rem", fontSize: "0.8rem" }}>
                {s.active ? "Désactiver" : "Réactiver"}
              </button>
            </form>,
          ])}
        />
      </section>
    </AppShell>
  );
}
