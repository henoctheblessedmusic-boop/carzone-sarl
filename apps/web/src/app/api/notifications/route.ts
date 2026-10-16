import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const isPrivileged =
    session.role === "DEVELOPER" ||
    session.role === "PDG" ||
    session.role === "SG" ||
    session.role === "DG" ||
    session.role === "ADMIN";

  if (!isPrivileged) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  const isDev = session.role === "DEVELOPER";

  // Confidentialité : Seul le Développeur a accès à l'ensemble des alertes de connexion furtives et de sécurité
  const notifications = await prisma.adminNotification.findMany({
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

  const unreadCount = notifications.filter(
    (n) => !n.readBy.includes(session.id)
  ).length;

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      userName: n.userName,
      oldValue: n.oldValue, // Stocke l'adresse IP
      newValue: n.newValue, // Stocke le User-Agent ou le détail
      isRead: n.readBy.includes(session.id),
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  });

}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { action, id } = body;

  if (action === "mark_read" && id) {
    const notif = await prisma.adminNotification.findUnique({ where: { id } });
    if (notif && !notif.readBy.includes(session.id)) {
      await prisma.adminNotification.update({
        where: { id },
        data: {
          readBy: { push: session.id },
        },
      });
    }
  } else if (action === "mark_all_read") {
    const notifs = await prisma.adminNotification.findMany();
    for (const n of notifs) {
      if (!n.readBy.includes(session.id)) {
        await prisma.adminNotification.update({
          where: { id: n.id },
          data: {
            readBy: { push: session.id },
          },
        });
      }
    }
  }

  return NextResponse.json({ success: true });
}
