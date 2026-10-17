"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, X, Compass, ExternalLink, HelpCircle } from "lucide-react";
import type { Role } from "@/lib/roles";
import { localizedOnboardingSteps, roleLabel } from "@/lib/i18n";
import { useMessages } from "@/components/PrefsProvider";

export function OnboardingHost({
  role,
  userName,
  userId,
}: {
  role: Role;
  userName: string;
  userId: string;
}) {
  const messages = useMessages();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});

  const steps = useMemo(() => localizedOnboardingSteps(role, messages), [role, messages]);
  const userDismissKey = `carzone_onboarding_dismissed_${userId || "guest"}`;
  const storageDoneKey = `carzone_onboarding_steps_${userId || "guest"}_${role}`;

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(userDismissKey);
      const s = localStorage.getItem(storageDoneKey);
      // S'affiche uniquement si l'utilisateur ne l'a pas encore fermé définitivement
      setOpen(dismissed !== "1");
      if (s) setDone(JSON.parse(s) as Record<string, boolean>);
    } catch {
      setOpen(false);
    }
    setReady(true);
  }, [userDismissKey, storageDoneKey]);

  // Permet de ré-ouvrir les premiers pas depuis le Centre d'Aide
  useEffect(() => {
    const handleReopen = () => {
      setOpen(true);
    };
    window.addEventListener("carzone:reopen_onboarding", handleReopen);
    return () => window.removeEventListener("carzone:reopen_onboarding", handleReopen);
  }, []);

  function persistDone(next: Record<string, boolean>) {
    setDone(next);
    try {
      localStorage.setItem(storageDoneKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(userDismissKey, "1");
    } catch {
      /* ignore */
    }
  }

  function openHelpCenter() {
    dismiss();
    window.dispatchEvent(new CustomEvent("carzone:open_help"));
  }

  if (!ready || !open) {
    // Une fois fermé, ne s'affiche plus automatiquement pour cet utilisateur (aucun bouton permanent gênant)
    return null;
  }

  const completed = steps.filter((s) => done[s.id]).length;
  const pct = Math.round((completed / Math.max(1, steps.length)) * 100);

  return (
    <div
      className="no-print"
      role="dialog"
      aria-label="Guide de démarrage Premiers Pas CARZONE"
      style={{
        position: "fixed",
        bottom: "1.25rem",
        right: "1.25rem",
        width: "min(420px, calc(100vw - 2rem))",
        zIndex: 90,
        borderRadius: 16,
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.96) 0%, rgba(9, 14, 26, 0.98) 100%)",
        border: "1px solid rgba(225, 29, 72, 0.4)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(225, 29, 72, 0.15)",
        backdropFilter: "blur(20px)",
        color: "#ffffff",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: "min(78vh, 620px)",
        animation: "fadeInUp 0.3s ease-out",
      }}
    >
      {/* En-tête stylisé */}
      <div
        style={{
          padding: "1rem 1.2rem",
          background: "linear-gradient(90deg, rgba(225, 29, 72, 0.18) 0%, rgba(15, 23, 42, 0.4) 100%)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 7px",
                borderRadius: 20,
                fontSize: "0.68rem",
                fontWeight: 750,
                background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                color: "#ffffff",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <Compass size={11} /> Premiers pas
            </span>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              {roleLabel(messages, role)}
            </span>
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: "1.05rem",
              fontWeight: 800,
              letterSpacing: "-0.01em",
              color: "#ffffff",
            }}
          >
            Bienvenue, {userName}
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
            Voici votre parcours guidé adapté aux dernières fonctionnalités de CARZONE Ops.
          </p>
        </div>

        <button
          type="button"
          onClick={dismiss}
          title="Fermer définitivement pour ce compte"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#94a3b8",
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.background = "rgba(225, 29, 72, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Barre de progression */}
      <div style={{ padding: "0.65rem 1.2rem", background: "rgba(0, 0, 0, 0.2)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94a3b8", marginBottom: 5 }}>
          <span>Progression de découverte</span>
          <strong style={{ color: pct === 100 ? "#10b981" : "#e11d48" }}>{completed}/{steps.length} ({pct}%)</strong>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: "rgba(255, 255, 255, 0.1)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: pct === 100 ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #e11d48, #fb7185)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Liste des étapes clés */}
      <div
        style={{
          padding: "0.8rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flex: 1,
        }}
      >
        {steps.map((step, idx) => {
          const isDone = !!done[step.id];
          return (
            <Link
              key={step.id}
              href={step.href}
              onClick={() => persistDone({ ...done, [step.id]: true })}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 10,
                background: isDone ? "rgba(16, 185, 129, 0.06)" : "rgba(255, 255, 255, 0.03)",
                border: isDone ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(255, 255, 255, 0.06)",
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDone ? "rgba(16, 185, 129, 0.12)" : "rgba(225, 29, 72, 0.1)";
                e.currentTarget.style.borderColor = isDone ? "rgba(16, 185, 129, 0.4)" : "rgba(225, 29, 72, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDone ? "rgba(16, 185, 129, 0.06)" : "rgba(255, 255, 255, 0.03)";
                e.currentTarget.style.borderColor = isDone ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.06)";
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                  background: isDone ? "#10b981" : "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                }}
              >
                {isDone ? <CheckCircle2 size={13} /> : idx + 1}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: isDone ? "#94a3b8" : "#ffffff",
                    textDecoration: isDone ? "line-through" : "none",
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                  {step.hint}
                </div>
              </div>

              <ExternalLink size={13} style={{ color: "#64748b", flexShrink: 0, marginTop: 4 }} />
            </Link>
          );
        })}
      </div>

      {/* Pied de fenêtre avec action de clôture et lien Centre d'Aide */}
      <div
        style={{
          padding: "0.75rem 1rem",
          background: "rgba(0, 0, 0, 0.35)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <button
          type="button"
          onClick={dismiss}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
            color: "#ffffff",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(225, 29, 72, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Sparkles size={14} /> J&apos;ai compris, ne plus afficher
        </button>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, marginTop: 2 }}>
          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Besoin de revoir ce guide ?</span>
          <button
            type="button"
            onClick={openHelpCenter}
            style={{
              background: "none",
              border: "none",
              color: "#f43f5e",
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: "pointer",
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              textDecoration: "underline",
            }}
          >
            <HelpCircle size={11} /> Centre d&apos;Aide
          </button>
        </div>
      </div>
    </div>
  );
}
