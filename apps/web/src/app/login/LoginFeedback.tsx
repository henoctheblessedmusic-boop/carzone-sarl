"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface LoginFeedbackProps {
  error?: string;
  sec?: string;
  stage?: string;
  label?: string;
  remaining?: string;
  defaultErrorMessage?: string;
}

export function LoginFeedback({
  error,
  sec,
  stage,
  label,
  remaining,
  defaultErrorMessage = "Identifiants invalides",
}: LoginFeedbackProps) {
  const initialSeconds = sec ? parseInt(sec, 10) : 0;
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);

  useEffect(() => {
    if (initialSeconds <= 0) return;
    setSecondsLeft(initialSeconds);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialSeconds]);

  if (!error) return null;

  if (error === "locked") {
    const isExpired = secondsLeft === 0;

    const formatTime = (totalSec: number) => {
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      if (m > 60) {
        const h = Math.floor(m / 60);
        const remM = m % 60;
        return `${h}h ${remM}m ${s}s`;
      }
      return `${m > 0 ? `${m}m ` : ""}${s}s`;
    };

    if (isExpired) {
      return (
        <div
          style={{
            padding: "0.85rem 1rem",
            borderRadius: 10,
            background: "var(--success-soft)",
            border: "1px solid var(--success)",
            color: "var(--success-fg)",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            lineHeight: 1.4,
          }}
        >
          <CheckCircle size={18} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <strong style={{ display: "block", marginBottom: 2 }}>
              Délai de sécurité écoulé
            </strong>
            Vous pouvez à nouveau tenter de vous connecter avec votre mot de passe.
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          padding: "0.85rem 1rem",
          borderRadius: 10,
          background: "var(--danger-soft)",
          border: "1px solid var(--danger)",
          color: "var(--danger-fg)",
          fontSize: "0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldAlert size={18} style={{ flexShrink: 0 }} />
          <strong style={{ fontSize: "0.9rem" }}>
            Accès Temporairement Bloqué (5 erreurs)
          </strong>
        </div>
        <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.35 }}>
          5 tentatives de mot de passe consécutives ont échoué.
          {stage ? ` Blocage progressif (Niveau ${stage}/5).` : ""}
        </p>
        <div
          style={{
            marginTop: 4,
            padding: "6px 10px",
            background: "var(--surface-soft)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 700,
            color: "var(--danger-fg)",
          }}
        >
          <Clock size={16} />
          <span>Veuillez patienter : {formatTime(secondsLeft)}</span>
        </div>
        {label && (
          <div style={{ fontSize: "0.75rem", opacity: 0.75 }}>
            Durée du palier : {label}
          </div>
        )}
      </div>
    );
  }

  if (error === "invalid") {
    const attempts = remaining ? parseInt(remaining, 10) : null;
    return (
      <div
        style={{
          padding: "0.75rem 0.9rem",
          borderRadius: 10,
          background: "var(--warning-soft)",
          border: "1px solid var(--warning)",
          color: "var(--warning-fg)",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <AlertTriangle size={18} style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <strong style={{ display: "block", marginBottom: 2 }}>
            Mot de passe ou identifiant incorrect
          </strong>
          {attempts !== null ? (
            <span>
              Attention : plus que <strong>{attempts}</strong> tentative{attempts > 1 ? "s" : ""} avant blocage temporaire (5 erreurs max).
            </span>
          ) : (
            <span>Vérifiez vos identifiants et réessayez.</span>
          )}
        </div>
      </div>
    );
  }

  if (error === "inactive") {
    return (
      <div
        style={{
          padding: "0.75rem 0.9rem",
          borderRadius: 10,
          background: "var(--danger-soft)",
          border: "1px solid var(--danger)",
          color: "var(--danger-fg)",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <ShieldAlert size={18} />
        <span>Ce compte utilisateur a été désactivé par l&apos;administration.</span>
      </div>
    );
  }

  return (
    <div className="ox-badge ox-badge--bad" style={{ padding: "0.6rem 0.8rem", borderRadius: 8 }}>
      {defaultErrorMessage}
    </div>
  );
}
