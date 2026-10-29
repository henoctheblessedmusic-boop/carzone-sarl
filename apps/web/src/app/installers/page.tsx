import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { Badge, DataTable } from "@/components/ui";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { getServerMessages } from "@/lib/i18n/server";
import { energyCopy } from "@/lib/i18n/messages/energy";

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
  const { locale } = await getServerMessages();
  const copy = energyCopy[locale];
  const t = copy.installers;
  const installers = await prisma.installer.findMany({
    orderBy: { companyName: "asc" },
    include: { _count: { select: { quotes: true } } },
  });

  return (
    <AppShell user={user} titleKey="installers">
      <p style={{ opacity: 0.75, marginTop: 0 }}>{t.intro}</p>
      {user.role !== "INSTALLATEUR" ? (
        <form action={createInstaller} style={formRow}>
          <input name="companyName" placeholder={t.form.company} required style={input} />
          <input name="contactName" placeholder={t.form.contact} required style={input} />
          <input name="email" placeholder={t.form.email} style={input} />
          <input name="phone" placeholder={t.form.phone} style={input} />
          <input name="specialties" placeholder={t.form.specialties} style={{ ...input, minWidth: 200 }} />
          <button type="submit" style={btn}>{t.form.submit}</button>
        </form>
      ) : null}
      <DataTable
        headers={[t.table.company, t.table.contact, t.table.phone, t.table.specialties, t.table.quotes, t.table.active]}
        rows={installers.map((i) => [
          i.companyName,
          i.contactName,
          i.phone || copy.common.notProvided,
          i.specialties || copy.common.notProvided,
          i._count.quotes,
          <Badge key={i.id} tone={i.active ? "ok" : "bad"}>{i.active ? copy.common.active : copy.common.inactive}</Badge>,
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
