import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [stations, rawCustomers] = await Promise.all([
    prisma.chargingStation.findMany({
      where: { active: true },
      select: {
        id: true,
        code: true,
        name: true,
        address: true,
        powerKw: true,
      },
      orderBy: { code: "asc" },
    }),
    prisma.customer.findMany({
      where: { active: true },
      select: {
        id: true,
        contactName: true,
        companyName: true,
        phone: true,
        subscriptions: {
          where: { active: true },
          select: {
            plan: {
              select: {
                name: true,
                kwhPriceXof: true,
              },
            },
          },
        },
      },
      orderBy: { contactName: "asc" },
    }),
  ]);

  const customers = rawCustomers.map((c) => {
    const sub = c.subscriptions[0];
    return {
      id: c.id,
      contactName: c.contactName,
      companyName: c.companyName,
      phone: c.phone,
      isSubscriber: Boolean(sub),
      planName: sub?.plan.name || null,
      kwhPriceXof: sub?.plan.kwhPriceXof || 125,
    };
  });

  return NextResponse.json({ stations, customers, publicPricePerKwh: 125 });
}
