"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  confirmVehicleTechSheetAction,
  unconfirmVehicleTechSheetAction,
  generateSingleVehicleTechSheetAIAction,
} from "@/app/vehicles/actions";

interface TechSheetActionBarProps {
  vehicleId: string;
  brand: string;
  model: string;
  variant?: string | null;
  sheetTitle: string;
  isConfirmed: boolean;
  confirmedAt?: string | Date | null;
}

export function TechSheetActionBar({
  vehicleId,
  brand,
  model,
  variant,
  sheetTitle,
  isConfirmed: initialIsConfirmed,
  confirmedAt: initialConfirmedAt,
}: TechSheetActionBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isConfirmed, setIsConfirmed] = useState(initialIsConfirmed);
  const [confirmedAt, setConfirmedAt] = useState<string | Date | null>(initialConfirmedAt || null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Modal IA unitaire (OpenAI)
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  // Vérifier la présence d'une clé API au besoin
  const checkAiSettings = async () => {
    try {
      const res = await fetch("/api/ai/settings");
      if (res.ok) {
        const data = await res.json();
        setIsConfigured(Boolean(data.configured));
      }
    } catch {
      setIsConfigured(false);
    }
  };

  const handleOpenAiModal = () => {
    checkAiSettings();
    setShowAiModal(true);
  };

  // Action 1 : Confirmer la fiche technique en Base de Données
  const handleConfirm = () => {
    startTransition(async () => {
      try {
        setFeedback(null);
        await confirmVehicleTechSheetAction(vehicleId);
        setIsConfirmed(true);
        const now = new Date();
        setConfirmedAt(now);
        setFeedback({
          message: "✅ Fiche technique confirmée avec succès ! Elle est désormais définitivement enregistrée en base de données.",
          type: "success",
        });
        router.refresh();
      } catch (err: unknown) {
        setFeedback({
          message: (err as Error)?.message || "Erreur lors de la confirmation en base de données.",
          type: "error",
        });
      }
    });
  };

  // Action 2 : Déverrouiller la fiche
  const handleUnlock = () => {
    if (!window.confirm("Êtes-vous sûr de vouloir déverrouiller cette fiche technique pour la modifier ou la régénérer ?")) {
      return;
    }
    startTransition(async () => {
      try {
        setFeedback(null);
        await unconfirmVehicleTechSheetAction(vehicleId);
        setIsConfirmed(false);
        setConfirmedAt(null);
        setFeedback({
          message: "🔓 Fiche technique déverrouillée. Vous pouvez la régénérer avec l'IA ou modifier ses données avant de la re-confirmer.",
          type: "info",
        });
        router.refresh();
      } catch (err: unknown) {
        setFeedback({
          message: (err as Error)?.message || "Erreur lors du déverrouillage.",
          type: "error",
        });
      }
    });
  };

  // Action 3 : Génération IA unitaire (OpenAI)
  const handleLaunchAiGeneration = async () => {
    setIsAiGenerating(true);
    setFeedback(null);
    try {
      const res = await generateSingleVehicleTechSheetAIAction(
        vehicleId,
        apiKeyInput.trim() || undefined
      );
      if (res.success) {
        setShowAiModal(false);
        setIsConfirmed(false); // Doit être confirmée par l'utilisateur !
        setFeedback({
          message: "✨ Fiche technique générée avec succès via l'IA ! Vérifiez les caractéristiques ci-dessous et cliquez sur « Confirmer la fiche technique » pour l'enregistrer définitivement.",
          type: "success",
        });
        router.refresh();
      }
    } catch (err: unknown) {
      setFeedback({
        message: (err as Error)?.message || "Erreur lors de la génération avec OpenAI.",
        type: "error",
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  const formattedDate = confirmedAt
    ? new Date(confirmedAt).toLocaleDateString("fr-BJ", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      {/* Barre d'action supérieure (masquée à l'impression) */}
      <div
        className="no-print"
        style={{
          padding: "0.85rem 1.5rem",
          background: "#0f172a",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Navigation et titre */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
          <Link
            href="/vehicles"
            className="ox-btn ox-btn-ghost"
            style={{
              color: "#ffffff",
              borderColor: "rgba(255,255,255,0.25)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
              padding: "0.45rem 0.85rem",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            ← Retour Stock
          </Link>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#f8fafc" }}>
            Fiche : <span style={{ color: "#38bdf8" }}>{sheetTitle}</span>
          </div>

          {/* Badge d'état BDD */}
          {isConfirmed ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(16, 185, 129, 0.18)",
                color: "#34d399",
                border: "1px solid rgba(52, 211, 153, 0.4)",
                padding: "3px 9px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
              title={`Confirmée en BDD le ${formattedDate || ""}. Stockée définitivement, aucun appel OpenAI.`}
            >
              <span style={{ fontSize: "0.9rem" }}>🛡️</span> Confirmée en BDD
            </span>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(245, 158, 11, 0.18)",
                color: "#fbbf24",
                border: "1px solid rgba(251, 191, 36, 0.4)",
                padding: "3px 9px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
              title="Cette fiche n'est pas encore confirmée. Cliquez sur le bouton vert pour la verrouiller en base de données."
            >
              <span style={{ fontSize: "0.9rem" }}>⚠️</span> Non confirmée (Brouillon)
            </span>
          )}
        </div>

        {/* Boutons d'action */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          {/* BOUTON PRINCIPAL DEMANDÉ PAR L'UTILISATEUR : CONFIRMER LA FICHE TECHNIQUE */}
          {!isConfirmed ? (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending || isAiGenerating}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "0.55rem 1.1rem",
                fontSize: "0.9rem",
                fontWeight: 800,
                cursor: isPending ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                boxShadow: "0 3px 10px rgba(16, 185, 129, 0.4)",
                transition: "all 0.15s ease",
              }}
              title="Enregistrer définitivement cette fiche technique dans la base de données sans mise à jour automatique ultérieure"
            >
              <span>{isPending ? "⏳ Enregistrement..." : "💾 Confirmer la fiche technique"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUnlock}
              disabled={isPending}
              style={{
                background: "transparent",
                color: "#94a3b8",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: "6px",
                padding: "0.45rem 0.8rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: isPending ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
              title="Déverrouiller pour permettre la modification ou la régénération"
            >
              <span>🔓 Déverrouiller</span>
            </button>
          )}

          {/* Bouton Génération OpenAI unitaire pour ce véhicule séparément */}
          {!isConfirmed && (
            <button
              type="button"
              onClick={handleOpenAiModal}
              disabled={isPending || isAiGenerating}
              style={{
                background: "rgba(30, 41, 59, 0.9)",
                color: "#e2e8f0",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                padding: "0.55rem 0.95rem",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: isAiGenerating ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Générer les caractéristiques officielles avec l'IA pour ce véhicule uniquement"
            >
              <span>✨ Générer avec l&apos;IA (OpenAI)</span>
            </button>
          )}

          {/* Bouton Imprimer */}
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              background: "#3b82f6",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0.55rem 1rem",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
            }}
            title="Imprimer ou enregistrer en PDF la fiche technique"
          >
            <span>🖨️ Imprimer / PDF (3 Pages A4)</span>
          </button>
        </div>
      </div>

      {/* Bannière de notification / Feedback */}
      {feedback && (
        <div
          className="no-print"
          style={{
            padding: "0.75rem 1.5rem",
            background:
              feedback.type === "success"
                ? "#ecfdf5"
                : feedback.type === "error"
                ? "#fef2f2"
                : "#eff6ff",
            color:
              feedback.type === "success"
                ? "#065f46"
                : feedback.type === "error"
                ? "#991b1b"
                : "#1e40af",
            borderBottom: `1px solid ${
              feedback.type === "success"
                ? "#a7f3d0"
                : feedback.type === "error"
                ? "#fecaca"
                : "#bfdbfe"
            }`,
            fontSize: "0.88rem",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              color: "inherit",
              padding: "0 5px",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Bannière explicative d'assurance de la base de données */}
      <div
        className="no-print"
        style={{
          background: isConfirmed ? "#f0fdf4" : "#fffbeb",
          borderBottom: `1px solid ${isConfirmed ? "#bbf7d0" : "#fde68a"}`,
          padding: "0.6rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.82rem",
          color: isConfirmed ? "#166534" : "#92400e",
        }}
      >
        <div>
          {isConfirmed ? (
            <>
              <strong>Fiche définitive enregistrée :</strong> Cette fiche technique est scellée en base de données
              {formattedDate ? ` depuis le ${formattedDate}` : ""}. Aucun appel vers l&apos;API OpenAI n&apos;est effectué lors de vos consultations ou impressions.
            </>
          ) : (
            <>
              <strong>Action requise :</strong> Cette fiche est actuellement en mode aperçu. Pour qu&apos;elle reste définitivement enregistrée en base de données sans être recalculée, cliquez sur <strong>« Confirmer la fiche technique »</strong> ci-dessus.
            </>
          )}
        </div>
      </div>

      {/* Modal d'appel OpenAI unitaire et contrôlé */}
      {showAiModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: "14px",
              padding: "1.8rem",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>
                🤖 Génération IA pour {brand} {model}
              </h3>
              <button
                onClick={() => setShowAiModal(false)}
                disabled={isAiGenerating}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fde68a",
                borderRadius: "8px",
                padding: "0.75rem 0.9rem",
                marginBottom: "1rem",
                fontSize: "0.82rem",
                color: "#92400e",
                lineHeight: 1.45,
              }}
            >
              🔒 <strong>Contrôle des coûts API :</strong> Cet appel ne cible que <strong>ce véhicule précis</strong> ({brand} {model}{variant ? ` ${variant}` : ""}). Une fois générée, vous pourrez valider et <strong>confirmer</strong> la fiche afin qu&apos;elle reste définitivement en base de données sans jamais rappeler l&apos;API OpenAI.
            </div>

            {isConfigured === false && (
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                  Clé OpenAI (sk-...) optionnelle :
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.85rem",
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ fontSize: "0.74rem", color: "#64748b", display: "block", marginTop: "3px" }}>
                  Si vous avez déjà configuré votre clé OpenAI dans les variables d&apos;environnement, laissez ce champ vide.
                </span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.2rem" }}>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                disabled={isAiGenerating}
                style={{
                  background: "transparent",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "0.5rem 0.9rem",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  color: "#475569",
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleLaunchAiGeneration}
                disabled={isAiGenerating}
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1.1rem",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: isAiGenerating ? "wait" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {isAiGenerating ? "⏳ Analyse IA en cours..." : "Lancer l'analyse pour cette voiture"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
