import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

export function Card({ children, style, className = "" }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={`ox-glass ${className}`} style={{ padding: "1rem 1.1rem", ...style }}>
      {children}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", marginBottom: 6, fontWeight: 550 }}>{label}</div>
      <div className="ox-metric-val" style={{ fontSize: "1.6rem" }}>{value}</div>
      {hint ? <div style={{ fontSize: "0.78rem", color: "var(--ice-text-muted)", marginTop: 4 }}>{hint}</div> : null}
    </Card>
  );
}

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="ox-table-wrap">
      <table className="ox-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="ox-btn" title={typeof children === "string" ? children : undefined}>
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "ok" | "warn" | "bad" | "neutral" | "ice";
}) {
  return <span className={`ox-badge ox-badge--${tone}`}>{children}</span>;
}

export function PolicyPanel() {
  return (
    <aside className="ox-callout" aria-label="Politique bon de commande">
      <h3>Politique bon de commande / proforma acceptée</h3>
      <p>
        Une fois un <strong>bon de commande</strong> ou une <strong>proforma acceptée / confirmée</strong> saisie
        dans CARZONE, le client <strong>ne peut pas l&apos;annuler unilatéralement</strong>.
      </p>
      <ul>
        <li>
          <strong>Pourquoi :</strong> réservation de stock / import, engagements fournisseur et flux bancaires déjà
          engagés.
        </li>
        <li>
          <strong>Avant confirmation :</strong> délai de réflexion autorisé ; demande d&apos;avenant possible tant
          que le document n&apos;est pas « envoyé / confirmé ».
        </li>
        <li>
          <strong>Après confirmation :</strong> seule une note de crédit commerciale / avenant avec validation
          DG + Comptabilité est possible, jamais une suppression silencieuse.
        </li>
        <li>
          <strong>SLA recommandé :</strong> cooling-off uniquement avant « envoyé/confirmé » ; après envoi = engagement
          ferme.
        </li>
      </ul>
    </aside>
  );
}
