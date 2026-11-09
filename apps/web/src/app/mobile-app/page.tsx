import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Info,
  Settings,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { MOBILE_APP } from "@/lib/mobile-app";

const steps = [
  {
    title: "Télécharger l'APK",
    text: "Depuis le téléphone ou la tablette, appuyez sur le bouton de téléchargement. Le fichier CARZONE-1.0.0.apk sera enregistré dans les téléchargements.",
  },
  {
    title: "Ouvrir le fichier",
    text: "Ouvrez le fichier depuis Chrome ou l'application Fichiers du téléphone. Android peut demander d'autoriser cette source d'installation.",
  },
  {
    title: "Autoriser l'installation",
    text: "Dans les réglages Android, autorisez Chrome ou Fichiers à installer des applications inconnues. Cette autorisation peut être retirée après l'installation.",
  },
  {
    title: "Installer CARZONE",
    text: "Appuyez sur Installer. Si Play Protect affiche un avertissement, choisissez Installer quand même : l'APK est signé et distribué par CARZONE.",
  },
  {
    title: "Se connecter",
    text: "Ouvrez CARZONE, puis connectez-vous avec votre adresse professionnelle et votre mot de passe habituel. Chrome doit être installé et à jour.",
  },
];

export default async function MobileAppPage() {
  const user = await requireUser();

  return (
    <AppShell user={user} titleKey="mobileApp">
      <div style={{ maxWidth: 900, display: "grid", gap: 18 }}>
        <section
          className="ox-glass"
          style={{
            padding: "1.25rem 1.35rem",
            borderRadius: 16,
            display: "grid",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                background: "rgba(212, 175, 55, 0.16)",
                color: "#d4af37",
                flexShrink: 0,
              }}
            >
              <Smartphone size={23} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.2rem" }}>Application mobile CARZONE</h1>
              <p style={{ margin: "6px 0 0", color: "var(--ice-text-muted)", lineHeight: 1.55 }}>
                Installez l&apos;application Android de l&apos;Espace Pro sur votre téléphone ou votre tablette.
                Le téléchargement est réservé aux utilisateurs connectés.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <Link
              href="/api/mobile/apk"
              className="ox-btn ox-btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
              prefetch={false}
            >
              <Download size={17} />
              Télécharger l&apos;APK Android
            </Link>
            <span style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)" }}>
              Version {MOBILE_APP.version} · {(MOBILE_APP.sizeBytes / 1024 / 1024).toFixed(1)} Mo
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#86efac",
              fontSize: "0.82rem",
              lineHeight: 1.5,
            }}
          >
            <ShieldCheck size={17} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              APK signé CARZONE. Ne téléchargez pas l&apos;application depuis un autre site et ne partagez pas
              le fichier en dehors de l&apos;entreprise.
            </span>
          </div>
        </section>

        <section className="ox-glass" style={{ padding: "1.25rem 1.35rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Settings size={18} style={{ color: "#d4af37" }} />
            <h2 style={{ margin: 0, fontSize: "1rem" }}>Installer sans Play Store</h2>
          </div>

          <ol style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 14 }}>
            {steps.map((step, index) => (
              <li key={step.title} style={{ lineHeight: 1.55 }}>
                <strong>
                  {index + 1}. {step.title}
                </strong>
                <div style={{ color: "var(--ice-text-muted)", fontSize: "0.86rem", marginTop: 3 }}>
                  {step.text}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          style={{
            padding: "1rem 1.2rem",
            borderRadius: 14,
            border: "1px solid rgba(245, 158, 11, 0.35)",
            background: "rgba(245, 158, 11, 0.08)",
            color: "#fcd34d",
            fontSize: "0.84rem",
            lineHeight: 1.6,
            display: "flex",
            gap: 9,
            alignItems: "flex-start",
          }}
        >
          <TriangleAlert size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Important :</strong> cette application n&apos;est pas publiée sur le Play Store. Elle est
            destinée aux appareils de l&apos;entreprise. Après l&apos;installation, gardez Chrome à jour pour
            le fonctionnement de l&apos;application.
          </div>
        </section>

        <section className="ox-glass" style={{ padding: "1rem 1.2rem", borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Info size={17} style={{ color: "#60a5fa" }} />
            <h2 style={{ margin: 0, fontSize: "0.95rem" }}>Vérification du fichier</h2>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: "0.82rem", color: "var(--ice-text-muted)" }}>
            Pour vérifier l&apos;intégrité du fichier téléchargé :
          </p>
          <code
            style={{
              display: "block",
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(0,0,0,0.25)",
              border: "1px solid var(--ice-border, rgba(255,255,255,0.12))",
              color: "var(--ice-text)",
              fontSize: "0.72rem",
              overflowWrap: "anywhere",
            }}
          >
            SHA-256 : {MOBILE_APP.sha256}
          </code>
          <p style={{ margin: "8px 0 0", fontSize: "0.78rem", color: "var(--ice-text-muted)" }}>
            Le téléchargement nécessite une session active. Si le bouton ouvre une page vide, reconnectez-vous.
          </p>
        </section>

        <section style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--ice-text-muted)", fontSize: "0.82rem" }}>
          <CheckCircle2 size={16} style={{ color: "#4ade80", flexShrink: 0 }} />
          <span>
            En cas de difficulté, contactez l&apos;administrateur CARZONE avec le modèle de téléphone et la
            version Android.
          </span>
        </section>
      </div>
    </AppShell>
  );
}
