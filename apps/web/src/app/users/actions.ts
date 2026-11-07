"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import type { Role } from "@/lib/roles";
import { DEFAULT_ROLE_CAPABILITIES } from "@/lib/permissions-config";
import {
  assertCanAssignPermissions,
  assertCanAssignRole,
  assertCanManageTargetUser,
  assertKnownRole,
  isSuperAdminRole,
} from "@/lib/user-role-guards";
import { getLocale } from "@/lib/i18n/server";
import { adminCopy } from "@/lib/i18n/messages/admin";

const CAN_MANAGE_USERS_ROLES = ["DEVELOPER", "PDG", "SG", "DG", "ADV", "RTA", "DC", "ADMIN", "RH"] as const;
const PRIVILEGED_PASSWORD_ROLES = ["DEVELOPER", "PDG", "SG", "DG", "ADMIN"] as const;

export async function createUser(formData: FormData) {
  const currentUser = await requireUser([...CAN_MANAGE_USERS_ROLES]);

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") || "").trim();
  const role = String(formData.get("role") || "COMMERCIAL").trim();
  const password = String(formData.get("password") || "").trim();
  const rawPermissions = String(formData.get("permissions") || "").trim();
  const t = adminCopy[await getLocale()].server.users;

  assertKnownRole(role);
  assertCanAssignRole(currentUser.role, role);

  if (!email || !fullName) {
    throw new Error(t.requiredCreateFields);
  }
  if (!password || password.length < 8) {
    throw new Error("Un mot de passe de 8 caractères minimum est obligatoire.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error(t.emailAlreadyUsed);
  }

  let customPermissions: string[] = [];
  if (rawPermissions) {
    try {
      customPermissions = JSON.parse(rawPermissions);
    } catch {
      customPermissions = rawPermissions.split(",").map((s) => s.trim()).filter(Boolean);
    }
  } else {
    // Par défaut, attribuer les capacités du rôle
    customPermissions = DEFAULT_ROLE_CAPABILITIES[role] || [];
  }
  assertCanAssignPermissions(currentUser.role, role, customPermissions);

  const passwordHash = await bcrypt.hash(password, 10);

  const createdUser = await prisma.user.create({
    data: {
      email,
      fullName,
      role,
      passwordHash,
      lastPasswordChange: new Date(),
      active: true,
      customPermissions,
    },
    select: { id: true },
  });

  await logAudit({
    user: currentUser,
    action: "user.create",
    entityType: "User",
    entityId: createdUser.id,
    entityLabel: fullName,
    details: `Création du compte ${email} avec le rôle ${role}`,
  });

  revalidatePath("/users");
}

export async function updateUser(formData: FormData) {
  const currentUser = await requireUser([...CAN_MANAGE_USERS_ROLES]);

  const id = String(formData.get("id") || "").trim();
  const fullName = String(formData.get("fullName") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const rawPermissions = String(formData.get("permissions") || "").trim();

  const t = adminCopy[await getLocale()].server.users;

  if (!id || !role || !fullName) {
    throw new Error(t.requiredUpdateFields);
  }

  assertKnownRole(role);

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) throw new Error(t.userNotFound);

  assertCanManageTargetUser(currentUser.role, targetUser.role);
  assertCanAssignRole(currentUser.role, role);

  if (currentUser.id === id && targetUser.role !== role) {
    throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  }

  let customPermissions: string[] | undefined = undefined;
  if (rawPermissions) {
    try {
      customPermissions = JSON.parse(rawPermissions);
    } catch {
      customPermissions = rawPermissions.split(",").map((s) => s.trim()).filter(Boolean);
    }
    const requestedPermissions = customPermissions || [];
    assertCanAssignPermissions(currentUser.role, role, requestedPermissions);
    if (currentUser.id === id && !isSuperAdminRole(currentUser.role)) {
      const before = [...(targetUser.customPermissions || [])].sort().join("|");
      const after = [...requestedPermissions].sort().join("|");
      if (before !== after) {
        throw new Error("Vous ne pouvez pas modifier vos propres permissions.");
      }
    }
  }

  await prisma.user.update({
    where: { id },
    data: {
      fullName,
      role,
      ...(customPermissions !== undefined ? { customPermissions } : {}),
    },
  });

  await logAudit({
    user: currentUser,
    action: "user.update",
    entityType: "User",
    entityId: id,
    entityLabel: fullName,
    details: `Mise à jour du compte ${targetUser.email} (rôle ${role})`,
  });

  revalidatePath("/users");
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const currentUser = await requireUser();

  const isPrivileged = (PRIVILEGED_PASSWORD_ROLES as readonly string[]).includes(currentUser.role);

  const isSelf = currentUser.id === userId;
  const t = adminCopy[await getLocale()].server.users;

  if (!isSelf && !isPrivileged) {
    throw new Error(t.notAllowedChangePassword);
  }

  if (!newPassword || newPassword.trim().length < 4) {
    throw new Error(t.passwordTooShort);
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new Error(t.userNotFound);

  if (targetUser.role === "DEVELOPER" && currentUser.role !== "DEVELOPER") {
    throw new Error(t.actionNotAllowed);
  }
  if (targetUser.id !== currentUser.id) {
    assertCanManageTargetUser(currentUser.role, targetUser.role);
  }

  const cleanPassword = newPassword.trim();
  const passwordHash = await bcrypt.hash(cleanPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      lastPasswordChange: new Date(),
    },
  });

  // Créer une notification d'alerte pour le DG et l'Admin
  await prisma.adminNotification.create({
    data: {
      type: "PASSWORD_CHANGED",
      title: "Alerte : Mot de passe modifié",
      message: `Le mot de passe de ${targetUser.fullName} (${targetUser.email} - ${targetUser.role}) a été mis à jour par ${currentUser.fullName} (${currentUser.role}).`,
      userId: targetUser.id,
      userName: targetUser.fullName,
      oldValue: "Hash chiffré précédent",
      newValue: "Nouveau hash sécurisé bcrypt",
    },
  });

  await logAudit({
    user: currentUser,
    action: "user.password_change",
    entityType: "User",
    entityId: targetUser.id,
    entityLabel: targetUser.fullName,
    details: `Mot de passe modifié pour ${targetUser.email}`,
  });

  revalidatePath("/users");
  return { success: true };
}

export async function changeMyPassword(newPassword: string) {
  const currentUser = await requireUser();
  return updateUserPassword(currentUser.id, newPassword);
}

export async function updateUserPermissions(id: string, permissions: string[]) {
  const currentUser = await requireUser([...CAN_MANAGE_USERS_ROLES]);

  if (!id) {
    throw new Error(adminCopy[await getLocale()].server.users.userIdRequired);
  }

  const targetUser = await prisma.user.findUnique({ where: { id }, select: { fullName: true, role: true } });
  if (!targetUser) throw new Error(adminCopy[await getLocale()].server.users.userNotFound);

  if (currentUser.id === id && !isSuperAdminRole(currentUser.role)) {
    throw new Error("Vous ne pouvez pas modifier vos propres permissions.");
  }
  assertCanManageTargetUser(currentUser.role, targetUser.role);
  assertCanAssignPermissions(currentUser.role, targetUser.role, permissions);
  await prisma.user.update({
    where: { id },
    data: {
      customPermissions: permissions,
    },
  });

  await logAudit({
    user: currentUser,
    action: "user.permissions_update",
    entityType: "User",
    entityId: id,
    entityLabel: targetUser?.fullName || id,
    details: `${permissions.length} permission(s) personnalisée(s)`,
  });

  revalidatePath("/users");
  return { success: true };
}

export async function resetUserPermissions(id: string) {
  const currentUser = await requireUser([...CAN_MANAGE_USERS_ROLES]);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error(adminCopy[await getLocale()].server.users.userNotFound);

  assertCanManageTargetUser(currentUser.role, user.role);

  const defaultPerms = DEFAULT_ROLE_CAPABILITIES[user.role as Role] || [];

  await prisma.user.update({
    where: { id },
    data: {
      customPermissions: defaultPerms,
    },
  });

  await logAudit({
    user: currentUser,
    action: "user.permissions_reset",
    entityType: "User",
    entityId: id,
    entityLabel: user.fullName,
    details: `Permissions réinitialisées au rôle ${user.role}`,
  });

  revalidatePath("/users");
  return { success: true, count: defaultPerms.length };
}

export async function updateUserRole(formData: FormData) {
  const currentUser = await requireUser([...CAN_MANAGE_USERS_ROLES]);

  const id = String(formData.get("id") || "").trim();
  const role = String(formData.get("role") || "").trim();

  if (!id || !role) {
    throw new Error(adminCopy[await getLocale()].server.users.idAndRoleRequired);
  }

  assertKnownRole(role);

  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { fullName: true, email: true, role: true },
  });
  if (!targetUser) {
    throw new Error(adminCopy[await getLocale()].server.users.userNotFound);
  }

  assertCanManageTargetUser(currentUser.role, targetUser.role);
  assertCanAssignRole(currentUser.role, role);

  if (currentUser.id === id && targetUser.role !== role) {
    throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  }

  const defaultPerms = DEFAULT_ROLE_CAPABILITIES[role] || [];

  await prisma.user.update({
    where: { id },
    data: {
      role,
      customPermissions: defaultPerms,
    },
  });

  await logAudit({
    user: currentUser,
    action: "user.role_update",
    entityType: "User",
    entityId: id,
    entityLabel: targetUser?.fullName || id,
    details: `Nouveau rôle : ${role}`,
  });

  revalidatePath("/users");
}

export async function toggleUserActive(id: string, active: boolean) {
  const currentUser = await requireUser([...CAN_MANAGE_USERS_ROLES]);

  const targetUser = await prisma.user.findUnique({ where: { id } });
  const t = adminCopy[await getLocale()].server.users;
  if (!targetUser) throw new Error(t.userNotFound);

  assertCanManageTargetUser(currentUser.role, targetUser.role);

  await prisma.user.update({
    where: { id },
    data: { active },
  });

  await logAudit({
    user: currentUser,
    action: active ? "user.activate" : "user.deactivate",
    entityType: "User",
    entityId: id,
    entityLabel: targetUser.fullName,
    details: `${targetUser.email} est maintenant ${active ? "actif" : "inactif"}`,
  });

  revalidatePath("/users");
}

export async function deleteUser(id: string) {
  const currentUser = await requireUser([...CAN_MANAGE_USERS_ROLES]);

  const t = adminCopy[await getLocale()].server.users;
  if (currentUser.id === id) {
    throw new Error(t.cannotDeleteOwnAccount);
  }

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) throw new Error(t.userNotFound);

  assertCanManageTargetUser(currentUser.role, targetUser.role);

  await prisma.user.delete({
    where: { id },
  });

  await logAudit({
    user: currentUser,
    action: "user.delete",
    entityType: "User",
    entityId: id,
    entityLabel: targetUser.fullName,
    details: `Suppression du compte ${targetUser.email} (${targetUser.role})`,
  });

  revalidatePath("/users");
}

export async function getAdminNotifications() {
  const currentUser = await requireUser();

  const isPrivileged =
    currentUser.role === "DEVELOPER" ||
    currentUser.role === "PDG" ||
    currentUser.role === "SG" ||
    currentUser.role === "DG" ||
    currentUser.role === "ADMIN";

  if (!isPrivileged) return [];

  const isDev = currentUser.role === "DEVELOPER";

  const notifs = await prisma.adminNotification.findMany({
    where: isDev
      ? undefined
      : {
          type: {
            notIn: ["LOGIN_ALERT", "RATE_LIMIT_ALERT"],
          },
        },
    orderBy: { createdAt: "desc" },
    take: 35,
  });

  return notifs.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    userName: n.userName,
    newValue: n.newValue,
    isRead: n.readBy.includes(currentUser.id),
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function markNotificationRead(id: string) {
  const currentUser = await requireUser();

  const notif = await prisma.adminNotification.findUnique({ where: { id } });
  if (!notif) return;

  if (!notif.readBy.includes(currentUser.id)) {
    await prisma.adminNotification.update({
      where: { id },
      data: {
        readBy: { push: currentUser.id },
      },
    });
  }
}

export async function markAllNotificationsRead() {
  const currentUser = await requireUser();

  const notifs = await prisma.adminNotification.findMany();
  for (const n of notifs) {
    if (!n.readBy.includes(currentUser.id)) {
      await prisma.adminNotification.update({
        where: { id: n.id },
        data: {
          readBy: { push: currentUser.id },
        },
      });
    }
  }
}
