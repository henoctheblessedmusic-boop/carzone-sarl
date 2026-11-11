"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export function PurchaseOrderPrintToolbar({ backHref }: { backHref: string }) {
  return (
    <div
      className="no-print"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        background: "var(--surface)",
        color: "var(--text-muted)",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      <Link
        href={backHref}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--text-muted)",
          textDecoration: "none",
          fontSize: "0.85rem",
        }}
      >
        <ArrowLeft size={16} /> Retour aux dépenses
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          border: "none",
          borderRadius: 8,
          background: "var(--accent)",
          color: "var(--text-on-accent)",
          padding: "8px 14px",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: "0.85rem",
        }}
      >
        <Printer size={15} /> Imprimer / PDF
      </button>
    </div>
  );
}
