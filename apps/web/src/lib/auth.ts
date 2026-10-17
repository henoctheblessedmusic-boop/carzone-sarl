import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role } from "./roles";

const COOKIE = "carzone_session";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  customPermissions?: string[];
};

export type SessionPayload = SessionUser & {
  iat?: number;
  exp?: number;
};

function secret() {
  return process.env.AUTH_SECRET || "carzone-giani-prod-auth-secret-key-2026-cuid";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function createSession(user: SessionUser) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    ...user,
    iat: now,
    exp: now + 60 * 60 * 24 * 14, // 14 jours de validité maximale
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const token = `${body}.${sign(body)}`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const raw = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!raw || !raw.id || !raw.role) return null;

    // Vérifier l'expiration interne
    const now = Math.floor(Date.now() / 1000);
    if (raw.exp && raw.exp < now) {
      return null;
    }

    return {
      id: raw.id,
      email: raw.email,
      fullName: raw.fullName,
      role: raw.role,
      customPermissions: raw.customPermissions || [],
    };
  } catch {
    return null;
  }
}

export async function requireSession(roles?: Role[]) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  const isSuperAdmin =
    session.role === "DEVELOPER" ||
    session.role === "DG" ||
    session.role === "PDG" ||
    session.role === "SG";
  if (roles && !roles.includes(session.role) && !isSuperAdmin) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulLogin,
  normalizeEmail,
} from "./rate-limiter";

export type AuthResult =
  | { success: true; user: SessionUser }
  | {
      success: false;
      error: "LOCKED";
      remainingSeconds: number;
      lockoutStage: number;
      label?: string;
    }
  | {
      success: false;
      error: "INVALID_CREDENTIALS";
      remainingAttempts: number;
    }
  | {
      success: false;
      error: "INACTIVE";
    };

export async function authenticate(
  rawEmail: string,
  password: string,
  meta?: { ip?: string; userAgent?: string }
): Promise<AuthResult> {
  const email = normalizeEmail(rawEmail);
  const ip = meta?.ip || "127.0.0.1";
  const userAgent = meta?.userAgent || "";

  // 1. Vérification préalable du Rate Limiting
  const limitStatus = await checkRateLimit(email, ip);
  if (limitStatus.isLocked) {
    return {
      success: false,
      error: "LOCKED",
      remainingSeconds: limitStatus.remainingSeconds,
      lockoutStage: limitStatus.lockoutStage,
      label: limitStatus.label,
    };
  }

  // 2. Recherche de l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const failed = await recordFailedAttempt(email, ip, userAgent);
    if (failed.isLockedNow) {
      return {
        success: false,
        error: "LOCKED",
        remainingSeconds: failed.remainingSeconds || 60,
        lockoutStage: failed.stage,
        label: failed.durationLabel,
      };
    }
    return {
      success: false,
      error: "INVALID_CREDENTIALS",
      remainingAttempts: failed.remainingAttempts,
    };
  }

  if (!user.active) {
    return { success: false, error: "INACTIVE" };
  }

  // 3. Vérification du mot de passe
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    const failed = await recordFailedAttempt(email, ip, userAgent);
    if (failed.isLockedNow) {
      return {
        success: false,
        error: "LOCKED",
        remainingSeconds: failed.remainingSeconds || 60,
        lockoutStage: failed.stage,
        label: failed.durationLabel,
      };
    }
    return {
      success: false,
      error: "INVALID_CREDENTIALS",
      remainingAttempts: failed.remainingAttempts,
    };
  }

  // 4. Succès : création session + notification immédiate Directeur Général
  const session: SessionUser = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as Role,
    customPermissions: user.customPermissions || [],
  };

  await createSession(session);

  // Mettre à jour lastSeenAt
  await prisma.user
    .update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    })
    .catch(() => {});

  // Enregistrer succès et notifier le DG
  await recordSuccessfulLogin(email, ip, userAgent, {
    id: user.id,
    fullName: user.fullName,
    role: user.role,
  });

  return { success: true, user: session };
}

export async function login(email: string, password: string, meta?: { ip?: string; userAgent?: string }) {
  const result = await authenticate(email, password, meta);
  if (result.success) {
    return result.user;
  }
  return null;
}

