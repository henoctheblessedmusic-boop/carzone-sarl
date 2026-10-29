"use client";

import { useState } from "react";
import { Badge, DataTable } from "@/components/ui";
import { Edit2, X, Search } from "lucide-react";
import { usePrefs } from "@/components/PrefsProvider";
import {
  crmCopy,
  leadEnergyLabel,
  leadSourceLabel,
  leadStatusLabel,
} from "@/lib/i18n/messages/crm";
import { createLead, updateLead, advanceLead } from "./actions";

export const LEAD_SOURCES = [
  { value: "showroom_maro_militaire", label: "Showroom Maro-Militaire (Gbèdomidji)" },
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
  const { locale } = usePrefs();
  const copy = crmCopy[locale];
  const leadsCopy = copy.leads;
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
        <input name="contactName" placeholder={leadsCopy.form.contactPlaceholder} required style={input} />
        <input name="email" placeholder={leadsCopy.form.emailPlaceholder} style={input} />
        <input name="phone" placeholder={leadsCopy.form.phonePlaceholder} style={input} />
        <select name="source" style={input} defaultValue="showroom">
          {LEAD_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {leadSourceLabel(copy, s.value)}
            </option>
          ))}
        </select>
        <input name="interest" placeholder={leadsCopy.form.interestPlaceholder} style={input} />
        <select name="energyPref" style={input} defaultValue="">
          <option value="">{leadsCopy.form.energyPlaceholder}</option>
          <option value="ELECTRIQUE">{leadsCopy.energy.ELECTRIQUE}</option>
          <option value="HYBRIDE">{leadsCopy.energy.HYBRIDE}</option>
          <option value="PHEV">{leadsCopy.energy.PHEV}</option>
          <option value="ESSENCE">{leadsCopy.energy.ESSENCE}</option>
          <option value="DIESEL">{leadsCopy.energy.DIESEL}</option>
        </select>
        <button type="submit" style={btn}>
          {leadsCopy.form.submit}
        </button>
      </form>

      {/* Barre de recherche et filtre */}
      <div style={{ display: "flex", gap: 10, margin: "14px 0", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", minWidth: 240, flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }} />
          <input
            type="text"
            placeholder={leadsCopy.search.placeholder}
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
          <option value="">{leadsCopy.search.allSources}</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {leadSourceLabel(copy, s.value)}
            </option>
          ))}
        </select>
      </div>

      {/* Table des prospects avec action Modifier */}
      <DataTable
        headers={[
          leadsCopy.table.contact,
          leadsCopy.table.source,
          leadsCopy.table.interest,
          leadsCopy.table.energy,
          leadsCopy.table.assignee,
          leadsCopy.table.status,
          leadsCopy.table.actions,
        ]}
        rows={filteredLeads.map((l) => [
          <div key={l.id}>
            <div style={{ fontWeight: 650 }}>{l.contactName}</div>
            <div style={{ opacity: 0.65, fontSize: "0.8rem" }}>{l.email || l.phone || "-"}</div>
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
            {leadSourceLabel(copy, l.source)}
          </span>,
          l.interest || "-",
          l.energyPref ? leadEnergyLabel(copy, l.energyPref) : "-",
          l.assignee?.fullName || "-",
          <Badge key={`s-${l.id}`}>{leadStatusLabel(copy, l.status)}</Badge>,
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
              title={leadsCopy.actions.editTitle}
            >
              <Edit2 size={12} color="var(--gold, #d4af37)" />
              <span>{leadsCopy.actions.edit}</span>
            </button>

            {/* Changement de statut */}
            <form action={advanceLead} style={{ display: "inline-flex", gap: 4 }}>
              <input type="hidden" name="id" value={l.id} />
              <select name="status" defaultValue={l.status} style={{ ...input, minWidth: 105, padding: "3px 6px", fontSize: "0.78rem" }}>
                {["NEW", "CONTACTED", "QUALIFIED", "MATCHED", "TEST_DRIVE", "QUOTE_SENT", "WON", "LOST"].map((s) => (
                  <option key={s} value={s}>{leadStatusLabel(copy, s)}</option>
                ))}
              </select>
              <button type="submit" style={{ ...btnSmall, padding: "4px 8px" }}>{leadsCopy.actions.apply}</button>
            </form>
          </div>,
        ])}
      />

      <p style={{ opacity: 0.65, fontSize: "0.85rem", marginTop: 12 }}>
        {leadsCopy.hint}
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
                {leadsCopy.modal.title}
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
                  {leadsCopy.modal.nameLabel}
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
                    {leadsCopy.modal.emailLabel}
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
                    {leadsCopy.modal.phoneLabel}
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
                    {leadsCopy.modal.sourceLabel}
                  </label>
                  <select
                    name="source"
                    defaultValue={editingLead.source}
                    style={{ ...input, width: "100%" }}
                  >
                    {LEAD_SOURCES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {leadSourceLabel(copy, s.value)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    {leadsCopy.modal.statusLabel}
                  </label>
                  <select
                    name="status"
                    defaultValue={editingLead.status}
                    style={{ ...input, width: "100%" }}
                  >
                    {["NEW", "CONTACTED", "QUALIFIED", "MATCHED", "TEST_DRIVE", "QUOTE_SENT", "WON", "LOST"].map((s) => (
                      <option key={s} value={s}>{leadStatusLabel(copy, s)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    {leadsCopy.modal.interestLabel}
                  </label>
                  <input
                    name="interest"
                    defaultValue={editingLead.interest || ""}
                    style={{ ...input, width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", opacity: 0.75, marginBottom: 4 }}>
                    {leadsCopy.modal.energyLabel}
                  </label>
                  <select
                    name="energyPref"
                    defaultValue={editingLead.energyPref || ""}
                    style={{ ...input, width: "100%" }}
                  >
                    <option value="">{leadsCopy.energyNone}</option>
                    <option value="ELECTRIQUE">{leadsCopy.energy.ELECTRIQUE}</option>
                    <option value="HYBRIDE">{leadsCopy.energy.HYBRIDE}</option>
                    <option value="PHEV">{leadsCopy.energy.PHEV}</option>
                    <option value="ESSENCE">{leadsCopy.energy.ESSENCE}</option>
                    <option value="DIESEL">{leadsCopy.energy.DIESEL}</option>
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
                  {leadsCopy.modal.cancel}
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
                  {leadsCopy.modal.save}
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
