"use client";

import { useState } from "react";
import { Badge, DataTable } from "@/components/ui";
import { Edit2, X, Search } from "lucide-react";
import { createLead, updateLead, advanceLead } from "./actions";

export const LEAD_SOURCES = [
  { value: "showroom_akpakpa", label: "Showroom Akpakpa" },
  { value: "showroom_etoile_rouge", label: "Showroom Étoile Rouge" },
  { value: "showroom", label: "Showroom" },
  { value: "site_web", label: "Site web" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "prospection", label: "Prospection" },
  { value: "recommandation", label: "Recommandation" },
  { value: "referral", label: "Parrainage" },
  { value: "facebook", label: "FACEBOOK" },
  { value: "instagram", label: "INSTA" },
  { value: "linkedin", label: "LINKEDIN" },
  { value: "tiktok", label: "TIK TOK" },
];

export const SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  LEAD_SOURCES.map((s) => [s.value, s.label])
);

export type LeadItem = {
  id: string;
  contactName: string;
  email?: string | null;
  phone?: string | null;
  source: string;
  interest?: string | null;
  energyPref?: string | null;
  status: string;
  createdAt: string;
  assignee?: { fullName: string } | null;
};

export function LeadsView({ leads }: { leads: LeadItem[] }) {
  const [editingLead, setEditingLead] = useState<LeadItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState("");

  const filteredLeads = leads.filter((l) => {
    if (filterSource && l.source !== filterSource) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = l.contactName.toLowerCase().includes(q);
      const matchEmail = (l.email || "").toLowerCase().includes(q);
      const matchPhone = (l.phone || "").toLowerCase().includes(q);
      const matchInterest = (l.interest || "").toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchInterest;
    }
    return true;
  });

  return (
    <>
      {/* Formulaire de création rapide */}
      <form action={createLead} style={formRow} className="ox-glass">
        <input name="contactName" placeholder="Nom *" required style={input} />
        <input name="email" placeholder="Email" style={input} />
        <input name="phone" placeholder="Téléphone" style={input} />
        <select name="source" style={input} defaultValue="showroom">
          {LEAD_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <input name="interest" placeholder="Intérêt (SUV, berline…)" style={input} />
        <select name="energyPref" style={input} defaultValue="">
          <option value="">Énergie (opt.)</option>
          <option value="ELECTRIQUE">Électrique</option>
          <option value="HYBRIDE">Hybride</option>
          <option value="PHEV">PHEV</option>
          <option value="ESSENCE">Essence</option>
          <option value="DIESEL">Diesel</option>
        </select>
        <button type="submit" style={btn}>
          + Nouveau prospect
        </button>
      </form>

      {/* Barre de recherche et filtre */}
      <div style={{ display: "flex", gap: 10, margin: "14px 0", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", minWidth: 240, flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone, intérêt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...input, width: "100%", paddingLeft: 32 }}
          />
        </div>

        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          style={{ ...input, minWidth: 160 }}
        >
          <option value="">Toutes les sources</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table des prospects avec action Modifier */}
      <DataTable
        headers={["Contact", "Source", "Intérêt", "Énergie", "Assigné", "Statut", "Actions"]}
        rows={filteredLeads.map((l) => [
          <div key={l.id}>
            <div style={{ fontWeight: 650 }}>{l.contactName}</div>
            <div style={{ opacity: 0.65, fontSize: "0.8rem" }}>{l.email || l.phone || "—"}</div>
          </div>,
          <span
            key={`src-${l.id}`}
            style={{
              display: "inline-block",
              padding: "2px 8px",
              borderRadius: 6,
              background: "rgba(212, 175, 55, 0.15)",
              color: "var(--gold, #d4af37)",
              fontWeight: 650,
              fontSize: "0.78rem",
            }}
          >
            {SOURCE_LABELS[l.source] || l.source}
          </span>,
          l.interest || "—",
          l.energyPref || "—",
          l.assignee?.fullName || "—",
          <Badge key={`s-${l.id}`}>{l.status}</Badge>,
          <div key={`act-${l.id}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Bouton Modifier */}
            <button
              type="button"
              onClick={() => setEditingLead(l)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                background: "rgba(255, 255, 255, 0.06)",
                color: "var(--ice-text)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="Modifier les données de ce prospect"
            >
              <Edit2 size={12} color="var(--gold, #d4af37)" />
              <span>Modifier</span>
            </button>

            {/* Changement de statut */}
            <form action={advanceLead} style={{ display: "inline-flex", gap: 4 }}>
              <input type="hidden" name="id" value={l.id} />
              <select name="status" defaultValue={l.status} style={{ ...input, minWidth: 105, padding: "3px 6px", fontSize: "0.78rem" }}>
                {["NEW", "CONTACTED", "QUALIFIED", "MATCHED", "TEST_DRIVE", "QUOTE_SENT", "WON", "LOST"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="submit" style={{ ...btnSmall, padding: "4px 8px" }}>OK</button>
            </form>
          </div>,
        ])}
      />

      <p style={{ opacity: 0.65, fontSize: "0.85rem", marginTop: 12 }}>
        Semi-auto : faire passer le statut QUALIFIED → MATCHED après sélection stock, puis essai / devis.
      </p>

      {/* Modal de Modification Prospect */}
      {editingLead && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#161a20",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              borderRadius: 14,
              padding: 24,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--ice-text)" }}>
                ✏️ Modifier le Prospect
              </h3>
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                style={{ background: "none", border: "none", color: "var(--ice-text)", opacity: 0.6, cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateLead(formData);
                setEditingLead(null);
              }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <input type="hidden" name="id" value={editingLead.id} />

              <div>
                <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                  Nom complet / Contact *
                </label>
                <input
                  name="contactName"
                  defaultValue={editingLead.contactName}
                  required
                  style={{ ...input, width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingLead.email || ""}
                    style={{ ...input, width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Téléphone
                  </label>
                  <input
                    name="phone"
                    defaultValue={editingLead.phone || ""}
                    style={{ ...input, width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Source d&apos;acquisition
                  </label>
                  <select
                    name="source"
                    defaultValue={editingLead.source}
                    style={{ ...input, width: "100%" }}
                  >
                    {LEAD_SOURCES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Statut actuel
                  </label>
                  <select
                    name="status"
                    defaultValue={editingLead.status}
                    style={{ ...input, width: "100%" }}
                  >
                    {["NEW", "CONTACTED", "QUALIFIED", "MATCHED", "TEST_DRIVE", "QUOTE_SENT", "WON", "LOST"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Intérêt (Modèle / Catégorie)
                  </label>
                  <input
                    name="interest"
                    defaultValue={editingLead.interest || ""}
                    style={{ ...input, width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    Préférence Énergie
                  </label>
                  <select
                    name="energyPref"
                    defaultValue={editingLead.energyPref || ""}
                    style={{ ...input, width: "100%" }}
                  >
                    <option value="">Aucune</option>
                    <option value="ELECTRIQUE">Électrique</option>
                    <option value="HYBRIDE">Hybride</option>
                    <option value="PHEV">PHEV</option>
                    <option value="ESSENCE">Essence</option>
                    <option value="DIESEL">Diesel</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    background: "transparent",
                    color: "var(--ice-text)",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(135deg, #d4af37, #b48c1e)",
                    color: "#000",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const formRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, padding: "12px", borderRadius: 10 };
const input: React.CSSProperties = {
  padding: "0.55rem 0.7rem",
  borderRadius: 8,
  border: "1px solid var(--ice-border)",
  background: "var(--ice-input-bg)",
  color: "var(--ice-text)",
  minWidth: 130,
};
const btn: React.CSSProperties = {
  padding: "0.55rem 0.9rem",
  borderRadius: 8,
  border: 0,
  background: "linear-gradient(135deg, #c4a35a, #8b6914)",
  color: "#111",
  fontWeight: 650,
  cursor: "pointer",
};
const btnSmall: React.CSSProperties = { ...btn, padding: "0.35rem 0.6rem", fontSize: "0.8rem" };
