import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { LeadsView, type LeadItem } from "./LeadsView";

export default async function LeadsPage() {
  const user = await requireUser(["DG", "COMMERCIAL", "COMPTA", "ADMIN", "PDG", "SG"]);
  const rawLeads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { assignee: true },
  });

  const leads: LeadItem[] = rawLeads.map((l) => ({
    id: l.id,
    contactName: l.contactName,
    email: l.email,
    phone: l.phone,
    source: l.source,
    interest: l.interest,
    energyPref: l.energyPref,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
    assignee: l.assignee ? { fullName: l.assignee.fullName } : null,
  }));

  return (
    <AppShell user={user} titleKey="leads">
      <LeadsView leads={leads} />
    </AppShell>
  );
}
