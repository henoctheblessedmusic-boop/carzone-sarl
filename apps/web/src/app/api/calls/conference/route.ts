import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

import { PREDEFINED_ROOMS } from "@/lib/conference-rooms";

type RoomParticipant = {
  id: string;
  fullName: string;
  role: string;
  isMuted: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  joinedAt: string;
  lastPing: number;
};

// In-memory live room participants map for instant real-time sync across audio peers
const liveRoomMap = new Map<string, Map<string, RoomParticipant>>();

function getRoomParticipants(roomId: string): RoomParticipant[] {
  const pMap = liveRoomMap.get(roomId);
  if (!pMap) return [];
  const now = Date.now();
  // Filter out users that didn't ping for more than 12s
  const active: RoomParticipant[] = [];
  for (const [uid, p] of pMap.entries()) {
    if (now - p.lastPing < 12000) {
      active.push(p);
    } else {
      pMap.delete(uid);
    }
  }
  return active;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const listRooms = searchParams.get("listRooms");

  // 1. Liste des salons de conférence avec nombre de participants connectés en direct
  if (listRooms === "1") {
    const rooms = PREDEFINED_ROOMS.map((r) => {
      const activeParticipants = getRoomParticipants(r.id);
      return {
        ...r,
        participantCount: activeParticipants.length,
        participants: activeParticipants.map((p) => ({
          id: p.id,
          fullName: p.fullName,
          role: p.role,
          isMuted: p.isMuted,
        })),
        isLive: activeParticipants.length > 0,
      };
    });

    return NextResponse.json({ rooms });
  }

  // 2. Détails d'une salle spécifique
  if (roomId) {
    const roomInfo = PREDEFINED_ROOMS.find((r) => r.id === roomId) || {
      id: roomId,
      name: "Conférence Personnalisée",
      category: "CUSTOM",
      icon: "🎙️",
      description: "Session de conférence en ligne",
    };

    const participants = getRoomParticipants(roomId);

    // Récupérer la session active de la conférence en base si elle existe
    const activeSession = await prisma.callSession.findFirst({
      where: {
        receiverId: roomId,
        status: "ACCEPTED",
      },
      orderBy: { createdAt: "desc" },
    });

    let durationSeconds = 0;
    if (activeSession) {
      durationSeconds = Math.max(0, Math.round((Date.now() - new Date(activeSession.createdAt).getTime()) / 1000));
    }

    return NextResponse.json({
      room: roomInfo,
      participants,
      activeSession: activeSession
        ? {
            id: activeSession.id,
            organizerName: activeSession.callerName,
            organizerRole: activeSession.callerRole,
            startedAt: activeSession.createdAt.toISOString(),
            durationSeconds,
          }
        : null,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { action, roomId, isMuted, isSpeaking, audioLevel, inviteUserId } = body;

  if (!roomId) {
    return NextResponse.json({ error: "roomId requis" }, { status: 400 });
  }

  const roomInfo = PREDEFINED_ROOMS.find((r) => r.id === roomId) || {
    id: roomId,
    name: body.roomName || "Conférence en ligne",
    category: "CUSTOM",
  };

  // Ensure map exists
  if (!liveRoomMap.has(roomId)) {
    liveRoomMap.set(roomId, new Map());
  }
  const pMap = liveRoomMap.get(roomId)!;

  // 1. REJOINDRE LA CONFÉRENCE
  if (action === "join") {
    const now = Date.now();
    pMap.set(session.id, {
      id: session.id,
      fullName: session.fullName,
      role: session.role,
      isMuted: Boolean(isMuted),
      isSpeaking: false,
      audioLevel: 0,
      joinedAt: new Date().toISOString(),
      lastPing: now,
    });

    // Chercher ou créer une session CallSession en base pour assurer la traçabilité
    let activeSession = await prisma.callSession.findFirst({
      where: {
        receiverId: roomId,
        status: "ACCEPTED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!activeSession) {
      activeSession = await prisma.callSession.create({
        data: {
          callerId: session.id,
          callerName: session.fullName,
          callerRole: session.role,
          receiverId: roomId,
          receiverName: roomInfo.name,
          status: "ACCEPTED",
          iceCandidates: [
            {
              type: "CONFERENCE_INIT",
              organizerId: session.id,
              organizerName: session.fullName,
              roomCategory: roomInfo.category,
              joinedParticipants: [session.fullName],
            },
          ] as unknown as Prisma.InputJsonValue[],
        },
      });
    } else {
      // Ajouter le participant dans l'historique de la session
      const candidates = (Array.isArray(activeSession.iceCandidates) ? activeSession.iceCandidates : []) as Prisma.InputJsonValue[];
      candidates.push({
        type: "PARTICIPANT_JOINED",
        userId: session.id,
        userName: session.fullName,
        userRole: session.role,
        time: new Date().toISOString(),
      } as unknown as Prisma.InputJsonValue);

      await prisma.callSession.update({
        where: { id: activeSession.id },
        data: { iceCandidates: candidates },
      });
    }

    return NextResponse.json({
      success: true,
      sessionId: activeSession.id,
      participants: getRoomParticipants(roomId),
    });
  }

  // 2. HEARTBEAT / PING DE PRÉSENCE & NIVEAU AUDIO
  if (action === "ping") {
    const existing = pMap.get(session.id);
    if (existing) {
      existing.lastPing = Date.now();
      if (typeof isMuted === "boolean") existing.isMuted = isMuted;
      if (typeof isSpeaking === "boolean") existing.isSpeaking = isSpeaking;
      if (typeof audioLevel === "number") existing.audioLevel = audioLevel;
    } else {
      pMap.set(session.id, {
        id: session.id,
        fullName: session.fullName,
        role: session.role,
        isMuted: Boolean(isMuted),
        isSpeaking: Boolean(isSpeaking),
        audioLevel: Number(audioLevel) || 0,
        joinedAt: new Date().toISOString(),
        lastPing: Date.now(),
      });
    }

    return NextResponse.json({
      success: true,
      participants: getRoomParticipants(roomId),
    });
  }

  // 3. QUITTER LA CONFÉRENCE
  if (action === "leave") {
    pMap.delete(session.id);
    const remaining = getRoomParticipants(roomId);

    // Si plus personne dans la salle, clôturer la session CallSession et enregistrer la durée
    if (remaining.length === 0) {
      const activeSession = await prisma.callSession.findFirst({
        where: {
          receiverId: roomId,
          status: "ACCEPTED",
        },
        orderBy: { createdAt: "desc" },
      });

      if (activeSession) {
        const durationSeconds = Math.max(1, Math.round((Date.now() - new Date(activeSession.createdAt).getTime()) / 1000));
        const candidates = (Array.isArray(activeSession.iceCandidates) ? activeSession.iceCandidates : []) as Prisma.InputJsonValue[];
        candidates.push({
          type: "CALL_SUMMARY",
          durationSeconds,
          wasAnswered: true,
          isConference: true,
          endedAt: new Date().toISOString(),
        } as unknown as Prisma.InputJsonValue);

        await prisma.callSession.update({
          where: { id: activeSession.id },
          data: {
            status: "ENDED",
            iceCandidates: candidates,
          },
        });
      }
    }

    return NextResponse.json({ success: true, remainingCount: remaining.length });
  }

  // 4. CLÔTURER LA CONFÉRENCE (DIRECTEUR / ADMIN / ORGANISATEUR)
  if (action === "close") {
    const isPrivileged =
      session.role === "DEVELOPER" ||
      session.role === "PDG" ||
      session.role === "SG" ||
      session.role === "DG" ||
      session.role === "ADMIN";

    const activeSession = await prisma.callSession.findFirst({
      where: {
        receiverId: roomId,
        status: "ACCEPTED",
      },
      orderBy: { createdAt: "desc" },
    });

    const isOrganizer = activeSession?.callerId === session.id;

    if (!isPrivileged && !isOrganizer) {
      return NextResponse.json(
        { error: "Seul l'organisateur ou un membre de la Direction peut clôturer cette conférence" },
        { status: 403 }
      );
    }

    pMap.clear();

    if (activeSession) {
      const durationSeconds = Math.max(1, Math.round((Date.now() - new Date(activeSession.createdAt).getTime()) / 1000));
      const candidates = (Array.isArray(activeSession.iceCandidates) ? activeSession.iceCandidates : []) as Prisma.InputJsonValue[];
      candidates.push({
        type: "CALL_SUMMARY",
        durationSeconds,
        wasAnswered: true,
        isConference: true,
        closedBy: session.fullName,
        endedAt: new Date().toISOString(),
      } as unknown as Prisma.InputJsonValue);

      await prisma.callSession.update({
        where: { id: activeSession.id },
        data: {
          status: "ENDED",
          iceCandidates: candidates,
        },
      });
    }

    return NextResponse.json({ success: true, closed: true });
  }

  // 5. INVITER UN COLLÈGUE DANS LA CONFÉRENCE
  if (action === "invite" && inviteUserId) {
    const targetUser = await prisma.user.findUnique({ where: { id: inviteUserId } });
    if (targetUser) {
      // Envoyer un message direct pour inviter avec lien cliquable
      await prisma.chatMessage.create({
        data: {
          senderId: session.id,
          senderName: session.fullName,
          senderRole: session.role,
          receiverId: targetUser.id,
          channel: "DIRECT",
          content: `🎙️ ${session.fullName} vous invite à rejoindre la conférence audio en ligne : « ${roomInfo.name} ». Cliquez sur l'onglet Conférence pour vous connecter !`,
          sticker: "📞",
          isBroadcast: false,
          reactions: {},
        },
      });
    }

    return NextResponse.json({ success: true, invited: true });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
