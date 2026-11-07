import { NextResponse } from "next/server";
import { getSession, type SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/roles";
import { RoleService } from "@/lib/role-service";
import type { Permission } from "@/lib/role-service";

/**
 * Récupère l'utilisateur API en relisant son rôle et son état actif en base.
 * Évite qu'un cookie de session périmé conserve un rôle ou un accès après
 * désactivation, rétrogradation ou changement de permissions.
 */
export async function getApiUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { active: true, role: true, customPermissions: true },
  });
  if (!user || !user.active) return null;

  return {
    ...session,
    role: user.role as Role,
    customPermissions: user.customPermissions || [],
  };
}

export function apiUnauthorized(): NextResponse {
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}

export function apiForbidden(message = "Accès refusé"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function apiPermissionDenied(): NextResponse {
  return NextResponse.json({ error: "Permission insuffisante" }, { status: 403 });
}

export function hasApiPermission(user: SessionUser, permission: Permission): boolean {
  return RoleService.userHasPermission(user, permission);
}

export function hasApiRole(user: SessionUser, roles: readonly string[]): boolean {
  return roles.includes(user.role);
}
