"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Key,
  CheckCheck,
  Clock,
  X,
  LogIn,
  AlertOctagon,
  Globe,
  Radio,
} from "lucide-react";

export type AdminNotif = {
  id: string;
  type: string;
  title: string;
  message: string;
  userName?: string | null;
  oldValue?: string | null; // Adresse IP
  newValue?: string | null; // User agent / Détail
  isRead: boolean;
  createdAt: string;
};

export function AdminNotificationsBell({ userRole }: { userRole: string }) {
  const isPrivileged =
    userRole === "DEVELOPER" ||
    userRole === "PDG" ||
    userRole === "SG" ||
    userRole === "DG" ||
    userRole === "ADMIN";

  const isDev = userRole === "DEVELOPER";

  const [notifications, setNotifications] = useState<AdminNotif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const fetchNotifs = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const list: AdminNotif[] = data.notifications || [];
        const count: number = data.unreadCount || 0;

        // Si le Développeur a de nouvelles alertes non lues, déclencher un bip sonore discret
        if (isDev && count > prevCountRef.current && prevCountRef.current !== 0) {
          playNotificationChime();
        }
        prevCountRef.current = count;

        setNotifications(list);
        setUnreadCount(count);
      }
    } catch {
      // Ignorer
    }
  };

  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Re5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // La5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Ignorer audio non autorisé par le navigateur
    }
  };

  useEffect(() => {
    if (!isPrivileged) return;
    fetchNotifs();
    // Le Développeur dispose d'un polling accéléré (5 secondes) pour une notification immédiate
    const intervalTime = isDev ? 5000 : 10000;
    const interval = setInterval(fetchNotifs, intervalTime);
    return () => clearInterval(interval);
  }, [isPrivileged, isDev]);


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isPrivileged) return null;

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignorer
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Ignorer
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifs();
        }}
        title="Alertes & Notifications (Mots de passe, système)"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 8,
          border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
          background: isOpen
            ? "rgba(212, 175, 55, 0.2)"
            : "var(--ice-card-bg, rgba(255, 255, 255, 0.05))",
          color: unreadCount > 0 ? "var(--gold, #d4af37)" : "var(--ice-text)",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              padding: "0 4px",
              borderRadius: 9,
              background: "#ef4444",
              color: "#fff",
              fontSize: "0.7rem",
              fontWeight: 750,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(239, 68, 68, 0.5)",
              animation: "pulse 2s infinite",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: 44,
            right: 0,
            width: 360,
            maxWidth: "90vw",
            background: "var(--ice-card-bg, #161a20)",
            border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
            borderRadius: 14,
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
              background: "rgba(255, 255, 255, 0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={16} color="var(--gold, #d4af37)" />
              <strong style={{ fontSize: "0.875rem", color: "var(--ice-text)" }}>
                Alertes de Sécurité
              </strong>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: "0.7rem",
                    padding: "2px 6px",
                    borderRadius: 10,
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#f87171",
                    fontWeight: 700,
                  }}
                >
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  title="Tout marquer comme lu"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--gold, #d4af37)",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <CheckCheck size={14} />
                  Tout lu
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  opacity: 0.6,
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List of Alerts */}
          <div
            style={{
              maxHeight: 380,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "30px 20px",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  opacity: 0.6,
                }}
              >
                Aucune alerte enregistrée pour le moment.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkOneRead(n.id)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--ice-border, rgba(255, 255, 255, 0.06))",
                    background: n.isRead
                      ? "transparent"
                      : "rgba(212, 175, 55, 0.06)",
                    cursor: n.isRead ? "default" : "pointer",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    transition: "background 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      padding: 7,
                      borderRadius: 8,
                      background:
                        n.type === "LOGIN_ALERT"
                          ? "rgba(34, 197, 94, 0.15)"
                          : n.type === "RATE_LIMIT_ALERT"
                          ? "rgba(239, 68, 68, 0.18)"
                          : n.type === "PASSWORD_CHANGED"
                          ? "rgba(212, 175, 55, 0.15)"
                          : "rgba(59, 130, 246, 0.15)",
                      color:
                        n.type === "LOGIN_ALERT"
                          ? "#4ade80"
                          : n.type === "RATE_LIMIT_ALERT"
                          ? "#f87171"
                          : n.type === "PASSWORD_CHANGED"
                          ? "var(--gold, #d4af37)"
                          : "#60a5fa",
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  >
                    {n.type === "LOGIN_ALERT" ? (
                      <LogIn size={15} />
                    ) : n.type === "RATE_LIMIT_ALERT" ? (
                      <AlertOctagon size={15} />
                    ) : (
                      <Key size={14} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 650,
                          fontSize: "0.82rem",
                          color: "var(--ice-text)",
                        }}
                      >
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "#ef4444",
                          }}
                        />
                      )}
                    </div>
                    <p
                      style={{
                        margin: "4px 0",
                        fontSize: "0.78rem",
                        opacity: 0.85,
                        lineHeight: 1.35,
                      }}
                    >
                      {n.message}
                    </p>

                    {/* IP & Métadonnées de connexion */}
                    {n.oldValue && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 6,
                          margin: "4px 0 6px 0",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "2px 7px",
                            borderRadius: 6,
                            background:
                              n.type === "RATE_LIMIT_ALERT"
                                ? "rgba(239, 68, 68, 0.15)"
                                : "rgba(34, 197, 94, 0.12)",
                            color:
                              n.type === "RATE_LIMIT_ALERT" ? "#f87171" : "#4ade80",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            fontFamily: "monospace",
                          }}
                        >
                          <Globe size={11} />
                          IP: {n.oldValue}
                        </span>

                        {n.newValue && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              opacity: 0.6,
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={n.newValue}
                          >
                            {n.newValue}
                          </span>
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.7rem",
                        opacity: 0.5,
                      }}
                    >
                      <Clock size={11} />
                      {new Date(n.createdAt).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
