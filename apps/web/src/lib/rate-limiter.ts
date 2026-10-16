import { prisma } from "./prisma";

export const MAX_FAILED_ATTEMPTS = 5;

export const LOCKOUT_STAGES: Record<number, { seconds: number; label: string }> = {
  1: { seconds: 60, label: "1 minute" },
  2: { seconds: 5 * 60, label: "5 minutes" },
  3: { seconds: 10 * 60, label: "10 minutes" },
  4: { seconds: 60 * 60, label: "1 heure" },
  5: { seconds: 24 * 60 * 60, label: "24 heures (toute une journée)" },
};

/**
 * Normalise l'email pour le rate limiting
 */
export function normalizeEmail(email: string): string {
  return (email || "").trim().toLowerCase();
}

/**
 * Vérifie si une tentative de connexion est actuellement bloquée par le rate limiting.
 */
export async function checkRateLimit(
  email: string,
  ip: string
): Promise<{
  isLocked: boolean;
  remainingSeconds: number;
  lockoutStage: number;
  label?: string;
}> {
  const normEmail = normalizeEmail(email);
  if (!normEmail || !ip) {
    return { isLocked: false, remainingSeconds: 0, lockoutStage: 0 };
  }

  try {
    const attempt = await prisma.loginAttempt.findUnique({
      where: {
        email_ipAddress: {
          email: normEmail,
          ipAddress: ip,
        },
      },
    });

    if (!attempt || !attempt.lockedUntil) {
      return { isLocked: false, remainingSeconds: 0, lockoutStage: attempt?.lockoutStage || 0 };
    }

    const now = Date.now();
    const lockTime = new Date(attempt.lockedUntil).getTime();

    if (lockTime > now) {
      const remainingSeconds = Math.max(1, Math.ceil((lockTime - now) / 1000));
      const stage = attempt.lockoutStage || 1;
      const stageConfig = LOCKOUT_STAGES[stage] || LOCKOUT_STAGES[5];
      return {
        isLocked: true,
        remainingSeconds,
        lockoutStage: stage,
        label: stageConfig.label,
      };
    }

    // Le verrou a expiré
    return {
      isLocked: false,
      remainingSeconds: 0,
      lockoutStage: attempt.lockoutStage || 0,
    };
  } catch (err) {
    console.error("[RateLimiter] Error in checkRateLimit:", err);
    return { isLocked: false, remainingSeconds: 0, lockoutStage: 0 };
  }
}

/**
 * Enregistre une tentative infructueuse (mot de passe incorrect).
 * Dès que le seuil de 5 échecs est atteint, applique le blocage progressif :
 * 1. 1 minute
 * 2. 5 minutes
 * 3. 10 minutes
 * 4. 1 heure
 * 5. 24 heures (toute une journée)
 */
export async function recordFailedAttempt(
  email: string,
  ip: string,
  userAgent?: string
): Promise<{
  isLockedNow: boolean;
  remainingAttempts: number;
  stage: number;
  durationLabel?: string;
  remainingSeconds?: number;
}> {
  const normEmail = normalizeEmail(email);
  if (!normEmail || !ip) {
    return { isLockedNow: false, remainingAttempts: MAX_FAILED_ATTEMPTS, stage: 0 };
  }

  try {
    const existing = await prisma.loginAttempt.findUnique({
      where: {
        email_ipAddress: {
          email: normEmail,
          ipAddress: ip,
        },
      },
    });

    const now = new Date();
    let currentFailedCount = existing?.failedCount || 0;
    let prevStage = existing?.lockoutStage || 0;

    // Si un ancien verrou était actif mais est maintenant dépassé, on entame un nouveau cycle de 5 tentatives
    if (existing?.lockedUntil && new Date(existing.lockedUntil).getTime() <= now.getTime()) {
      currentFailedCount = 0;
    }

    const nextCount = currentFailedCount + 1;

    if (nextCount >= MAX_FAILED_ATTEMPTS) {
      // Déterminer le prochain niveau d'échelon (1 -> 2 -> 3 -> 4 -> 5)
      let nextStage = prevStage + 1;
      if (nextStage > 5) nextStage = 5;
      if (nextStage < 1) nextStage = 1;

      const stageConfig = LOCKOUT_STAGES[nextStage] || LOCKOUT_STAGES[5];
      const lockedUntil = new Date(now.getTime() + stageConfig.seconds * 1000);

      await prisma.loginAttempt.upsert({
        where: {
          email_ipAddress: {
            email: normEmail,
            ipAddress: ip,
          },
        },
        create: {
          email: normEmail,
          ipAddress: ip,
          userAgent: userAgent || null,
          failedCount: nextCount,
          lockoutStage: nextStage,
          lockedUntil,
          lastAttemptAt: now,
        },
        update: {
          failedCount: nextCount,
          lockoutStage: nextStage,
          lockedUntil,
          lastAttemptAt: now,
          userAgent: userAgent || null,
        },
      });

      // Notification de sécurité immédiate pour le Développeur
      try {
        await prisma.adminNotification.create({
          data: {
            type: "RATE_LIMIT_ALERT",
            title: `Alerte Sécurité : Compte verrouillé (5 erreurs)`,
            message: `L'adresse IP ${ip} a échoué 5 fois consécutives sur le compte ${normEmail}. Accès bloqué pendant ${stageConfig.label} (Échelon ${nextStage}/5).`,
            userName: normEmail,
            oldValue: ip,
            newValue: `Échelon ${nextStage} - ${stageConfig.label}`,
          },
        });
      } catch (notifErr) {
        console.error("[RateLimiter] Error creating security alert notification:", notifErr);
      }

      return {
        isLockedNow: true,
        remainingAttempts: 0,
        stage: nextStage,
        durationLabel: stageConfig.label,
        remainingSeconds: stageConfig.seconds,
      };
    } else {
      // Moins de 5 erreurs : mettre à jour le décompte
      await prisma.loginAttempt.upsert({
        where: {
          email_ipAddress: {
            email: normEmail,
            ipAddress: ip,
          },
        },
        create: {
          email: normEmail,
          ipAddress: ip,
          userAgent: userAgent || null,
          failedCount: nextCount,
          lockoutStage: prevStage,
          lockedUntil: null,
          lastAttemptAt: now,
        },
        update: {
          failedCount: nextCount,
          lockedUntil: null,
          lastAttemptAt: now,
          userAgent: userAgent || null,
        },
      });

      return {
        isLockedNow: false,
        remainingAttempts: MAX_FAILED_ATTEMPTS - nextCount,
        stage: prevStage,
      };
    }
  } catch (err) {
    console.error("[RateLimiter] Error in recordFailedAttempt:", err);
    return { isLockedNow: false, remainingAttempts: 1, stage: 0 };
  }
}

/**
 * Enregistre une connexion réussie :
 * 1. Réinitialise le décompte des tentatives et le statut de verrouillage
 * 2. Émet une notification immédiate pour le Directeur Général avec l'IP et les informations utilisateur
 */
export async function recordSuccessfulLogin(
  email: string,
  ip: string,
  userAgent?: string,
  userInfo?: { id: string; fullName: string; role: string }
): Promise<void> {
  const normEmail = normalizeEmail(email);
  if (!normEmail) return;

  try {
    // 1. Réinitialisation du rate limiting pour cette IP et cet email
    await prisma.loginAttempt.deleteMany({
      where: {
        email: normEmail,
        ipAddress: ip,
      },
    });

    // 2. Notification immédiate au Directeur Général
    const userName = userInfo?.fullName || normEmail;
    const userRole = userInfo?.role || "Utilisateur";

    await prisma.adminNotification.create({
      data: {
        type: "LOGIN_ALERT",
        title: `Connexion : ${userName}`,
        message: `L'utilisateur ${userName} (${normEmail} - Rôle: ${userRole}) s'est connecté depuis l'adresse IP ${ip}.`,
        userId: userInfo?.id,
        userName,
        oldValue: ip,
        newValue: userAgent || "Navigateur Web",
      },
    });
  } catch (err) {
    console.error("[RateLimiter] Error in recordSuccessfulLogin:", err);
  }
}
