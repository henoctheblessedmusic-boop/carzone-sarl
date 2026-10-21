import { NextRequest, NextResponse } from "next/server";
import { RoleService } from "@/lib/role-service";
import type { Role } from "@/lib/roles";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/api/auth/login",
  "/api/public",
  "/api/vapi/webhook",
  "/brand",
  "/images",
  "/favicon.ico",
  "/robots.txt",
];

async function verifyHmac(body: string, sig: string, secret: string): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Décodage base64url vers Uint8Array
    const base64 = sig.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const bin = atob(pad);
    const sigBytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      sigBytes[i] = bin.charCodeAt(i);
    }

    return await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(body));
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Ignorer les fichiers statiques internes Next.js et assets web
  const STATIC_FILE_REGEX = /\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|webp|json|txt|xml|map)$/i;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    STATIC_FILE_REGEX.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Autoriser les chemins publics
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  const cookie = req.cookies.get("carzone_session")?.value;
  const secret = process.env.AUTH_SECRET || "carzone-giani-prod-auth-secret-key-2026-cuid";

  let isAuthenticated = false;
  let userRole = "";

  if (cookie) {
    const [body, sig] = cookie.split(".");
    if (body && sig) {
      const valid = await verifyHmac(body, sig, secret);
      if (valid) {
        try {
          const pad = body.replace(/-/g, "+").replace(/_/g, "/");
          const padded = pad.padEnd(pad.length + (4 - (pad.length % 4)) % 4, "=");
          const payload = JSON.parse(atob(padded));
          if (payload && payload.id && payload.role) {
            const nowSeconds = Math.floor(Date.now() / 1000);
            if (!payload.exp || payload.exp > nowSeconds) {
              isAuthenticated = true;
              userRole = payload.role;
            }
          }
        } catch {
          // Token malformé
        }
      }
    }
  }

  // 3. Si l'utilisateur est déjà connecté et va sur /login -> rediriger vers /dashboard
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 4. Si l'utilisateur est connecté mais que son rôle n'est pas autorisé pour cette page -> /dashboard
  if (isAuthenticated && userRole && !RoleService.isRouteAllowed(userRole as Role, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 5. Si la route n'est pas publique et que l'utilisateur n'est pas authentifié -> /login
  if (!isPublic && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    const res = NextResponse.redirect(loginUrl);
    // Supprimer le cookie invalide s'il existait
    if (cookie) {
      res.cookies.delete("carzone_session");
    }
    return res;
  }

  // 5. Appliquer les en-têtes de sécurité HTTP
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(self), geolocation=(), interest-cohort=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Matcher toutes les routes de l'application sauf :
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
