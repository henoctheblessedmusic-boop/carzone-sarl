import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "@/lib/auth";
import type { Role } from "@/lib/roles";

export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  const isSuperAdmin =
    session.role === "DEVELOPER" ||
    session.role === "DG" ||
    session.role === "PDG" ||
    session.role === "SG";
  if (roles && !isSuperAdmin && !roles.includes(session.role)) {
    redirect("/dashboard");
  }
  return session;
}

