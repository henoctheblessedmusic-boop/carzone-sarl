import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { UsersView, type UserItem } from "./UsersView";

export default async function UsersPage() {
  const user = await requireUser(["PDG", "SG", "DG", "ADV", "RTA", "DC", "ADMIN", "RH"]);

  const isDeveloper = user.role === "DEVELOPER";

  // Rôle invisible : Le Développeur est totalement invisible pour tous les autres utilisateurs
  const users = await prisma.user.findMany({
    where: isDeveloper ? undefined : { role: { not: "DEVELOPER" } },
    orderBy: { createdAt: "asc" },
  });


  const formattedUsers: UserItem[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    active: u.active,
    visiblePassword: u.visiblePassword || null,
    lastPasswordChange: u.lastPasswordChange ? u.lastPasswordChange.toISOString() : null,
    customPermissions: u.customPermissions || [],
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <AppShell user={user} titleKey="users">
      <UsersView
        initialUsers={formattedUsers}
        currentUserId={user.id}
        currentUserRole={user.role}
      />
    </AppShell>
  );
}
