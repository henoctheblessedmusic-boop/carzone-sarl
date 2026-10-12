import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Récupérer les messages directs récents et diffusions destinés à l'utilisateur
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const candidates = await prisma.chatMessage.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        OR: [
          { receiverId: session.id },
          { isBroadcast: true, senderId: { not: session.id } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const bySender: Record<string, number> = {};
    let broadcastUnread = 0;
    let latestUnread: (typeof candidates)[0] | null = null;

    for (const msg of candidates) {
      const reactions = (msg.reactions as Record<string, unknown>) || {};
      const readBy = Array.isArray(reactions.readBy) ? (reactions.readBy as string[]) : [];
      const isUnread = !readBy.includes(session.id);

      if (isUnread) {
        if (!latestUnread) {
          latestUnread = msg;
        }

        if (msg.isBroadcast) {
          broadcastUnread++;
        } else if (msg.senderId) {
          bySender[msg.senderId] = (bySender[msg.senderId] || 0) + 1;
        }
      }
    }

    const totalDirectUnread = Object.values(bySender).reduce((a, b) => a + b, 0);
    const unreadCount = totalDirectUnread + broadcastUnread;

    return NextResponse.json({
      unreadCount,
      totalDirectUnread,
      broadcastUnread,
      bySender,
      latestMessage: latestUnread
        ? {
            id: latestUnread.id,
            senderId: latestUnread.senderId,
            senderName: latestUnread.senderName,
            content: latestUnread.content,
            sticker: latestUnread.sticker,
            isBroadcast: latestUnread.isBroadcast,
            createdAt: latestUnread.createdAt.toISOString(),
          }
        : null,
    });
  } catch (err) {
    console.error("Error fetching unread chat messages:", err);
    return NextResponse.json({ unreadCount: 0, bySender: {}, broadcastUnread: 0, latestMessage: null });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { peerId, markAllBroadcast } = body;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (peerId) {
      // Marquer comme lus les messages directs envoyés par ce pair
      const msgs = await prisma.chatMessage.findMany({
        where: {
          senderId: peerId,
          receiverId: session.id,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      for (const m of msgs) {
        const reactions = (m.reactions as Record<string, unknown>) || {};
        const readBy = Array.isArray(reactions.readBy) ? [...(reactions.readBy as string[])] : [];
        if (!readBy.includes(session.id)) {
          readBy.push(session.id);
          await prisma.chatMessage.update({
            where: { id: m.id },
            data: { reactions: { ...reactions, readBy } },
          });
        }
      }
    }

    if (markAllBroadcast) {
      // Marquer comme lues les annonces DG
      const msgs = await prisma.chatMessage.findMany({
        where: {
          isBroadcast: true,
          senderId: { not: session.id },
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      });

      for (const m of msgs) {
        const reactions = (m.reactions as Record<string, unknown>) || {};
        const readBy = Array.isArray(reactions.readBy) ? [...(reactions.readBy as string[])] : [];
        if (!readBy.includes(session.id)) {
          readBy.push(session.id);
          await prisma.chatMessage.update({
            where: { id: m.id },
            data: { reactions: { ...reactions, readBy } },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    return NextResponse.json({ error: "Erreur marquage lu" }, { status: 500 });
  }
}
