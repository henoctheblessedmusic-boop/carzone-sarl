import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { CLIENT_ACCESS_ROLES, userHasCapability } from "@/lib/permissions-config";
import { ClientsView } from "./ClientsView";

export default async function ClientsPage() {
  const user = await requireUser([...CLIENT_ACCESS_ROLES]);
  const canManage = ["DG", "COMMERCIAL", "COMPTA", "COMPTA_GARAGE", "GESTIONNAIRE_LOCATION", "ADMIN"].includes(user.role);
  const canDelete = ["PDG", "SG", "DG", "ADV", "RF", "COMPTA", "GESTIONNAIRE_LOCATION", "ADMIN"].includes(user.role);
  const canImport = userHasCapability(user.role, "customers:create", user.customPermissions);

  const customers = await prisma.customer.findMany({
    where:
      user.role === "GESTIONNAIRE_LOCATION"
        ? { OR: [{ scopeRental: true }, { rentals: { some: {} } }] }
        : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      documents: {
        orderBy: { uploadedAt: "desc" },
      },
      _count: {
        select: {
          quotes: true,
          invoices: true,
          rentals: true,
          installRequests: true,
          subscriptions: true,
        },
      },
    },
  });

  return (
    <AppShell user={user} titleKey="clients">
      <ClientsView
        initialCustomers={customers}
        canManage={canManage}
        canDelete={canDelete}
        canImport={canImport}
        defaultGarageScope={user.role === "COMPTA_GARAGE"}
        rentalScope={user.role === "GESTIONNAIRE_LOCATION"}
      />
    </AppShell>
  );
}
