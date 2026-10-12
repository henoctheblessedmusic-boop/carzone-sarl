import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const isPrivileged =
    session.role === "PDG" ||
    session.role === "SG" ||
    session.role === "DG" ||
    session.role === "ADMIN";

  if (!isPrivileged) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  const notifications = await prisma.adminNotification.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
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
      newValue: n.newValue,
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
