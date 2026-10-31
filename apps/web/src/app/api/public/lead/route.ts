import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/** Capture publique d'une demande de cotation depuis la vitrine (leads). */
const quoteRequestSchema = z.object({
  contactName: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional().default(""),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .default("")
    .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value), {
      message: "invalid_email",
    }),
  vehicleInterest: z.string().trim().max(200).optional().default(""),
  energyPref: z.string().trim().max(40).optional().default(""),
  notes: z.string().trim().max(1500).optional().default(""),
});

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestLog = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestLog.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const parsed = quoteRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    const { contactName, phone, email, vehicleInterest, energyPref, notes } = parsed.data;
    if (!phone.trim() && !email.trim()) {
      return NextResponse.json({ error: "missing_contact" }, { status: 400 });
    }

    const interest = vehicleInterest.trim() || "Demande générale";

    const lead = await prisma.lead.create({
      data: {
        contactName,
        phone: phone.trim() || null,
        email: email.trim() || null,
        interest,
        energyPref: energyPref.trim() || null,
        notes: notes.trim() || null,
        source: "site_web_cotation",
        status: "NEW",
      },
    });

    try {
      await prisma.adminNotification.create({
        data: {
          type: "LEAD_WEB",
          title: "Nouvelle demande de cotation sur le site",
          message: `${contactName} (${phone.trim() || email.trim()}) souhaite une cotation pour : ${interest}.`,
          userName: contactName,
          newValue: interest,
          readBy: [],
        },
      });
    } catch {
      // La notification est facultative : la demande de cotation reste enregistrée.
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error(
      "Erreur création lead public:",
      error instanceof Error ? error.message : "unknown_error",
    );
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
