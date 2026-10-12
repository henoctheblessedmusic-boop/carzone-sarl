import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const user = await login(email, password);
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=1", req.url));
  }
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
