import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "@/lib/auth";
import type { Role } from "@/lib/roles";

export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  // getSession relit désormais l'état actif, le rôle et les permissions en base.
  const session = await getSession();
  if (!session) redirect("/login");

  const effectiveRole = session.role;
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

