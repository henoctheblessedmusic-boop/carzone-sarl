"use client";

// PolicyPanel lit la langue active via le contexte client : le module est donc
// déclaré comme frontière client, les primitives ci-dessous restent inchangées.
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { usePrefs } from "@/components/PrefsProvider";
import { sharedCopy } from "@/lib/i18n/messages/shared";

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
  const { locale } = usePrefs();
  const policy = sharedCopy[locale].policy;

  return (
    <aside className="ox-callout" aria-label={policy.ariaLabel}>
      <h3>{policy.title}</h3>
      <p>
        {policy.intro.before}
        <strong>{policy.intro.order}</strong>
        {policy.intro.between}
        <strong>{policy.intro.proforma}</strong>
        {policy.intro.after}
        <strong>{policy.intro.cannot}</strong>
        {policy.intro.end}
      </p>
      <ul>
        {policy.bullets.map((bullet) => (
          <li key={bullet.lead}>
            <strong>{bullet.lead}</strong> {bullet.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
