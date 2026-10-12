"use client";

import { useState, useTransition } from "react";
import { Key, Eye, EyeOff, Check, X } from "lucide-react";
import { changeMyPassword } from "@/app/users/actions";

export function ChangePasswordModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    setNewPassword("");
    setConfirmPassword("");
    setStatus(null);
    setError(null);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 4) {
      setError("Le mot de passe doit comporter au moins 4 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await changeMyPassword(newPassword.trim());
        setStatus("Votre mot de passe a été modifié avec succès ! L'alerte a été enregistrée.");
        setTimeout(() => {
          setIsOpen(false);
          setStatus(null);
        }, 1500);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title="Changer mon mot de passe"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 8,
          border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
          background: "var(--ice-card-bg, rgba(255, 255, 255, 0.05))",
          color: "var(--ice-text)",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        <Key size={17} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--ice-card-bg, #161a20)",
              border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
              borderRadius: 16,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
                background: "rgba(255, 255, 255, 0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    padding: 6,
                    borderRadius: 8,
                    background: "rgba(212, 175, 55, 0.15)",
                    color: "var(--gold, #d4af37)",
                    display: "flex",
                  }}
                >
                  <Key size={18} />
                </span>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--ice-text)" }}>
                  Changer mon mot de passe
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  opacity: 0.6,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
              {status && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    color: "#4ade80",
                    fontSize: "0.82rem",
                  }}
                >
                  {status}
                </div>
              )}

              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    fontSize: "0.82rem",
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 6, color: "var(--ice-text)" }}>
                  Nouveau mot de passe
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Entrez votre nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 38px 9px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      background: "rgba(0, 0, 0, 0.2)",
                      color: "var(--ice-text)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "inherit",
                      opacity: 0.6,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: 6, color: "var(--ice-text)" }}>
                  Confirmer le mot de passe
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Répétez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                    background: "rgba(0, 0, 0, 0.2)",
                    color: "var(--ice-text)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 6,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                    background: "transparent",
                    color: "var(--ice-text)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(135deg, #d4af37, #b48c1e)",
                    color: "#000",
                    fontWeight: 750,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  <Check size={16} />
                  {isPending ? "Modification..." : "Valider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
