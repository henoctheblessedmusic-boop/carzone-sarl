import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isDriverActivityNotificationRole,
  isFullActivityNotificationRole,
  isGarageActivityNotificationRole,
} from "@/lib/notification-policy";

function visibilityFilter(session: { id: string; role: string }) {
  const fullScope = isFullActivityNotificationRole(session.role);
  const garageScope = isGarageActivityNotificationRole(session.role);
  const driverScope = isDriverActivityNotificationRole(session.role);
  if (!fullScope && !garageScope && !driverScope) return null;

  const scope = fullScope
    ? { type: { notIn: ["LOGIN_ALERT", "RATE_LIMIT_ALERT"] } }
    : driverScope
      ? { type: "DRIVER_PAYMENT" }
      : { type: "ACTIVITY_GARAGE" };
  return {
    ...scope,
    OR: [{ userId: null }, { userId: { not: session.id } }],
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const where = visibilityFilter(session);
  if (!where) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  const notifications = await prisma.adminNotification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 35,
  });

  const unreadCount = notifications.filter((n) => !n.readBy.includes(session.id)).length;

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      userName: n.userName,
      oldValue: n.oldValue,
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
  const where = visibilityFilter(session);
  if (!where) {
    return NextResponse.json({ success: true });
  }

  if (action === "mark_read" && id) {
    const notif = await prisma.adminNotification.findFirst({ where: { ...where, id } });
    if (notif && !notif.readBy.includes(session.id)) {
      await prisma.adminNotification.update({
        where: { id },
        data: { readBy: { push: session.id } },
      });
    }
  } else if (action === "mark_all_read") {
    const notifs = await prisma.adminNotification.findMany({ where });
    for (const n of notifs) {
      if (!n.readBy.includes(session.id)) {
        await prisma.adminNotification.update({
          where: { id: n.id },
          data: { readBy: { push: session.id } },
        });
      }
    }
  }

  return NextResponse.json({ success: true });
}
