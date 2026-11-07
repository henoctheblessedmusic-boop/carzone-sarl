import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiPermissionDenied, apiUnauthorized, getApiUser, hasApiPermission } from "@/lib/api-auth";

export async function GET() {
  const session = await getApiUser();
  if (!session) return apiUnauthorized();
  if (!hasApiPermission(session, "charging:read")) return apiPermissionDenied();

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
