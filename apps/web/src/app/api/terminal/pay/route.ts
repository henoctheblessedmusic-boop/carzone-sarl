import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { nextDocNumber } from "@/lib/format";

/** Simulate charging terminal payment (Mobile Money / card) */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const stationId = String(body.stationId || "");
  const customerId = body.customerId ? String(body.customerId) : null;
  const kwh = Number(body.kwh || 0);
  const method = body.method === "CARTE" ? "CARTE" : "MOBILE_MONEY";

  if (!stationId || kwh <= 0) {
    return NextResponse.json({ error: "stationId and kwh required" }, { status: 400 });
  }

  const station = await prisma.chargingStation.findUnique({ where: { id: stationId } });
  if (!station || !station.active) {
    return NextResponse.json({ error: "Station introuvable" }, { status: 404 });
  }

  let pricePerKwh = 125;
  if (customerId) {
    const sub = await prisma.chargingSubscription.findFirst({
      where: { customerId, active: true },
      include: { plan: true },
      orderBy: { startedAt: "desc" },
    });
    if (sub) pricePerKwh = sub.plan.kwhPriceXof;
  }

  const totalXof = Math.round(kwh * pricePerKwh);
  const chargeSession = await prisma.chargingSession.create({
    data: {
      stationId,
      customerId,
      status: "TERMINEE",
      kwhDelivered: kwh,
      pricePerKwh,
      totalXof,
      paymentMethod: method,
      paymentRef: `${method}-${Date.now()}`,
      endedAt: new Date(),
    },
  });

  const count = await prisma.chargingInvoice.count();
  const invoice = await prisma.chargingInvoice.create({
    data: {
      number: nextDocNumber("CHG", count),
      status: "PAYEE",
      customerId,
      sessionId: chargeSession.id,
      totalXof,
      paidAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    sessionId: chargeSession.id,
    invoiceNumber: invoice.number,
    pricePerKwh,
    totalXof,
    method,
  });
}
