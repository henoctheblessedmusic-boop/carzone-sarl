import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return (req as unknown as { ip?: string }).ip || "127.0.0.1";
}

export async function POST(req: NextRequest) {
  let email = "";
  let password = "";
  const isJson = req.headers.get("content-type")?.includes("application/json");

  if (isJson) {
    const body = await req.json().catch(() => ({}));
    email = String(body.email || "");
    password = String(body.password || "");
  } else {
    const form = await req.formData();
    email = String(form.get("email") || "");
    password = String(form.get("password") || "");
  }

  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || "Navigateur Web";

  const result = await authenticate(email, password, { ip, userAgent });

  if (isJson) {
    return NextResponse.json(result);
  }

  if (!result.success) {
    if (result.error === "LOCKED") {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "locked");
      url.searchParams.set("sec", String(result.remainingSeconds));
      url.searchParams.set("stage", String(result.lockoutStage));
      if (result.label) url.searchParams.set("label", result.label);
      url.searchParams.set("email", email);
      return NextResponse.redirect(url);
    }

    if (result.error === "INVALID_CREDENTIALS") {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "invalid");
      url.searchParams.set("remaining", String(result.remainingAttempts));
      url.searchParams.set("email", email);
      return NextResponse.redirect(url);
    }

    if (result.error === "INACTIVE") {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "inactive");
      url.searchParams.set("email", email);
      return NextResponse.redirect(url);
    }

    return NextResponse.redirect(new URL("/login?error=1", req.url));
  }

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
