import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { ServicesView } from "./ServicesView";

export default async function ServicesPage() {
  const user = await requireUser();
  const canManage = [
    "PDG",
    "SG",
    "DG",
    "ADV",
    "RF",
    "RTA",
    "DC",
    "COMMERCIAL",
    "HOTESSE",
    "ASSISTANTE_COMPTABLE",
    "CHEF_ATELIER",
    "STOCK",
    "COMPTA",
    "ADMIN",
  ].includes(user.role);

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell user={user} title="Articles & Services (Catalogue)">
      <ServicesView initialArticles={articles} canManage={canManage} />
    </AppShell>
  );
}
