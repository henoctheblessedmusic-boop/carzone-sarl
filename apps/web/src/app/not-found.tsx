import Link from "next/link";
import { CarzoneLogo } from "@/components/CarzoneLogo";

export default function NotFound() {
  return (
    <div className="ox-login-page">
      <div
        className="ox-glass"
        style={{
          width: "100%",
          maxWidth: 480,
          padding: "2.25rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.1rem",
          textAlign: "center",
        }}
      >
        <CarzoneLogo size="lg" priority />

        <div
          style={{
            fontSize: "3.25rem",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            background: "var(--accent)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </div>

        <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 750 }}>
          Page introuvable
        </h1>

        <p style={{ margin: 0, opacity: 0.75, fontSize: "0.92rem", maxWidth: 380 }}>
          Cette page n&apos;existe pas ou a été déplacée. Elle a peut-être été
          renommée, supprimée, ou le lien que vous avez suivi est incorrect.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.6rem",
            marginTop: "0.4rem",
            width: "100%",
          }}
        >
          <Link href="/dashboard" className="ox-btn" style={{ textDecoration: "none" }}>
            Retour au tableau de bord
          </Link>
          <a
            href="mailto:contact@topcarzone.com"
            className="ox-btn"
            style={{
              textDecoration: "none",
              background: "transparent",
              border: "1px solid var(--ice-border)",
              color: "inherit",
            }}
          >
            Nous contacter
          </a>
        </div>
      </div>
    </div>
  );
}
