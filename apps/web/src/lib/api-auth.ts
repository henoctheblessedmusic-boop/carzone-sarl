import { NextResponse } from "next/server";
import { getSession, type SessionUser } from "@/lib/auth";
import { RoleService } from "@/lib/role-service";
import type { Permission } from "@/lib/role-service";

/**
 * Récupère l'utilisateur API. getSession relit désormais le rôle, l'état actif,
 * les permissions et la version de session en base.
 */
export async function getApiUser(): Promise<SessionUser | null> {
  return getSession();
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
