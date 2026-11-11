"use client";

import { useState, useTransition } from "react";
import { KeyRound, LogOut, ShieldAlert } from "lucide-react";
import { changePasswordWithOldPassword } from "@/app/users/actions";

export function MandatoryPasswordChangeModal({ userName }: { userName: string }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Renseignez les trois champs.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit comporter au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    startTransition(async () => {
      try {
        await changePasswordWithOldPassword(oldPassword, newPassword, confirmPassword);
        window.location.href = "/login?passwordChanged=1";
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Impossible de modifier le mot de passe.");
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mandatory-password-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "var(--surface)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          borderRadius: 18,
          border: "1px solid var(--gold)",
          background: "var(--surface)",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.7)",
        }}
      >
        <div style={{ padding: "20px 22px 0", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--gold-soft)",
              color: "var(--gold-fg)",
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 id="mandatory-password-title" style={{ margin: 0, fontSize: "1.05rem", color: "var(--text-on-accent)" }}>
              Changement de mot de passe obligatoire
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Bonjour {userName}. Votre compte utilise encore un mot de passe de démonstration.
              Choisissez un mot de passe personnel pour continuer et sécuriser votre accès.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "18px 22px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          {error && (
            <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--danger-soft)", border: "1px solid var(--danger-soft)", color: "var(--danger-solid)", fontSize: "0.82rem" }}>
              {error}
            </div>
          )}

          <label style={{ display: "grid", gap: 6, fontSize: "0.8rem", color: "var(--text-on-accent)" }}>
            Ancien mot de passe
            <input
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              className="ox-input"
              required
            />
          </label>

          <label style={{ display: "grid", gap: 6, fontSize: "0.8rem", color: "var(--text-strong)" }}>
            Nouveau mot de passe
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="ox-input"
              minLength={8}
              required
            />
          </label>

          <label style={{ display: "grid", gap: 6, fontSize: "0.8rem", color: "var(--text-strong)" }}>
            Confirmer le nouveau mot de passe
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="ox-input"
              minLength={8}
              required
            />
          </label>

          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
            8 caractères minimum. Après validation, vous serez redirigé vers la page de connexion pour vous reconnecter avec votre nouveau mot de passe.
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="ox-btn ox-btn-primary"
            style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 4 }}
          >
            <KeyRound size={16} />
            {isPending ? "Mise à jour..." : "Changer mon mot de passe"}
          </button>

          <button
            type="button"
            onClick={() => {
              void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
                window.location.href = "/login";
              });
            }}
            className="ox-btn ox-btn-ghost"
            style={{ width: "100%", display: "flex", justifyContent: "center", gap: 8, marginTop: 2 }}
          >
            <LogOut size={15} />
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}
