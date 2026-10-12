import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { Badge, DataTable } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";

async function createInstaller(formData: FormData) {
  "use server";
  await requireUser(["DG", "BORNES_OPS"]);
  await prisma.installer.create({
    data: {
      companyName: String(formData.get("companyName") || ""),
      contactName: String(formData.get("contactName") || ""),
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      specialties: String(formData.get("specialties") || "") || null,
    },
  });
  revalidatePath("/installers");
}

export default async function InstallersPage() {
  const user = await requireUser(["DG", "BORNES_OPS", "COMMERCIAL", "INSTALLATEUR"]);
  const installers = await prisma.installer.findMany({
    orderBy: { companyName: "asc" },
    include: { _count: { select: { quotes: true } } },
  });

  return (
    <AppShell user={user} titleKey="installers">
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Professionnels partenaires pour l&apos;installation de bornes à domicile — devis via CARZONE.
      </p>
      {user.role !== "INSTALLATEUR" ? (
        <form action={createInstaller} style={formRow}>
          <input name="companyName" placeholder="Société *" required style={input} />
          <input name="contactName" placeholder="Contact *" required style={input} />
          <input name="email" placeholder="Email" style={input} />
          <input name="phone" placeholder="Téléphone" style={input} />
          <input name="specialties" placeholder="Spécialités" style={{ ...input, minWidth: 200 }} />
          <button type="submit" style={btn}>Ajouter au panel</button>
        </form>
      ) : null}
      <DataTable
        headers={["Société", "Contact", "Téléphone", "Spécialités", "Devis", "Actif"]}
        rows={installers.map((i) => [
          i.companyName,
          i.contactName,
          i.phone || "—",
          i.specialties || "—",
          i._count.quotes,
          <Badge key={i.id} tone={i.active ? "ok" : "bad"}>{i.active ? "Actif" : "Inactif"}</Badge>,
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
