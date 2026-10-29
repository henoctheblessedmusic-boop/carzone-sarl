"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  Users,
  Clock,
  Phone,
  Radio,
  Building2,
  RefreshCw,
  Search,
} from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { usePrefs } from "@/components/PrefsProvider";
import { commsCopy, type CommsCopy } from "@/lib/i18n/messages/comms";
import type { ChatUser } from "../ChatView";

export type CallHistoryItem = {
  id: string;
  callType: "MISSED" | "INCOMING" | "OUTGOING" | "CONFERENCE";
  callerId: string;
  callerName: string;
  callerRole?: string | null;
  receiverId: string;
  receiverName: string;
  status: string;
  durationSeconds: number;
  isConference: boolean;
  createdAt: string;
  updatedAt: string;
};

function formatDuration(seconds: number, copy: CommsCopy["calls"]): string {
  if (!seconds || seconds <= 0) return copy.missedDuration;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h}${copy.hourUnit} ${remM < 10 ? "0" : ""}${remM}${copy.minuteUnit} ${s < 10 ? "0" : ""}${s}${copy.secondUnit}`;
  }
  return `${m < 10 ? "0" : ""}${m}${copy.minuteUnit} ${s < 10 ? "0" : ""}${s}${copy.secondUnit}`;
}

function formatDate(iso: string, copy: CommsCopy["calls"], dateLocale: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const timeStr = d.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" });

  if (isToday) {
    return copy.todayAt(timeStr);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return copy.yesterdayAt(timeStr);
  }

  return copy.dateAt(
    d.toLocaleDateString(dateLocale, { day: "2-digit", month: "2-digit" }),
    timeStr
  );
}

export function CallHistoryView({
  currentUser,
  colleagueList,
  onCallColleague,
  onJoinConference,
}: {
  currentUser: { id: string; fullName: string; role: string };
  colleagueList: ChatUser[];
  onCallColleague: (peer: ChatUser) => void;
  onJoinConference: (roomId: string) => void;
}) {
  const [calls, setCalls] = useState<CallHistoryItem[]>([]);
  const { locale } = usePrefs();
  const comms = commsCopy[locale];
  const copy = comms.calls;
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "MISSED" | "DIRECT" | "CONFERENCE">("ALL");
  const [scope, setScope] = useState<"me" | "all">("me");
  const [searchQuery, setSearchQuery] = useState("");

  const isPrivileged =
    currentUser.role === "DEVELOPER" ||
    currentUser.role === "PDG" ||
    currentUser.role === "SG" ||
    currentUser.role === "DG" ||
    currentUser.role === "ADMIN";

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/calls?history=1&scope=${scope}`);
      if (res.ok) {
        const data = await res.json();
        setCalls(data.history || []);
      }
    } catch {
      // Ignorer
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 4500);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  // Marquer les appels en absence comme consultés
  useEffect(() => {
    fetch("/api/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_missed_read" }),
    }).catch(() => {});
  }, []);

  // KPIs
  const missedCalls = calls.filter((c) => c.callType === "MISSED");
  const directCalls = calls.filter((c) => c.callType === "INCOMING" || c.callType === "OUTGOING");
  const conferenceCalls = calls.filter((c) => c.callType === "CONFERENCE");
  const totalSeconds = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);

  // Filtrage
  const filteredCalls = calls.filter((c) => {
    if (filter === "MISSED" && c.callType !== "MISSED") return false;
    if (filter === "CONFERENCE" && c.callType !== "CONFERENCE") return false;
    if (filter === "DIRECT" && c.callType !== "INCOMING" && c.callType !== "OUTGOING") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCaller = c.callerName.toLowerCase().includes(q);
      const matchReceiver = c.receiverName.toLowerCase().includes(q);
      return matchCaller || matchReceiver;
    }

    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", padding: "18px 24px" }}>
      {/* En-tête avec titre et sélecteur de portée Direction */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--gold, #d4af37)" }}>
              <Clock size={24} />
            </span>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--ice-text)" }}>
              {copy.title}
            </h2>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", opacity: 0.7 }}>
            {copy.subtitle}
          </p>
        </div>

        {/* Sélecteur de portée (Mes appels vs Flotte complète si Direction) */}
        {isPrivileged && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.12))",
              borderRadius: 8,
              padding: 3,
            }}
          >
            <button
              type="button"
              onClick={() => setScope("me")}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                background: scope === "me" ? "rgba(212, 175, 55, 0.2)" : "transparent",
                color: scope === "me" ? "var(--gold, #d4af37)" : "var(--ice-text)",
                fontSize: "0.78rem",
                fontWeight: scope === "me" ? 700 : 500,
                cursor: "pointer",
              }}
            >
              {copy.scopeMine}
            </button>
            <button
              type="button"
              onClick={() => setScope("all")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                background: scope === "all" ? "rgba(212, 175, 55, 0.2)" : "transparent",
                color: scope === "all" ? "var(--gold, #d4af37)" : "var(--ice-text)",
                fontSize: "0.78rem",
                fontWeight: scope === "all" ? 700 : 500,
                cursor: "pointer",
              }}
              title={copy.scopeCompanyTitle}
            >
              <Building2 size={13} />
              <span>{copy.scopeCompany}</span>
            </button>
          </div>
        )}
      </div>

      {/* Cartes KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.03))",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: 10,
            padding: "12px 14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", color: "#f87171" }}>
              {copy.kpi.missed}
            </span>
            <PhoneMissed size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f87171", marginTop: 4 }}>
            {missedCalls.length}
          </div>
          <div style={{ fontSize: "0.7rem", opacity: 0.75, marginTop: 2 }}>
            {missedCalls.length > 0 ? copy.kpi.missedPending : copy.kpi.missedNone}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
            borderRadius: 10,
            padding: "12px 14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", color: "#4ade80" }}>
              {copy.kpi.direct}
            </span>
            <PhoneIncoming size={16} color="#22c55e" />
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--ice-text)", marginTop: 4 }}>
            {directCalls.length}
          </div>
          <div style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: 2 }}>
            {copy.kpi.directDetail}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
            borderRadius: 10,
            padding: "12px 14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", color: "#a855f7" }}>
              {copy.kpi.conference}
            </span>
            <Users size={16} color="#c084fc" />
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--ice-text)", marginTop: 4 }}>
            {conferenceCalls.length}
          </div>
          <div style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: 2 }}>
            {copy.kpi.conferenceDetail}
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(212, 175, 55, 0.03))",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: 10,
            padding: "12px 14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", color: "var(--gold, #d4af37)" }}>
              {copy.kpi.total}
            </span>
            <Clock size={16} color="var(--gold, #d4af37)" />
          </div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--gold, #d4af37)", marginTop: 4 }}>
            {formatDuration(totalSeconds, copy)}
          </div>
          <div style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: 2 }}>
            {copy.kpi.totalDetail}
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: filter === "ALL" ? "1px solid var(--gold, #d4af37)" : "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
              background: filter === "ALL" ? "rgba(212, 175, 55, 0.2)" : "rgba(255, 255, 255, 0.03)",
              color: filter === "ALL" ? "var(--gold, #d4af37)" : "var(--ice-text)",
              fontSize: "0.76rem",
              fontWeight: filter === "ALL" ? 700 : 500,
              cursor: "pointer",
            }}
          >
            {copy.filters.all(calls.length)}
          </button>

          <button
            type="button"
            onClick={() => setFilter("MISSED")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: filter === "MISSED" ? "1px solid #ef4444" : "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
              background: filter === "MISSED" ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.03)",
              color: filter === "MISSED" ? "#f87171" : "var(--ice-text)",
              fontSize: "0.76rem",
              fontWeight: filter === "MISSED" ? 700 : 500,
              cursor: "pointer",
            }}
          >
            {copy.filters.missed(missedCalls.length)}
          </button>

          <button
            type="button"
            onClick={() => setFilter("DIRECT")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: filter === "DIRECT" ? "1px solid #22c55e" : "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
              background: filter === "DIRECT" ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.03)",
              color: filter === "DIRECT" ? "#4ade80" : "var(--ice-text)",
              fontSize: "0.76rem",
              fontWeight: filter === "DIRECT" ? 700 : 500,
              cursor: "pointer",
            }}
          >
            {copy.filters.direct(directCalls.length)}
          </button>

          <button
            type="button"
            onClick={() => setFilter("CONFERENCE")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: filter === "CONFERENCE" ? "1px solid #a855f7" : "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
              background: filter === "CONFERENCE" ? "rgba(168, 85, 247, 0.2)" : "rgba(255, 255, 255, 0.03)",
              color: filter === "CONFERENCE" ? "#c084fc" : "var(--ice-text)",
              fontSize: "0.76rem",
              fontWeight: filter === "CONFERENCE" ? 700 : 500,
              cursor: "pointer",
            }}
          >
            {copy.filters.conference(conferenceCalls.length)}
          </button>
        </div>

        {/* Barre de recherche */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--ice-chat-input-bg, rgba(0, 0, 0, 0.25))",
            border: "1px solid var(--ice-chat-input-border, rgba(255, 255, 255, 0.12))",
            borderRadius: 6,
            padding: "5px 10px",
            minWidth: 200,
          }}
        >
          <Search size={13} opacity={0.6} />
          <input
            type="text"
            placeholder={copy.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--ice-chat-input-text, var(--ice-text))",
              outline: "none",
              fontSize: "0.78rem",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* Liste des appels */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {loading && calls.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", opacity: 0.6 }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: 8, fontSize: "0.85rem" }}>{copy.loading}</p>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px dashed var(--ice-border, rgba(255, 255, 255, 0.1))",
              color: "var(--ice-text)",
              opacity: 0.7,
            }}
          >
            {copy.empty}
          </div>
        ) : (
          filteredCalls.map((c) => {
            const isMissed = c.callType === "MISSED";
            const isConference = c.callType === "CONFERENCE";
            const isOutgoing = c.callType === "OUTGOING";

            // Trouver l'interlocuteur pour le rappel direct
            const targetUserId = isOutgoing ? c.receiverId : c.callerId;
            const targetPeer = colleagueList.find((col) => col.id === targetUserId);

            return (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: isMissed
                    ? "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.02))"
                    : isConference
                    ? "linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(168, 85, 247, 0.02))"
                    : "rgba(255, 255, 255, 0.03)",
                  border: isMissed
                    ? "1px solid rgba(239, 68, 68, 0.35)"
                    : isConference
                    ? "1px solid rgba(168, 85, 247, 0.25)"
                    : "1px solid var(--ice-border, rgba(255, 255, 255, 0.08))",
                  gap: 12,
                  transition: "background 0.15s ease",
                }}
              >
                {/* Icône et détails d'appel */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: isMissed
                        ? "rgba(239, 68, 68, 0.2)"
                        : isConference
                        ? "rgba(168, 85, 247, 0.2)"
                        : isOutgoing
                        ? "rgba(59, 130, 246, 0.2)"
                        : "rgba(34, 197, 94, 0.2)",
                      color: isMissed
                        ? "#f87171"
                        : isConference
                        ? "#c084fc"
                        : isOutgoing
                        ? "#60a5fa"
                        : "#4ade80",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isMissed ? (
                      <PhoneMissed size={18} />
                    ) : isConference ? (
                      <Radio size={18} />
                    ) : isOutgoing ? (
                      <PhoneOutgoing size={18} />
                    ) : (
                      <PhoneIncoming size={18} />
                    )}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: isMissed ? "#f87171" : "var(--ice-text)",
                        }}
                      >
                        {isConference ? c.receiverName : isOutgoing ? copy.toName(c.receiverName) : copy.fromName(c.callerName)}
                      </span>

                      {/* Rôle */}
                      {c.callerRole && (
                        <span style={{ fontSize: "0.7rem", opacity: 0.6, background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4 }}>
                          {ROLE_LABELS[c.callerRole as Role] || c.callerRole}
                        </span>
                      )}

                      {/* Badge appel en absence */}
                      {isMissed && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: 6,
                            background: "rgba(239, 68, 68, 0.25)",
                            color: "#ef4444",
                            border: "1px solid rgba(239, 68, 68, 0.4)",
                          }}
                        >
                          {copy.missedBadge}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3, fontSize: "0.76rem", opacity: 0.7 }}>
                      <span>{formatDate(c.createdAt, copy, comms.dateLocale)}</span>
                      <span>•</span>
                      <span
                        style={{
                          fontWeight: 650,
                          color: isMissed ? "#ef4444" : "var(--gold, #d4af37)",
                        }}
                      >
                        {isMissed ? copy.notAnswered : copy.duration(formatDuration(c.durationSeconds, copy))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bouton d'action : Rappeler en 1 clic */}
                <div>
                  {isConference ? (
                    <button
                      type="button"
                      onClick={() => onJoinConference(c.receiverId)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(168, 85, 247, 0.4)",
                        background: "rgba(168, 85, 247, 0.15)",
                        color: "#c084fc",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <Radio size={14} />
                      <span>{copy.joinRoom}</span>
                    </button>
                  ) : targetPeer ? (
                    <button
                      type="button"
                      onClick={() => onCallColleague(targetPeer)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 14px",
                        borderRadius: 8,
                        border: isMissed
                          ? "1px solid rgba(239, 68, 68, 0.5)"
                          : "1px solid rgba(34, 197, 94, 0.4)",
                        background: isMissed
                          ? "linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.35))"
                          : "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(21, 128, 61, 0.3))",
                        color: isMissed ? "#fca5a5" : "#4ade80",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: isMissed ? "0 2px 10px rgba(239, 68, 68, 0.2)" : "none",
                      }}
                    >
                      <Phone size={13} />
                      <span>{isMissed ? copy.callBack : copy.call}</span>
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
