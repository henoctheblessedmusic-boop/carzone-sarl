"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";

export async function sendChatMessage(data: {
  receiverId?: string | null;
  channel?: string | null;
  content: string;
  sticker?: string | null;
  isBroadcast?: boolean;
  recipientIds?: string[];
}) {
  const currentUser = await requireUser();

  const content = (data.content || "").trim();
  const sticker = data.sticker || null;

  if (!content && !sticker) {
    throw new Error("Le message ne peut pas être vide.");
  }

  // Si c'est une diffusion générale du DG ou Admin
  const isPrivileged =
    currentUser.role === "PDG" ||
    currentUser.role === "SG" ||
    currentUser.role === "DG" ||
    currentUser.role === "ADMIN";

  const isBroadcast = Boolean(data.isBroadcast && isPrivileged);
  const recipientIds = Array.isArray(data.recipientIds) ? data.recipientIds : [];

  const created = await prisma.chatMessage.create({
    data: {
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      receiverId: data.receiverId || null,
      channel: data.channel || (isBroadcast ? "BROADCAST" : "GENERAL"),
      content: content || "",
      sticker,
      isBroadcast,
      recipientIds,
      reactions: {},
    },
  });

  // Si c'est une diffusion, créer une notification pour alerter la flotte
  if (isBroadcast) {
    try {
      await prisma.adminNotification.create({
        data: {
          type: "BROADCAST",
          title: `📢 Annonce Direction (${currentUser.fullName})`,
          message:
            recipientIds.length > 0
              ? `Diffusion ciblée (${recipientIds.length} destinataires) : ${content.slice(0, 100)}`
              : `Diffusion générale à tous : ${content.slice(0, 100)}`,
          userId: currentUser.id,
          userName: currentUser.fullName,
          readBy: [currentUser.id],
        },
      });
    } catch {
      // Ignorer si la table de notif est occupée
    }
  }

  revalidatePath("/chat");
  return {
    success: true,
    messageId: created.id,
  };
}

export async function toggleMessageReaction(messageId: string, emoji: string) {
  const currentUser = await requireUser();

  const msg = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!msg) throw new Error("Message introuvable.");

  const reactions = (msg.reactions as Record<string, string[]>) || {};
  const currentUsers = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];

  if (currentUsers.includes(currentUser.id)) {
    // Retirer la réaction
    reactions[emoji] = currentUsers.filter((id) => id !== currentUser.id);
    if (reactions[emoji].length === 0) {
      delete reactions[emoji];
    }
  } else {
    // Ajouter la réaction
    reactions[emoji] = [...currentUsers, currentUser.id];
  }

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: { reactions },
  });

  revalidatePath("/chat");
  return { success: true };
}

export async function getChatMessages(params: {
  channel?: string;
  peerId?: string;
}) {
  const currentUser = await requireUser();

  let whereClause = {};

  if (params.peerId) {
    // Discussion directe 1 à 1
    whereClause = {
      OR: [
        { senderId: currentUser.id, receiverId: params.peerId },
        { senderId: params.peerId, receiverId: currentUser.id },
      ],
    };
  } else if (params.channel === "BROADCAST") {
    // Diffusions reçues ou émises:
    // 1. Soit l'utilisateur est l'émetteur (DG/PDG/SG/ADMIN)
    // 2. Soit diffusion à TOUS (recipientIds est vide)
    // 3. Soit diffusion ciblée contenant currentUser.id
    whereClause = {
      isBroadcast: true,
      OR: [
        { senderId: currentUser.id },
        { recipientIds: { isEmpty: true } },
        { recipientIds: { has: currentUser.id } },
      ],
    };
  } else {
    // Canaux d'équipe publics (GENERAL, WORKSHOP, COMMERCIAL...)
    const ch = params.channel || "GENERAL";
    whereClause = {
      channel: ch,
      receiverId: null,
      isBroadcast: false,
    };
  }

  const messages = await prisma.chatMessage.findMany({
    where: whereClause,
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return messages.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    senderName: m.senderName,
    senderRole: m.senderRole,
    receiverId: m.receiverId,
    channel: m.channel,
    content: m.content,
    sticker: m.sticker,
    reactions: (m.reactions as Record<string, string[]>) || {},
    isBroadcast: m.isBroadcast,
    recipientIds: m.recipientIds,
    createdAt: m.createdAt.toISOString(),
  }));
}

export type ColleaguePresence = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: "ONLINE" | "AWAY" | "OFFLINE";
  lastSeenAt: string | null;
};

export async function getColleagues(): Promise<ColleaguePresence[]> {
  const currentUser = await requireUser();

  // Keep current user alive
  prisma.user
    .update({
      where: { id: currentUser.id },
      data: { lastSeenAt: new Date() },
    })
    .catch(() => {});

  const users = await prisma.user.findMany({
    where: { active: true },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      lastSeenAt: true,
    },
    orderBy: { fullName: "asc" },
  });

  const now = Date.now();

  return users
    .filter((u) => u.id !== currentUser.id)
    .map((u) => {
      const diff = u.lastSeenAt ? now - new Date(u.lastSeenAt).getTime() : Infinity;
      let status: "ONLINE" | "AWAY" | "OFFLINE" = "OFFLINE";
      if (diff < 25000) {
        status = "ONLINE";
      } else if (diff < 120000) {
        status = "AWAY";
      } else {
        status = "OFFLINE";
      }

      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        status,
        lastSeenAt: u.lastSeenAt ? u.lastSeenAt.toISOString() : null,
      };
    });
}
