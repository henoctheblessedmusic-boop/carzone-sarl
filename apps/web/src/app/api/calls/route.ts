import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Module-level throttle map to avoid excessive DB writes (write max once every 12s per user)
const lastHeartbeatMap = new Map<string, number>();

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const checkIncoming = searchParams.get("check_incoming");
  const callId = searchParams.get("call_id");
  const history = searchParams.get("history");
  const scope = searchParams.get("scope"); // "me" | "all"

  // Heartbeat presence tracker
  const now = Date.now();
  const lastWrite = lastHeartbeatMap.get(session.id) || 0;
  if (now - lastWrite > 12000) {
    lastHeartbeatMap.set(session.id, now);
    prisma.user
      .update({
        where: { id: session.id },
        data: { lastSeenAt: new Date() },
      })
      .catch(() => {});
  }

  // 1. Check if someone is currently calling this user + missed call counter
  if (checkIncoming === "1") {
    const activeCall = await prisma.callSession.findFirst({
      where: {
        receiverId: session.id,
        status: "RINGING",
      },
      orderBy: { createdAt: "desc" },
    });

    // Count missed calls in the last 24h
    const sinceYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMissed = await prisma.callSession.findMany({
      where: {
        receiverId: session.id,
        status: { in: ["ENDED", "REJECTED"] },
        createdAt: { gte: sinceYesterday },
      },
      select: { iceCandidates: true, status: true },
    });

    let missedCount = 0;
    for (const c of recentMissed) {
      let wasAnswered = false;
      let acknowledged = false;
      if (Array.isArray(c.iceCandidates)) {
        for (const item of c.iceCandidates) {
          if (item && typeof item === "object") {
            const meta = item as Record<string, unknown>;
            if (meta.type === "CALL_SUMMARY") {
              if (meta.wasAnswered) wasAnswered = true;
              if (meta.acknowledgedByReceiver) acknowledged = true;
            }
          }
        }
      }
      if (!wasAnswered && !acknowledged) {
        missedCount++;
      }
    }

    return NextResponse.json({
      incomingCall: activeCall || null,
      missedCount,
    });
  }

  // 2. Historique des appels et des conférences (Traçabilité pour le Directeur et l'utilisateur)
  if (history === "1") {
    const isPrivileged =
      session.role === "DEVELOPER" ||
      session.role === "PDG" ||
      session.role === "SG" ||
      session.role === "DG" ||
      session.role === "ADMIN";

    const fetchAll = isPrivileged && scope === "all";

    const whereClause: Prisma.CallSessionWhereInput = fetchAll
      ? {}
      : {
          OR: [
            { callerId: session.id },
            { receiverId: session.id },
            { receiverId: { startsWith: "CONF_" } },
          ],
        };

    const calls = await prisma.callSession.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    let unreadMissedCount = 0;

    const list = calls.map((c) => {
      let durationSeconds = 0;
      let wasAnswered = c.status === "ACCEPTED";
      let isConference = c.receiverId.startsWith("CONF_");

      if (Array.isArray(c.iceCandidates)) {
        for (const item of c.iceCandidates) {
          if (item && typeof item === "object") {
            const meta = item as Record<string, unknown>;
            if (meta.type === "CALL_SUMMARY") {
              if (typeof meta.durationSeconds === "number") durationSeconds = meta.durationSeconds;
              if (typeof meta.wasAnswered === "boolean") wasAnswered = meta.wasAnswered;
              if (typeof meta.isConference === "boolean") isConference = meta.isConference;
            }
          }
        }
      }

      // Si l'appel a été accepté et qu'aucune durée n'a été sérialisée (ex: coupure réseau), estimer depuis les timestamps
      if (!durationSeconds && wasAnswered) {
        durationSeconds = Math.max(1, Math.round((new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / 1000));
      }

      let callType: "MISSED" | "INCOMING" | "OUTGOING" | "CONFERENCE" = "OUTGOING";

      if (isConference) {
        callType = "CONFERENCE";
      } else if (c.callerId === session.id) {
        callType = "OUTGOING";
      } else {
        if (!wasAnswered && (c.status === "ENDED" || c.status === "REJECTED")) {
          callType = "MISSED";
          unreadMissedCount++;
        } else {
          callType = "INCOMING";
        }
      }

      return {
        id: c.id,
        callType,
        callerId: c.callerId,
        callerName: c.callerName,
        callerRole: c.callerRole,
        receiverId: c.receiverId,
        receiverName: c.receiverName,
        status: c.status,
        durationSeconds,
        isConference,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      history: list,
      missedCount: unreadMissedCount,
      isPrivileged,
    });
  }

  // 3. Get specific call details (Sécurisation IDOR)
  if (callId) {
    const call = await prisma.callSession.findUnique({
      where: { id: callId },
    });
    if (!call) return NextResponse.json({ call: null });

    const isPrivileged =
      session.role === "DEVELOPER" ||
      session.role === "PDG" ||
      session.role === "SG" ||
      session.role === "DG" ||
      session.role === "ADMIN";

    const isParticipant =
      call.callerId === session.id ||
      call.receiverId === session.id ||
      call.receiverId.startsWith("CONF_");

    if (!isParticipant && !isPrivileged) {
      return NextResponse.json({ error: "Accès refusé à cet appel" }, { status: 403 });
    }

    return NextResponse.json({ call });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { action, receiverId, callId, sdp, candidate, durationSeconds } = body;

  // 1. Démarrer un appel vers un collègue
  if (action === "start") {
    // Si un callId est fourni pour mettre à jour l'offre SDP d'un appel en cours
    if (callId) {
      const existing = await prisma.callSession.findUnique({ where: { id: callId } });
      if (existing && existing.callerId === session.id) {
        const updated = await prisma.callSession.update({
          where: { id: callId },
          data: { offerSdp: sdp || existing.offerSdp },
        });
        return NextResponse.json({ success: true, call: updated });
      }
    }

    if (!receiverId) {
      return NextResponse.json({ error: "receiverId requis" }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return NextResponse.json({ error: "Destinataire introuvable" }, { status: 404 });
    }

    // Terminer d'éventuels anciens appels pendants
    await prisma.callSession.updateMany({
      where: {
        OR: [{ callerId: session.id }, { receiverId: session.id }],
        status: "RINGING",
      },
      data: { status: "ENDED" },
    });

    const newCall = await prisma.callSession.create({
      data: {
        callerId: session.id,
        callerName: session.fullName,
        callerRole: session.role,
        receiverId: receiver.id,
        receiverName: receiver.fullName,
        status: "RINGING",
        offerSdp: sdp || null,
        iceCandidates: [],
      },
    });

    return NextResponse.json({ success: true, call: newCall });
  }

  // 2. Décrocher l'appel (Accept) - Vérification stricte
  if (action === "accept" && callId) {
    const existing = await prisma.callSession.findUnique({ where: { id: callId } });
    if (!existing) {
      return NextResponse.json({ error: "Appel introuvable" }, { status: 404 });
    }
    if (existing.receiverId !== session.id && !existing.receiverId.startsWith("CONF_")) {
      return NextResponse.json({ error: "Non autorisé à décrocher cet appel" }, { status: 403 });
    }

    const updated = await prisma.callSession.update({
      where: { id: callId },
      data: {
        status: "ACCEPTED",
        answerSdp: sdp || null,
      },
    });
    return NextResponse.json({ success: true, call: updated });
  }

  // 3. Refuser l'appel (Reject) - Vérification stricte
  if (action === "reject" && callId) {
    const existing = await prisma.callSession.findUnique({ where: { id: callId } });
    if (!existing) {
      return NextResponse.json({ error: "Appel introuvable" }, { status: 404 });
    }
    if (existing.receiverId !== session.id && existing.callerId !== session.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const candidates = (Array.isArray(existing?.iceCandidates) ? existing.iceCandidates : []) as Prisma.InputJsonValue[];
    candidates.push({
      type: "CALL_SUMMARY",
      durationSeconds: 0,
      wasAnswered: false,
      endedReason: "REJECTED",
      endedAt: new Date().toISOString(),
    } as unknown as Prisma.InputJsonValue);

    const updated = await prisma.callSession.update({
      where: { id: callId },
      data: {
        status: "REJECTED",
        iceCandidates: candidates,
      },
    });
    return NextResponse.json({ success: true, call: updated });
  }

  // 4. Raccrocher / Terminer l'appel (End avec vérification d'autorisation)
  if (action === "end" && callId) {
    const existing = await prisma.callSession.findUnique({ where: { id: callId } });
    if (!existing) {
      return NextResponse.json({ error: "Appel introuvable" }, { status: 404 });
    }

    const isPrivileged =
      session.role === "DEVELOPER" ||
      session.role === "PDG" ||
      session.role === "SG" ||
      session.role === "DG" ||
      session.role === "ADMIN";

    const isParticipant =
      existing.callerId === session.id ||
      existing.receiverId === session.id ||
      existing.receiverId.startsWith("CONF_");

    if (!isParticipant && !isPrivileged) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    let duration = Number(durationSeconds) || 0;
    const wasAnswered = existing.status === "ACCEPTED";
    if (!duration && wasAnswered) {
      duration = Math.max(1, Math.round((Date.now() - new Date(existing.updatedAt).getTime()) / 1000));
    }

    const candidates = (Array.isArray(existing.iceCandidates) ? existing.iceCandidates : []) as Prisma.InputJsonValue[];
    candidates.push({
      type: "CALL_SUMMARY",
      durationSeconds: duration,
      wasAnswered,
      endedReason: wasAnswered ? "NORMAL" : "MISSED",
      endedAt: new Date().toISOString(),
      endedBy: session.id,
    } as unknown as Prisma.InputJsonValue);

    const updated = await prisma.callSession.update({
      where: { id: callId },
      data: {
        status: "ENDED",
        iceCandidates: candidates,
      },
    });
    return NextResponse.json({ success: true, call: updated });
  }

  // 5. Envoyer candidat ICE (Vérification de participation)
  if (action === "candidate" && callId && candidate) {
    const call = await prisma.callSession.findUnique({ where: { id: callId } });
    if (call) {
      if (call.callerId !== session.id && call.receiverId !== session.id && !call.receiverId.startsWith("CONF_")) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }
      const candidates = (Array.isArray(call.iceCandidates) ? call.iceCandidates : []) as Prisma.InputJsonValue[];
      candidates.push({ candidate, senderId: session.id } as unknown as Prisma.InputJsonValue);
      await prisma.callSession.update({
        where: { id: callId },
        data: { iceCandidates: candidates },
      });
    }
    return NextResponse.json({ success: true });
  }

  // 6. Marquer les appels en absence comme consultés
  if (action === "mark_missed_read") {
    const recentMissed = await prisma.callSession.findMany({
      where: {
        receiverId: session.id,
        status: { in: ["ENDED", "REJECTED"] },
      },
      take: 20,
    });

    for (const c of recentMissed) {
      const candidates = (Array.isArray(c.iceCandidates) ? c.iceCandidates : []) as Prisma.InputJsonValue[];
      candidates.push({
        type: "CALL_SUMMARY",
        acknowledgedByReceiver: true,
      } as unknown as Prisma.InputJsonValue);

      await prisma.callSession.update({
        where: { id: c.id },
        data: { iceCandidates: candidates },
      });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
}
