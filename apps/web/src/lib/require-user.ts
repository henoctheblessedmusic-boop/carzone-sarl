import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/roles";

export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { active: true, role: true },
  });

  if (!dbUser || !dbUser.active) {
    redirect("/login");
  }

  const effectiveRole = (dbUser.role || session.role) as Role;
  session.role = effectiveRole;

  const isSuperAdmin =
    effectiveRole === "DEVELOPER" ||
    effectiveRole === "DG" ||
    effectiveRole === "PDG" ||
    effectiveRole === "SG";
  if (roles && !isSuperAdmin && !roles.includes(effectiveRole)) {
    redirect("/dashboard");
  }
  return session;
}

