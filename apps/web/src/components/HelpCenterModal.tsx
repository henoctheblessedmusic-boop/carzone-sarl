"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  BookOpen,
  TrendingUp,
  Car,
  Wrench,
  Receipt,
  PhoneCall,
  Zap,
  Users,
  ShieldCheck,
  X,
  Compass,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import type { Role } from "@/lib/roles";
import { usePrefs } from "@/components/PrefsProvider";
import {
  helpCenterCopy,
  type HelpCenterCopy,
  type HelpCenterTopicCopy,
} from "@/lib/i18n/messages/help-center";

type HelpTopic = {
  id: string;
  title: string;
  icon: typeof BookOpen;
  badge: string;
  summary: string;
  linkText?: string;
  linkHref?: string;
  sections: {
    heading: string;
    content: string;
    tips?: string[];
  }[];
};

/** Partie technique des rubriques : identifiant stable, icône, route cible. */
const HELP_TOPIC_META: {
  id: string;
  key: keyof HelpCenterCopy["topics"];
  icon: typeof BookOpen;
  linkHref?: string;
}[] = [
  { id: "getting-started", key: "gettingStarted", icon: Compass },
  { id: "dashboard", key: "dashboard", icon: TrendingUp, linkHref: "/dashboard" },
  { id: "vehicles", key: "vehicles", icon: Car, linkHref: "/vehicles" },
  { id: "workshop", key: "workshop", icon: Wrench, linkHref: "/workshop" },
  { id: "invoices-expenses", key: "invoicesExpenses", icon: Receipt, linkHref: "/invoices" },
  { id: "voip-chat", key: "voipChat", icon: PhoneCall, linkHref: "/chat" },
  { id: "charging", key: "charging", icon: Zap, linkHref: "/charging" },
  { id: "security", key: "security", icon: ShieldCheck, linkHref: "/users" },
];

function buildHelpTopics(copy: HelpCenterCopy): HelpTopic[] {
  return HELP_TOPIC_META.map((meta) => {
    const topic: HelpCenterTopicCopy = copy.topics[meta.key];
    return {
      id: meta.id,
      title: topic.title,
      icon: meta.icon,
      badge: topic.badge,
      summary: topic.summary,
      linkText: topic.linkText,
      linkHref: meta.linkHref,
      sections: topic.sections,
    };
  });
}

/** Repli français, conservé pour les consommateurs historiques de cet export. */
export const HELP_TOPICS: HelpTopic[] = buildHelpTopics(helpCenterCopy.fr);

export function HelpCenterModal({
  isOpen,
  onClose,
  userRole,
  userName,
}: {
  isOpen: boolean;
  onClose: () => void;
  userRole: Role;
  userName: string;
}) {
  const [activeTopicId, setActiveTopicId] = useState<string>("getting-started");
  const [searchQuery, setSearchQuery] = useState("");

  const { locale } = usePrefs();
  const copy = helpCenterCopy[locale];
  const helpTopics = useMemo(() => buildHelpTopics(copy), [copy]);

  // Permet d'ouvrir le Centre d'Aide via l'événement custom carzone:open_help
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const custom = e as CustomEvent<{ section?: string }>;
      if (custom.detail?.section) {
        setActiveTopicId(custom.detail.section);
      }
    };
    window.addEventListener("carzone:open_help", handleOpen);
    return () => window.removeEventListener("carzone:open_help", handleOpen);
  }, []);

  // Fermer avec la touche Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filtrer les sujets selon la recherche
  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return helpTopics;
    return helpTopics.filter((t) => {
      const inTitle = t.title.toLowerCase().includes(q);
      const inSummary = t.summary.toLowerCase().includes(q);
      const inSections = t.sections.some(
        (s) =>
          s.heading.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q) ||
          (s.tips && s.tips.some((tip) => tip.toLowerCase().includes(q)))
      );
      return inTitle || inSummary || inSections;
    });
  }, [searchQuery, helpTopics]);

  const activeTopic = useMemo(() => {
    return (
      filteredTopics.find((t) => t.id === activeTopicId) ||
      filteredTopics[0] ||
      helpTopics[0]
    );
  }, [filteredTopics, activeTopicId, helpTopics]);

  function relaunchOnboarding() {
    onClose();
    window.dispatchEvent(new CustomEvent("carzone:reopen_onboarding"));
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface-sunken)",
        backdropFilter: "blur(12px)",
        padding: "1rem",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1060,
          height: "min(88vh, 760px)",
          borderRadius: 20,
          background: "var(--surface)",
          border: "1px solid var(--accent)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(225, 29, 72, 0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          color: "var(--text-strong)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header du Centre d'Aide */}
        <div
          style={{
            padding: "1.2rem 1.6rem",
            background: "linear-gradient(90deg, var(--accent-soft) 0%, var(--surface-sunken) 100%)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(225, 29, 72, 0.4)",
              }}
            >
              <HelpCircle size={24} color="var(--text-on-accent)" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {copy.header.title}
                </h2>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 750,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: "var(--accent-soft)",
                    color: "var(--danger-fg)",
                    border: "1px solid var(--accent)",
                  }}
                >
                  {copy.header.versionBadge}
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                {copy.header.subtitle}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Bouton pour relancer les Premiers Pas à tout moment */}
            <button
              type="button"
              onClick={relaunchOnboarding}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 13px",
                borderRadius: 8,
                background: "var(--accent-soft)",
                border: "1px solid var(--accent)",
                color: "var(--danger-fg)",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title={copy.header.relaunchTitle}
            >
              <Compass size={14} style={{ color: "var(--danger-fg)" }} />
              <span>{copy.header.relaunchCta}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--surface-soft)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              title={copy.header.closeTitle}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Barre de Recherche */}
        <div
          style={{
            padding: "0.75rem 1.6rem",
            background: "var(--surface-soft)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Search size={17} style={{ color: "var(--text-subtle)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={copy.search.placeholder}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-strong)",
              fontSize: "0.88rem",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "0.75rem",
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              {copy.search.clear}
            </button>
          )}
        </div>

        {/* Corps : Menu à gauche & Contenu à droite */}
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* Liste des rubriques à gauche */}
          <div
            style={{
              width: "min(320px, 35%)",
              borderRight: "1px solid var(--border)",
              background: "var(--surface-sunken)",
              overflowY: "auto",
              padding: "0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 750,
                color: "var(--text-subtle)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "6px 10px 4px",
              }}
            >
              {copy.sidebar.heading}
            </div>

            {filteredTopics.map((topic) => {
              const Icon = topic.icon;
              const isActive = activeTopic.id === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setActiveTopicId(topic.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: isActive
                      ? "1px solid var(--accent)"
                      : "1px solid transparent",
                    background: isActive
                      ? "linear-gradient(135deg, var(--accent-soft) 0%, var(--surface) 100%)"
                      : "transparent",
                    color: isActive ? "var(--text-strong)" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "var(--text-disabled)";
                      e.currentTarget.style.color = "var(--text-strong)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#94a3b8";
                    }
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background: isActive ? "var(--accent)" : "var(--surface-soft)",
                      color: "var(--text-on-accent)",
                    }}
                  >
                    <Icon size={15} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: isActive ? 750 : 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {topic.title}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>{topic.badge}</div>
                  </div>

                  {isActive && <ChevronRight size={14} style={{ color: "var(--danger-fg)", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {/* Panneau de lecture du guide à droite */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.5rem 2rem",
              background: "var(--surface-sunken)",
            }}
          >
            {activeTopic ? (
              <div style={{ maxWidth: 680 }}>
                {/* En-tête de section */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 750,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: "var(--accent-soft)",
                      color: "var(--danger-fg)",
                      border: "1px solid var(--accent)",
                      textTransform: "uppercase",
                    }}
                  >
                    {activeTopic.badge}
                  </span>
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "var(--text-strong)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {activeTopic.title}
                </h3>
                <p style={{ margin: "6px 0 1.25rem", fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {activeTopic.summary}
                </p>

                {/* Bouton d'accès direct au module si disponible */}
                {activeTopic.linkHref && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <Link
                      href={activeTopic.linkHref}
                      onClick={onClose}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: "var(--accent)",
                        color: "var(--text-strong)",
                        textDecoration: "none",
                        fontSize: "0.82rem",
                        fontWeight: 750,
                        boxShadow: "0 4px 14px rgba(225, 29, 72, 0.35)",
                      }}
                    >
                      <span>{activeTopic.linkText || copy.reader.fallbackLinkText}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}

                {/* Blocs de contenu */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {activeTopic.sections.map((sec, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        padding: "1.2rem 1.4rem",
                        borderRadius: 14,
                        background: "var(--surface-sunken)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 8px",
                          fontSize: "1.02rem",
                          fontWeight: 750,
                          color: "var(--text-on-accent)",
                        }}
                      >
                        {sec.heading}
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                        {sec.content}
                      </p>

                      {sec.tips && sec.tips.length > 0 && (
                        <div
                          style={{
                            marginTop: "1rem",
                            paddingTop: "0.85rem",
                            borderTop: "1px solid var(--border)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {sec.tips.map((tip, tIdx) => (
                            <div
                              key={tIdx}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 8,
                                fontSize: "0.82rem",
                                color: "var(--text-muted)",
                                lineHeight: 1.5,
                              }}
                            >
                              <div style={{ marginTop: 2, color: "var(--success-fg)", flexShrink: 0 }}>
                                <CheckCircle2 size={14} />
                              </div>
                              <div>{tip}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                {copy.reader.noResults}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
