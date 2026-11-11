"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function TechSheetAIActions({
  vehicleId,
  brand,
  model,
}: {
  vehicleId: string;
  brand: string;
  model: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [maskedKey, setMaskedKey] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/ai/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.configured) {
          setIsConfigured(true);
          setMaskedKey(data.maskedKey || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async (keyToUse?: string) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/ai/tech-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          customApiKey: keyToUse,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la génération avec OpenAI.");
      }

      setFeedback({ text: "✅ Fiche technique mise à jour avec succès via OpenAI !", isError: false });
      setShowModal(false);
      router.refresh();
    } catch (err: unknown) {
      setFeedback({ text: (err as Error)?.message || "Erreur inconnue", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKeyAndGenerate = async () => {
    if (!apiKeyInput.trim()) {
      setFeedback({ text: "Veuillez saisir une clé OpenAI (sk-...)", isError: true });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      // 1. Sauvegarder la clé
      const saveRes = await fetch("/api/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(saveData.error || "Clé OpenAI invalide.");
      }

      setIsConfigured(true);
      setMaskedKey(saveData.maskedKey || "");

      // 2. Générer
      await handleGenerate(apiKeyInput.trim());
    } catch (err: unknown) {
      setFeedback({ text: (err as Error)?.message || "Erreur lors de l'enregistrement", isError: true });
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          if (isConfigured) {
            handleGenerate();
          } else {
            setShowModal(true);
          }
        }}
        disabled={loading}
        className="ox-btn"
        style={{
          background: "var(--success-solid)",
          color: "var(--text-strong)",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontWeight: 700,
          fontSize: "0.88rem",
          padding: "0.45rem 0.95rem",
          borderRadius: "8px",
          border: "none",
          cursor: loading ? "wait" : "pointer",
          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
        }}
        title="Générer et vérifier les caractéristiques officielles avec l'API OpenAI"
      >
        <span>{loading ? "⏳ Analyse IA en cours..." : "✨ Vérifier avec OpenAI"}</span>
      </button>

      {/* Bouton pour configurer / changer la clé */}
      <button
        onClick={() => setShowModal(true)}
        className="ox-btn ox-btn-ghost"
        style={{
          color: "var(--text-muted)",
          borderColor: "var(--border)",
          fontSize: "0.82rem",
          padding: "0.45rem 0.75rem",
        }}
        title="Configurer la clé API OpenAI"
      >
        ⚙️ Clé OpenAI {isConfigured ? `(${maskedKey})` : "(Non configurée)"}
      </button>

      {/* Modal de configuration OpenAI */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "var(--surface-sunken)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              color: "var(--text-on-accent)",
              borderRadius: "14px",
              padding: "1.8rem",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>
                🤖 Configuration API OpenAI
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "var(--text-subtle)",
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.88rem", color: "var(--text-subtle)", lineHeight: 1.5, marginBottom: "1.2rem" }}>
              Configurez votre clé OpenAI pour que l&apos;intelligence artificielle inspecte, traduise et garantisse
              l&apos;exactitude des fiches techniques constructeur pour <strong>{brand} {model}</strong>.
            </p>

            {isConfigured && (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--success)",
                  padding: "0.6rem 0.9rem",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  color: "var(--success-fg)",
                  marginBottom: "1rem",
                }}
              >
                ✓ Clé actuelle active : <strong>{maskedKey}</strong>
              </div>
            )}

            <div style={{ marginBottom: "1.2rem" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                {isConfigured ? "Remplacer par une nouvelle clé OpenAI :" : "Clé API OpenAI (sk-...) :"}
              </label>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "8px",
                  border: "1.5px solid var(--border-strong)",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
              <span style={{ fontSize: "0.74rem", color: "var(--text-subtle)", marginTop: "4px", display: "block" }}>
                La clé est chiffrée et stockée de manière sécurisée sur votre plateforme web.
              </span>
            </div>

            {feedback && (
              <div
                style={{
                  padding: "0.6rem 0.9rem",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  marginBottom: "1rem",
                  background: feedback.isError ? "var(--surface)" : "var(--surface)",
                  border: `1px solid ${feedback.isError ? "var(--danger)" : "var(--success)"}`,
                  color: feedback.isError ? "var(--danger-fg)" : "var(--success-fg)",
                }}
              >
                {feedback.text}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem" }}>
              <button
                onClick={() => setShowModal(false)}
                className="ox-btn ox-btn-ghost"
                style={{ border: "1px solid var(--border-strong)", color: "var(--border-strong)" }}
              >
                Fermer
              </button>
              {apiKeyInput.trim() ? (
                <button
                  onClick={handleSaveKeyAndGenerate}
                  disabled={loading}
                  className="ox-btn"
                  style={{ background: "var(--info-solid)", color: "var(--surface)", fontWeight: 700 }}
                >
                  {loading ? "Vérification..." : "Enregistrer & Lancer l'analyse"}
                </button>
              ) : isConfigured ? (
                <button
                  onClick={() => handleGenerate()}
                  disabled={loading}
                  className="ox-btn"
                  style={{ background: "var(--success-solid)", color: "var(--surface)", fontWeight: 700 }}
                >
                  {loading ? "Génération en cours..." : "Lancer l'analyse avec la clé active"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
