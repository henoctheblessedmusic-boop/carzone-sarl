import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { userHasCapability } from "@/lib/permissions-config";
import { UsersView, type UserItem } from "./UsersView";

export default async function UsersPage() {
  const user = await requireUser(["PDG", "SG", "DG", "ADV", "RTA", "DC", "ADMIN", "RH"]);

  // Capacités réelles de l'utilisateur courant : pilotent l'affichage des actions côté client
  // (bouton "Nouvel utilisateur", édition des rôles/capacités, suppression) sans dupliquer la
  // logique d'autorisation, qui reste celle de permissions-config.ts.
  const canCreateUsers = userHasCapability(user.role, "users:create", user.customPermissions);
  const canAssignRole = userHasCapability(user.role, "users:assign_role", user.customPermissions);
  const canCustomPermissions = userHasCapability(user.role, "users:custom_permissions", user.customPermissions);
  const canDeleteUsers = userHasCapability(user.role, "users:delete", user.customPermissions);

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
        canCreateUsers={canCreateUsers}
        canAssignRole={canAssignRole}
        canCustomPermissions={canCustomPermissions}
        canDeleteUsers={canDeleteUsers}
      />
    </AppShell>
  );
}
