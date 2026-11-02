import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { userHasCapability } from "@/lib/permissions-config";
import { ClientsView } from "./ClientsView";

export default async function ClientsPage() {
  const user = await requireUser();
  const canManage = ["DG", "COMMERCIAL", "COMPTA", "ADMIN"].includes(user.role);
  const canImport = userHasCapability(user.role, "customers:create", user.customPermissions);

  const customers = await prisma.customer.findMany({
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
      <ClientsView initialCustomers={customers} canManage={canManage} canImport={canImport} />
    </AppShell>
  );
}
