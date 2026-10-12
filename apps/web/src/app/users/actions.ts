"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/roles";
import { DEFAULT_ROLE_CAPABILITIES } from "@/lib/permissions-config";

const CAN_MANAGE_USERS_ROLES = ["PDG", "SG", "DG", "ADV", "RTA", "DC", "ADMIN", "RH"] as const;
const PRIVILEGED_PASSWORD_ROLES = ["PDG", "SG", "DG", "ADMIN"] as const;

export async function createUser(formData: FormData) {
  await requireUser([...CAN_MANAGE_USERS_ROLES]);

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") || "").trim();
  const role = String(formData.get("role") || "COMMERCIAL").trim() as Role;
  const password = String(formData.get("password") || "").trim() || "Carzone2026!";
  const rawPermissions = String(formData.get("permissions") || "").trim();

  if (!email || !fullName) {
    throw new Error("L'email et le nom complet sont obligatoires.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Un utilisateur avec cette adresse email existe déjà.");
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

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      fullName,
      role,
      passwordHash,
      visiblePassword: password,
      lastPasswordChange: new Date(),
      active: true,
      customPermissions,
    },
  });

  revalidatePath("/users");
}

export async function updateUser(formData: FormData) {
  await requireUser([...CAN_MANAGE_USERS_ROLES]);

  const id = String(formData.get("id") || "").trim();
  const fullName = String(formData.get("fullName") || "").trim();
  const role = String(formData.get("role") || "").trim() as Role;
  const rawPermissions = String(formData.get("permissions") || "").trim();

  if (!id || !role || !fullName) {
    throw new Error("ID, rôle et nom complet sont obligatoires.");
  }

  let customPermissions: string[] | undefined = undefined;
  if (rawPermissions) {
    try {
      customPermissions = JSON.parse(rawPermissions);
    } catch {
      customPermissions = rawPermissions.split(",").map((s) => s.trim()).filter(Boolean);
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

  revalidatePath("/users");
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const currentUser = await requireUser();

  const isPrivileged = (PRIVILEGED_PASSWORD_ROLES as readonly string[]).includes(currentUser.role);

  const isSelf = currentUser.id === userId;

  if (!isSelf && !isPrivileged) {
    throw new Error("Vous n'êtes pas autorisé à modifier le mot de passe de cet utilisateur.");
  }

  if (!newPassword || newPassword.trim().length < 4) {
    throw new Error("Le mot de passe doit comporter au moins 4 caractères.");
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new Error("Utilisateur introuvable.");

  const cleanPassword = newPassword.trim();
  const passwordHash = await bcrypt.hash(cleanPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      visiblePassword: cleanPassword,
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
      oldValue: targetUser.visiblePassword || "Non renseigné",
      newValue: cleanPassword,
    },
  });

  revalidatePath("/users");
  return { success: true };
}

export async function changeMyPassword(newPassword: string) {
  const currentUser = await requireUser();
  return updateUserPassword(currentUser.id, newPassword);
}

export async function updateUserPermissions(id: string, permissions: string[]) {
  await requireUser([...CAN_MANAGE_USERS_ROLES]);

  if (!id) {
    throw new Error("ID utilisateur obligatoire.");
  }

  await prisma.user.update({
    where: { id },
    data: {
      customPermissions: permissions,
    },
  });

  revalidatePath("/users");
  return { success: true };
}

export async function resetUserPermissions(id: string) {
  await requireUser([...CAN_MANAGE_USERS_ROLES]);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Utilisateur introuvable.");

  const defaultPerms = DEFAULT_ROLE_CAPABILITIES[user.role as Role] || [];

  await prisma.user.update({
    where: { id },
    data: {
      customPermissions: defaultPerms,
    },
  });

  revalidatePath("/users");
  return { success: true, count: defaultPerms.length };
}

export async function updateUserRole(formData: FormData) {
  await requireUser([...CAN_MANAGE_USERS_ROLES]);

  const id = String(formData.get("id") || "").trim();
  const role = String(formData.get("role") || "").trim() as Role;

  if (!id || !role) {
    throw new Error("ID et nouveau rôle obligatoires.");
  }

  // Mettre à jour le rôle et synchroniser les capacités par défaut
  const defaultPerms = DEFAULT_ROLE_CAPABILITIES[role] || [];

  await prisma.user.update({
    where: { id },
    data: {
      role,
      customPermissions: defaultPerms,
    },
  });

  revalidatePath("/users");
}

export async function toggleUserActive(id: string, active: boolean) {
  await requireUser([...CAN_MANAGE_USERS_ROLES]);

  await prisma.user.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/users");
}

export async function deleteUser(id: string) {
  const currentUser = await requireUser([...CAN_MANAGE_USERS_ROLES]);

  if (currentUser.id === id) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/users");
}

export async function getAdminNotifications() {
  const currentUser = await requireUser();

  const isPrivileged =
    currentUser.role === "PDG" ||
    currentUser.role === "SG" ||
    currentUser.role === "DG" ||
    currentUser.role === "ADMIN";

  if (!isPrivileged) return [];

  const notifs = await prisma.adminNotification.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
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
