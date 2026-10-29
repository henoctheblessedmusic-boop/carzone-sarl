"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import {
  MessageSquare,
  Phone,
  Send,
  Smile,
  Users,
  Radio,
  CheckCheck,
  Search,
  Car,
  Wrench,
  X,
  Mic,
  PhoneOff,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { usePrefs } from "@/components/PrefsProvider";
import { commsCopy } from "@/lib/i18n/messages/comms";
import { CallHistoryView } from "./components/CallHistoryView";
import { ConferenceRoomView } from "./components/ConferenceRoomView";
import { PREDEFINED_ROOMS } from "@/lib/conference-rooms";
import {
  sendChatMessage,
  toggleMessageReaction,
  getChatMessages,
  getColleagues,
} from "./actions";

export type ChatUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status?: "ONLINE" | "AWAY" | "OFFLINE";
  lastSeenAt?: string | null;
};

export type MessageItem = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string | null;
  receiverId?: string | null;
  channel?: string | null;
  content: string;
  sticker?: string | null;
  reactions: Record<string, string[]>;
  isBroadcast: boolean;
  recipientIds: string[];
  createdAt: string;
};

const POPULAR_EMOJIS = ["👍", "❤️", "😂", "🔥", "🚗", "👏"];

const STICKERS = [
  { code: "🚗" },
  { code: "✅" },
  { code: "🔧" },
  { code: "⚡" },
  { code: "🤝" },
  { code: "💰" },
  { code: "🎯" },
  { code: "📞" },
  { code: "👏" },
  { code: "🚀" },
];

export function ChatView({
  currentUser,
  colleagues,
  initialMessages,
}: {
  currentUser: { id: string; fullName: string; role: string };
  colleagues: ChatUser[];
  initialMessages: MessageItem[];
}) {
  const [activeTab, setActiveTab] = useState<"CHANNEL" | "DIRECT" | "BROADCAST" | "CONFERENCE" | "CALL_HISTORY">("CHANNEL");
  const { locale } = usePrefs();
  const comms = commsCopy[locale];
  const copy = comms.chat;
  const [selectedChannel, setSelectedChannel] = useState("GENERAL");
  const [selectedPeer, setSelectedPeer] = useState<ChatUser | null>(null);
  const [selectedConferenceRoom, setSelectedConferenceRoom] = useState<string>("CONF_DIRECTION");
  const [missedCallsCount, setMissedCallsCount] = useState(0);
  const [liveRoomsData, setLiveRoomsData] = useState<Record<string, number>>({});
  const [mobileScreen, setMobileScreen] = useState<"LIST" | "CHAT">("LIST");

  const [colleagueList, setColleagueList] = useState<ChatUser[]>(colleagues);
  const [offlineCallPrompt, setOfflineCallPrompt] = useState<ChatUser | null>(null);

  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Broadcast Modal State (DG / Admin)
  const [broadcastTarget, setBroadcastTarget] = useState<"ALL" | "CUSTOM">("ALL");
  const [selectedBroadcastUsers, setSelectedBroadcastUsers] = useState<string[]>([]);
  const [broadcastText, setBroadcastText] = useState("");
  const [isPending, startTransition] = useTransition();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // État des messages non lus (Directs & Diffusion)
  const [unreadBySender, setUnreadBySender] = useState<Record<string, number>>({});
  const [broadcastUnread, setBroadcastUnread] = useState(0);

  // Écouter les appels en absence
  useEffect(() => {
    const handleMissed = (e: Event) => {
      const custom = e as CustomEvent<{ count: number }>;
      if (custom.detail && typeof custom.detail.count === "number") {
        setMissedCallsCount(custom.detail.count);
      }
    };
    window.addEventListener("carzone:missed_calls", handleMissed);
    return () => window.removeEventListener("carzone:missed_calls", handleMissed);
  }, []);

  // Polling des salons de conférence en direct
  useEffect(() => {
    const checkRooms = async () => {
      try {
        const res = await fetch("/api/calls/conference?listRooms=1");
        if (res.ok) {
          const data = await res.json();
          const counts: Record<string, number> = {};
          if (Array.isArray(data.rooms)) {
            for (const r of data.rooms) {
              counts[r.id] = r.participantCount || 0;
            }
          }
          setLiveRoomsData(counts);
        }
      } catch {}
    };
    checkRooms();
    const intv = setInterval(checkRooms, 5000);
    return () => clearInterval(intv);
  }, []);

  // Informer GlobalCallManager du peer actif pour éviter de toaster si la conversation est déjà ouverte
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { __carzoneActivePeerId?: string | null }).__carzoneActivePeerId =
        activeTab === "DIRECT" && selectedPeer ? selectedPeer.id : null;
    }
  }, [activeTab, selectedPeer]);

  // Synchroniser les non-lus depuis l'événement GlobalCallManager ou l'API
  useEffect(() => {
    const handleUnreadEvent = (e: Event) => {
      const custom = e as CustomEvent<{
        bySender?: Record<string, number>;
        broadcastUnread?: number;
      }>;
      if (custom.detail) {
        if (custom.detail.bySender) setUnreadBySender(custom.detail.bySender);
        if (typeof custom.detail.broadcastUnread === "number") setBroadcastUnread(custom.detail.broadcastUnread);
      }
    };
    window.addEventListener("carzone:unread_chat", handleUnreadEvent);

    fetch("/api/chat/unread")
      .then((r) => r.json())
      .then((data) => {
        if (data.bySender) setUnreadBySender(data.bySender);
        if (typeof data.broadcastUnread === "number") setBroadcastUnread(data.broadcastUnread);
      })
      .catch(() => {});

    return () => window.removeEventListener("carzone:unread_chat", handleUnreadEvent);
  }, []);

  // Marquer comme lus les messages du pair ou de la diffusion
  const markAsRead = useCallback(async (peerId?: string, isBroadcast?: boolean) => {
    try {
      if (peerId) {
        setUnreadBySender((prev) => {
          const next = { ...prev };
          delete next[peerId];
          return next;
        });
        await fetch("/api/chat/unread", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ peerId }),
        });
      } else if (isBroadcast) {
        setBroadcastUnread(0);
        await fetch("/api/chat/unread", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAllBroadcast: true }),
        });
      }
    } catch {
      // Ignorer
    }
  }, []);

  useEffect(() => {
    if (activeTab === "DIRECT" && selectedPeer) {
      markAsRead(selectedPeer.id, false);
    } else if (activeTab === "BROADCAST") {
      markAsRead(undefined, true);
    }
  }, [activeTab, selectedPeer, markAsRead]);

  const isPrivileged =
    currentUser.role === "DEVELOPER" ||
    currentUser.role === "PDG" ||
    currentUser.role === "SG" ||
    currentUser.role === "DG" ||
    currentUser.role === "ADMIN";

  // Fetch colleagues presence
  const refreshPresence = useCallback(async () => {
    try {
      const updated = await getColleagues();
      setColleagueList(updated);
    } catch {
      // Ignorer
    }
  }, []);

  // Periodic polling for colleagues presence status every 4s
  useEffect(() => {
    refreshPresence();
    const interval = setInterval(refreshPresence, 4000);
    return () => clearInterval(interval);
  }, [refreshPresence]);

  // Fetch messages for the active conversation
  const refreshMessages = useCallback(async () => {
    try {
      const res = await getChatMessages({
        channel: activeTab === "CHANNEL" ? selectedChannel : activeTab === "BROADCAST" ? "BROADCAST" : undefined,
        peerId: activeTab === "DIRECT" && selectedPeer ? selectedPeer.id : undefined,
      });
      setMessages(res);
      if (activeTab === "DIRECT" && selectedPeer) {
        markAsRead(selectedPeer.id, false);
      } else if (activeTab === "BROADCAST") {
        markAsRead(undefined, true);
      }
    } catch {
      // Ignorer
    }
  }, [activeTab, selectedChannel, selectedPeer, markAsRead]);

  // Periodic polling for new messages every 3.5s
  useEffect(() => {
    refreshMessages();
    const interval = setInterval(refreshMessages, 3500);
    return () => clearInterval(interval);
  }, [refreshMessages]);

  // Scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Send message
  const handleSendMessage = (stickerCode?: string) => {
    const textToSend = inputText.trim();
    if (!textToSend && !stickerCode) return;

    setInputText("");
    setShowStickerPicker(false);

    startTransition(async () => {
      try {
        await sendChatMessage({
          channel: activeTab === "CHANNEL" ? selectedChannel : null,
          receiverId: activeTab === "DIRECT" && selectedPeer ? selectedPeer.id : null,
          content: textToSend,
          sticker: stickerCode || null,
        });
        await refreshMessages();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : copy.errors.sendMessage);
      }
    });
  };

  // Toggle reaction
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    try {
      await toggleMessageReaction(messageId, emoji);
      await refreshMessages();
    } catch {
      // Ignorer
    }
  };

  // Submit Broadcast (DG / Admin)
  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    if (broadcastTarget === "CUSTOM" && selectedBroadcastUsers.length === 0) {
      alert(copy.errors.noRecipient);
      return;
    }

    startTransition(async () => {
      try {
        await sendChatMessage({
          content: broadcastText.trim(),
          isBroadcast: true,
          channel: "BROADCAST",
          recipientIds: broadcastTarget === "ALL" ? [] : selectedBroadcastUsers,
        });

        const countTarget =
          broadcastTarget === "ALL"
            ? copy.broadcast.allCompany
            : copy.broadcast.someCount(selectedBroadcastUsers.length);

        setBroadcastText("");
        setShowBroadcastModal(false);
        setActiveTab("BROADCAST");
        await refreshMessages();
        alert(copy.broadcast.success(countTarget));
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : copy.errors.sendBroadcast);
      }
    });
  };

  // Proceed with voice call helper
  const proceedWithCall = (peer: ChatUser) => {
    if (typeof window !== "undefined" && window.startVoiceCall) {
      window.startVoiceCall(peer.id, peer.fullName);
    } else {
      alert(copy.errors.audioInit);
    }
  };

  // Trigger audio call with offline warning
  const handleStartCall = () => {
    if (!selectedPeer) return;
    const current = colleagueList.find((c) => c.id === selectedPeer.id) || selectedPeer;
    if (current.status === "OFFLINE") {
      setOfflineCallPrompt(current);
      return;
    }
    proceedWithCall(current);
  };

  const filteredColleagues = colleagueList.filter((c) =>
    c.fullName.toLowerCase().includes(searchUser.toLowerCase()) ||
    c.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    c.role.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div
      className={`ox-chat-container ${mobileScreen === "CHAT" ? "show-chat" : "show-list"}`}
    >
      {/* ============================================================ */}
      {/* LEFT SIDEBAR: CANAUX & LISTE DES COLLÈGUES                  */}
      {/* ============================================================ */}
      <div className="ox-chat-sidebar">
        {/* Sidebar Header */}
        <div
          style={{
            padding: "16px 18px",
            borderBottom: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--gold, #d4af37)" }}>
                <MessageSquare size={20} />
              </span>
              <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--ice-text)" }}>
                {copy.title}
              </h2>
            </div>

            {/* Broadcast Button (DG / Admin) */}
            {isPrivileged && (
              <button
                type="button"
                onClick={() => setShowBroadcastModal(true)}
                title={copy.broadcast.buttonTitle}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 9px",
                  borderRadius: 6,
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  background: "rgba(212, 175, 55, 0.15)",
                  color: "var(--gold, #d4af37)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Radio size={13} />
                {copy.broadcast.button}
              </button>
            )}
          </div>
        </div>

        {/* Scrollable list */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {/* Canaux d'équipe */}
          <div style={{ padding: "12px 14px 6px 14px" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.55, marginBottom: 8 }}>
              {copy.channelsTitle}
            </div>

            <button
              onClick={() => {
                setActiveTab("CHANNEL");
                setSelectedChannel("GENERAL");
                setSelectedPeer(null);
                setMobileScreen("CHAT");
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background:
                  activeTab === "CHANNEL" && selectedChannel === "GENERAL"
                    ? "rgba(212, 175, 55, 0.15)"
                    : "transparent",
                color:
                  activeTab === "CHANNEL" && selectedChannel === "GENERAL"
                    ? "var(--gold, #d4af37)"
                    : "var(--ice-text)",
                fontWeight: activeTab === "CHANNEL" && selectedChannel === "GENERAL" ? 650 : 400,
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.85rem",
              }}
            >
              <Users size={16} />
              <span>{copy.channels.general}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("CHANNEL");
                setSelectedChannel("WORKSHOP");
                setSelectedPeer(null);
                setMobileScreen("CHAT");
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background:
                  activeTab === "CHANNEL" && selectedChannel === "WORKSHOP"
                    ? "rgba(212, 175, 55, 0.15)"
                    : "transparent",
                color:
                  activeTab === "CHANNEL" && selectedChannel === "WORKSHOP"
                    ? "var(--gold, #d4af37)"
                    : "var(--ice-text)",
                fontWeight: activeTab === "CHANNEL" && selectedChannel === "WORKSHOP" ? 650 : 400,
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.85rem",
              }}
            >
              <Wrench size={16} />
              <span>{copy.channels.workshop}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("CHANNEL");
                setSelectedChannel("COMMERCIAL");
                setSelectedPeer(null);
                setMobileScreen("CHAT");
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background:
                  activeTab === "CHANNEL" && selectedChannel === "COMMERCIAL"
                    ? "rgba(212, 175, 55, 0.15)"
                    : "transparent",
                color:
                  activeTab === "CHANNEL" && selectedChannel === "COMMERCIAL"
                    ? "var(--gold, #d4af37)"
                    : "var(--ice-text)",
                fontWeight: activeTab === "CHANNEL" && selectedChannel === "COMMERCIAL" ? 650 : 400,
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.85rem",
              }}
            >
              <Car size={16} />
              <span>{copy.channels.sales}</span>
            </button>

            {/* Canal Diffusion Spéciale */}
            <button
              onClick={() => {
                setActiveTab("BROADCAST");
                setSelectedPeer(null);
                setMobileScreen("CHAT");
                markAsRead(undefined, true);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background:
                  activeTab === "BROADCAST"
                    ? "rgba(212, 175, 55, 0.2)"
                    : "transparent",
                color:
                  activeTab === "BROADCAST"
                    ? "var(--gold, #d4af37)"
                    : "var(--ice-text)",
                fontWeight: activeTab === "BROADCAST" ? 700 : 400,
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.85rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Radio size={16} />
                <span>{copy.channels.broadcast}</span>
              </div>
              {broadcastUnread > 0 && (
                <span
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    background: "#ef4444",
                    color: "#ffffff",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 5px",
                    boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
                  }}
                  title={comms.notifications.unreadAnnouncements(broadcastUnread)}
                >
                  {broadcastUnread}
                </span>
              )}
            </button>
          </div>

          {/* Section Conférences & Historique Appels */}
          <div style={{ padding: "6px 14px 10px 14px", borderBottom: "1px solid var(--ice-border, rgba(255, 255, 255, 0.08))" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.55, marginBottom: 8 }}>
              {copy.callsSectionTitle}
            </div>

            {/* Historique des Appels */}
            <button
              onClick={() => {
                setActiveTab("CALL_HISTORY");
                setSelectedPeer(null);
                setMobileScreen("CHAT");
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background:
                  activeTab === "CALL_HISTORY"
                    ? "rgba(212, 175, 55, 0.2)"
                    : "transparent",
                color:
                  activeTab === "CALL_HISTORY"
                    ? "var(--gold, #d4af37)"
                    : "var(--ice-text)",
                fontWeight: activeTab === "CALL_HISTORY" ? 700 : 400,
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.85rem",
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Clock size={16} />
                <span>{copy.callHistory}</span>
              </div>
              {missedCallsCount > 0 && (
                <span
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    background: "#ef4444",
                    color: "#ffffff",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 5px",
                    boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
                  }}
                  title={comms.notifications.missedCalls(missedCallsCount)}
                >
                  {missedCallsCount}
                </span>
              )}
            </button>

            {/* Salons de Conférence */}
            {PREDEFINED_ROOMS.map((r) => {
              const count = liveRoomsData[r.id] || 0;
              const isSelected = activeTab === "CONFERENCE" && selectedConferenceRoom === r.id;

              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setActiveTab("CONFERENCE");
                    setSelectedConferenceRoom(r.id);
                    setSelectedPeer(null);
                    setMobileScreen("CHAT");
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: isSelected ? "rgba(168, 85, 247, 0.2)" : "transparent",
                    color: isSelected ? "#c084fc" : "var(--ice-text)",
                    fontWeight: isSelected ? 700 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "0.82rem",
                    marginBottom: 2,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden" }}>
                    <span>{r.icon}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.name}
                    </span>
                  </div>
                  {count > 0 && (
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: 8,
                        background: "rgba(34, 197, 94, 0.2)",
                        border: "1px solid rgba(34, 197, 94, 0.35)",
                        color: "#4ade80",
                        fontSize: "0.65rem",
                        fontWeight: 750,
                        flexShrink: 0,
                      }}
                    >
                      🟢 {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Collègues (Messages Directs & Appels) */}
          <div style={{ padding: "12px 14px", flex: 1 }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.55, marginBottom: 8 }}>
              {copy.directsTitle(colleagues.length)}
            </div>

            {/* Search colleague */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "var(--ice-chat-input-bg, rgba(0, 0, 0, 0.2))",
                border: "1px solid var(--ice-chat-input-border, rgba(255, 255, 255, 0.1))",
                borderRadius: 6,
                padding: "5px 10px",
                marginBottom: 8,
              }}
            >
              <Search size={13} opacity={0.6} />
              <input
                type="text"
                placeholder={copy.searchColleague}
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
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

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {filteredColleagues.map((colleague) => {
                const isSelected = activeTab === "DIRECT" && selectedPeer?.id === colleague.id;
                const unreadCount = unreadBySender[colleague.id] || 0;
                const rLabel = ROLE_LABELS[colleague.role as Role] || colleague.role;
                const statusColor =
                  colleague.status === "ONLINE"
                    ? "#22c55e"
                    : colleague.status === "AWAY"
                    ? "#eab308"
                    : "#ef4444";
                const statusLabel =
                  colleague.status === "ONLINE"
                    ? copy.presence.online
                    : colleague.status === "AWAY"
                    ? copy.presence.away
                    : copy.presence.offline;

                return (
                  <button
                    key={colleague.id}
                    onClick={() => {
                      setActiveTab("DIRECT");
                      setSelectedPeer(colleague);
                      setMobileScreen("CHAT");
                      markAsRead(colleague.id, false);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: isSelected ? "rgba(212, 175, 55, 0.15)" : "transparent",
                      color: isSelected ? "var(--gold, #d4af37)" : "var(--ice-text)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.12s ease",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {colleague.fullName.charAt(0).toUpperCase()}
                      <span
                        title={statusLabel}
                        style={{
                          position: "absolute",
                          bottom: -1,
                          right: -1,
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          background: statusColor,
                          border: "1.5px solid #161a20",
                          boxShadow:
                            colleague.status === "ONLINE"
                              ? "0 0 6px #22c55e"
                              : colleague.status === "AWAY"
                              ? "0 0 5px #eab308"
                              : "none",
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: isSelected ? 650 : (unreadCount > 0 ? 700 : 500),
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: unreadCount > 0 && !isSelected ? "#ffffff" : undefined,
                        }}
                      >
                        {colleague.fullName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          opacity: 0.85,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span>{rLabel}</span>
                        <span>•</span>
                        <span
                          style={{
                            fontWeight: 650,
                            color: statusColor,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    {unreadCount > 0 && (
                      <span
                        style={{
                          minWidth: 18,
                          height: 18,
                          borderRadius: 9,
                          background: "#ef4444",
                          color: "#ffffff",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 5px",
                          boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
                          flexShrink: 0,
                        }}
                        title={comms.notifications.unreadMessages(unreadCount)}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="ox-chat-pane">
        {activeTab === "CALL_HISTORY" ? (
          <CallHistoryView
            currentUser={currentUser}
            colleagueList={colleagueList}
            onCallColleague={proceedWithCall}
            onJoinConference={(roomId) => {
              setActiveTab("CONFERENCE");
              setSelectedConferenceRoom(roomId);
            }}
          />
        ) : activeTab === "CONFERENCE" ? (
          <ConferenceRoomView
            roomId={selectedConferenceRoom}
            currentUser={currentUser}
            colleagues={colleagueList}
            onLeave={() => {
              setActiveTab("CHANNEL");
              setSelectedChannel("GENERAL");
            }}
            onSwitchRoom={(newId) => setSelectedConferenceRoom(newId)}
          />
        ) : (
          <>
            {/* Pane Header */}
            <div className="ox-chat-pane-header">
          {(() => {
            const activePeer = selectedPeer
              ? colleagueList.find((c) => c.id === selectedPeer.id) || selectedPeer
              : null;
            const peerStatus = activePeer?.status || "OFFLINE";
            const peerStatusColor =
              peerStatus === "ONLINE"
                ? "#4ade80"
                : peerStatus === "AWAY"
                ? "#facc15"
                : "#f87171";
            const peerStatusBg =
              peerStatus === "ONLINE"
                ? "rgba(34, 197, 94, 0.15)"
                : peerStatus === "AWAY"
                ? "rgba(234, 179, 8, 0.15)"
                : "rgba(239, 68, 68, 0.15)";
            const peerStatusLabel =
              peerStatus === "ONLINE"
                ? copy.presence.online
                : peerStatus === "AWAY"
                ? copy.presence.away
                : copy.presence.offline;

            return (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                  {/* Bouton Retour Mobile */}
                  <button
                    type="button"
                    onClick={() => setMobileScreen("LIST")}
                    className="ox-chat-back-btn"
                    title={copy.backToList}
                    aria-label={copy.backToList}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "var(--ice-text)",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h3 style={{ margin: 0, fontSize: "1.02rem", fontWeight: 700, color: "var(--ice-text)" }}>
                        {activeTab === "CHANNEL"
                          ? selectedChannel === "WORKSHOP"
                            ? copy.channels.workshop
                            : selectedChannel === "COMMERCIAL"
                            ? copy.channels.sales
                            : copy.channels.general
                          : activeTab === "BROADCAST"
                          ? copy.broadcast.title
                          : selectedPeer?.fullName}
                      </h3>
                      {activeTab === "DIRECT" && selectedPeer && (
                        <>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              padding: "2px 7px",
                              borderRadius: 5,
                              background: "rgba(212, 175, 55, 0.15)",
                              color: "var(--gold, #d4af37)",
                              fontWeight: 650,
                            }}
                          >
                            {ROLE_LABELS[selectedPeer.role as Role] || selectedPeer.role}
                          </span>

                          <span
                            style={{
                              fontSize: "0.72rem",
                              padding: "2px 8px",
                              borderRadius: 5,
                              background: peerStatusBg,
                              color: peerStatusColor,
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: peerStatusColor,
                                boxShadow: peerStatus === "ONLINE" ? "0 0 6px #4ade80" : "none",
                              }}
                            />
                            {peerStatusLabel}
                          </span>
                        </>
                      )}
                    </div>

                    <div style={{ fontSize: "0.76rem", opacity: 0.6, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {activeTab === "CHANNEL"
                        ? copy.subtitle.channel
                        : activeTab === "BROADCAST"
                        ? copy.subtitle.broadcast
                        : copy.subtitle.direct}
                    </div>
                  </div>
                </div>

                {/* Audio Call & Mic buttons (Visible in 1-to-1 conversation) */}
                {activeTab === "DIRECT" && selectedPeer && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 8 }}>
                    {/* Test / Authorize Microphone Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined" && window.openMicModal) {
                          window.openMicModal();
                        }
                      }}
                      title={copy.micTitle}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "var(--ice-text)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Mic size={14} color="var(--gold, #d4af37)" />
                      <span>{copy.mic}</span>
                    </button>

                    {/* Audio Call button */}
                    <button
                      type="button"
                      onClick={handleStartCall}
                      title={
                        peerStatus === "OFFLINE"
                          ? copy.call.offlineTitle(selectedPeer.fullName)
                          : copy.call.callTitle(selectedPeer.fullName)
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 12px",
                        borderRadius: 8,
                        border:
                          peerStatus === "OFFLINE"
                            ? "1px solid rgba(239, 68, 68, 0.4)"
                            : "1px solid rgba(34, 197, 94, 0.4)",
                        background:
                          peerStatus === "OFFLINE"
                            ? "rgba(239, 68, 68, 0.12)"
                            : "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(21, 128, 61, 0.3))",
                        color: peerStatus === "OFFLINE" ? "#f87171" : "#4ade80",
                        fontSize: "0.8rem",
                        fontWeight: 650,
                        cursor: "pointer",
                        boxShadow:
                          peerStatus === "ONLINE"
                            ? "0 2px 10px rgba(34, 197, 94, 0.15)"
                            : "none",
                      }}
                    >
                      {peerStatus === "OFFLINE" ? <PhoneOff size={14} /> : <Phone size={14} />}
                      <span>{peerStatus === "OFFLINE" ? copy.call.offline : copy.call.call}</span>
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Message Bubble Stream */}
        <div className="ox-chat-messages">
          {messages.length === 0 ? (
            <div
              style={{
                margin: "auto",
                textAlign: "center",
                opacity: 0.5,
                fontSize: "0.875rem",
              }}
            >
              {copy.empty}
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === currentUser.id;

              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMe ? "flex-end" : "flex-start",
                  }}
                >
                  {/* Sender Name & Role */}
                  {!isMe && (
                    <div style={{ fontSize: "0.72rem", opacity: 0.65, marginBottom: 3, paddingLeft: 4 }}>
                      {m.senderName} • {m.senderRole || ""}
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "10px 14px",
                      borderRadius: 14,
                      background: m.isBroadcast
                        ? "linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(180, 140, 30, 0.35))"
                        : isMe
                        ? "var(--ice-chat-bubble-me-bg, linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(180, 140, 30, 0.25)))"
                        : "var(--ice-chat-bubble-peer-bg, #ffffff)",
                      border: m.isBroadcast
                        ? "1px solid rgba(212, 175, 55, 0.5)"
                        : isMe
                        ? "1px solid var(--ice-chat-bubble-me-border, rgba(212, 175, 55, 0.3))"
                        : "1px solid var(--ice-chat-bubble-peer-border, #e2e8f0)",
                      color: isMe
                        ? "var(--ice-chat-bubble-me-text, #ffffff)"
                        : "var(--ice-chat-bubble-peer-text, var(--ice-text))",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    {/* Broadcast Banner */}
                    {m.isBroadcast && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.72rem",
                          fontWeight: 750,
                          color: "var(--gold, #d4af37)",
                          background: "rgba(0, 0, 0, 0.35)",
                          padding: "3px 9px",
                          borderRadius: 6,
                          marginBottom: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        <Radio size={13} />
                        <span>{copy.broadcast.badge}</span>
                        <span style={{ opacity: 0.75, fontWeight: 500, fontSize: "0.68rem" }}>
                          • {m.recipientIds && m.recipientIds.length > 0 ? copy.broadcast.groupTarget(m.recipientIds.length) : copy.broadcast.allTarget}
                        </span>
                      </div>
                    )}

                    {/* Sticker (if present) */}
                    {m.sticker && (
                      <div
                        style={{
                          fontSize: "2.8rem",
                          lineHeight: 1.1,
                          margin: "4px 0",
                          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.25))",
                        }}
                      >
                        {m.sticker}
                      </div>
                    )}

                    {/* Text content (ignore legacy [Sticker: ...] placeholder) */}
                    {m.content && !m.content.startsWith("[Sticker:") && (
                      <div style={{ fontSize: "0.9rem", lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
                        {m.content}
                      </div>
                    )}

                    {/* Timestamp & read receipts */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 4,
                        fontSize: "0.68rem",
                        opacity: 0.55,
                        marginTop: 4,
                      }}
                    >
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString(comms.timeLocale, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMe && <CheckCheck size={12} color="#4ade80" />}
                    </div>
                  </div>

                  {/* Reaction Pills */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 3,
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Existing reactions (exclure le système interne readBy) */}
                    {Object.entries(m.reactions).map(([emoji, userIds]) => {
                      if (emoji === "readBy" || !Array.isArray(userIds) || userIds.length === 0) return null;
                      const hasReacted = userIds.includes(currentUser.id);

                      return (
                        <button
                          key={emoji}
                          onClick={() => handleToggleReaction(m.id, emoji)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "2px 6px",
                            borderRadius: 12,
                            border: hasReacted
                              ? "1px solid rgba(212, 175, 55, 0.4)"
                              : "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
                            background: hasReacted
                              ? "rgba(212, 175, 55, 0.15)"
                              : "rgba(255, 255, 255, 0.04)",
                            color: "var(--ice-text)",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          <span>{emoji}</span>
                          <span style={{ fontSize: "0.68rem", fontWeight: 650 }}>
                            {userIds.length}
                          </span>
                        </button>
                      );
                    })}

                    {/* Quick Reaction buttons on hover */}
                    <div style={{ display: "inline-flex", gap: 2, opacity: 0.6 }}>
                      {POPULAR_EMOJIS.slice(0, 3).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleToggleReaction(m.id, emoji)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            padding: "1px 2px",
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Sticker Picker Popup */}
        {showStickerPicker && (
          <div
            style={{
              padding: "12px 16px",
              background: "var(--ice-chat-header-bg, #ffffff)",
              borderTop: "1px solid var(--ice-chat-sidebar-border, rgba(255, 255, 255, 0.1))",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {STICKERS.map((st) => (
              <button
                key={st.code}
                onClick={() => handleSendMessage(st.code)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                  background: "rgba(255, 255, 255, 0.04)",
                  color: "var(--ice-text)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{st.code}</span>
                <span style={{ fontSize: "0.75rem" }}>{copy.stickers.labels[st.code] ?? st.code}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bottom Composer */}
        <div className="ox-chat-composer">
          {/* Stickers button */}
          <button
            type="button"
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            title={copy.stickers.title}
            style={{
              background: "none",
              border: "none",
              color: showStickerPicker ? "var(--gold, #d4af37)" : "var(--ice-text)",
              cursor: "pointer",
              padding: 6,
              opacity: showStickerPicker ? 1 : 0.7,
            }}
          >
            <Smile size={20} />
          </button>

          {/* Input field */}
          <input
            type="text"
            placeholder={
              activeTab === "CHANNEL"
                ? copy.placeholder.channel(selectedChannel.toLowerCase())
                : activeTab === "BROADCAST"
                ? copy.placeholder.broadcast
                : copy.placeholder.direct(selectedPeer?.fullName || "")
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--ice-chat-input-border, rgba(255, 255, 255, 0.15))",
              background: "var(--ice-chat-input-bg, #ffffff)",
              color: "var(--ice-chat-input-text, var(--ice-text))",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isPending}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: 10,
              border: "none",
              background: inputText.trim()
                ? "linear-gradient(135deg, #d4af37, #b48c1e)"
                : "rgba(255, 255, 255, 0.08)",
              color: inputText.trim() ? "#000" : "var(--ice-text)",
              cursor: inputText.trim() ? "pointer" : "not-allowed",
              boxShadow: inputText.trim()
                ? "0 2px 8px rgba(212, 175, 55, 0.3)"
                : "none",
            }}
          >
            <Send size={16} />
          </button>
        </div>
        </>
      )}
      </div>

      {/* ============================================================ */}
      {/* MODAL DIFFUSION GLOBALE DU DG & ADMIN                         */}
      {/* ============================================================ */}
      {showBroadcastModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--ice-card-bg, #161a20)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              borderRadius: 16,
              width: "100%",
              maxWidth: 580,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
                background: "rgba(212, 175, 55, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    padding: 6,
                    borderRadius: 8,
                    background: "rgba(212, 175, 55, 0.2)",
                    color: "var(--gold, #d4af37)",
                    display: "flex",
                  }}
                >
                  <Radio size={18} />
                </span>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--ice-text)" }}>
                  {copy.broadcast.modalTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  opacity: 0.6,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleBroadcastSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 650, marginBottom: 8, color: "var(--ice-text)" }}>
                  {copy.broadcast.recipientsLabel}
                </label>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.85rem" }}>
                    <input
                      type="radio"
                      name="broadcast_type"
                      checked={broadcastTarget === "ALL"}
                      onChange={() => {
                        setBroadcastTarget("ALL");
                        setSelectedBroadcastUsers([]);
                      }}
                      style={{ accentColor: "#d4af37" }}
                    />
                    <span>{copy.broadcast.optionAll}</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.85rem" }}>
                    <input
                      type="radio"
                      name="broadcast_type"
                      checked={broadcastTarget === "CUSTOM"}
                      onChange={() => setBroadcastTarget("CUSTOM")}
                      style={{ accentColor: "#d4af37" }}
                    />
                    <span>{copy.broadcast.optionCustom}</span>
                  </label>
                </div>

                {/* Quick group preset buttons */}
                {broadcastTarget === "CUSTOM" && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        const workshopUserIds = colleagues
                          .filter((c) => ["CHEF_ATELIER", "ATELIER", "RTA"].includes(c.role))
                          .map((c) => c.id);
                        setSelectedBroadcastUsers(workshopUserIds);
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "var(--ice-text)",
                        fontSize: "0.74rem",
                        cursor: "pointer",
                      }}
                    >
                      {copy.broadcast.groups.workshop}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const salesUserIds = colleagues
                          .filter((c) => ["COMMERCIAL", "ADV", "DC", "HOTESSE"].includes(c.role))
                          .map((c) => c.id);
                        setSelectedBroadcastUsers(salesUserIds);
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "var(--ice-text)",
                        fontSize: "0.74rem",
                        cursor: "pointer",
                      }}
                    >
                      {copy.broadcast.groups.sales}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const comptaIds = colleagues
                          .filter((c) => ["COMPTA", "ASSISTANTE_COMPTABLE", "RF"].includes(c.role))
                          .map((c) => c.id);
                        setSelectedBroadcastUsers(comptaIds);
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "var(--ice-text)",
                        fontSize: "0.74rem",
                        cursor: "pointer",
                      }}
                    >
                      {copy.broadcast.groups.finance}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const dirIds = colleagues
                          .filter((c) => ["PDG", "SG", "DG", "ADMIN"].includes(c.role))
                          .map((c) => c.id);
                        setSelectedBroadcastUsers(dirIds);
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(212, 175, 55, 0.4)",
                        background: "rgba(212, 175, 55, 0.1)",
                        color: "var(--gold, #d4af37)",
                        fontSize: "0.74rem",
                        cursor: "pointer",
                      }}
                    >
                      {copy.broadcast.groups.direction}
                    </button>
                  </div>
                )}
              </div>

              {/* Custom selection list if CUSTOM */}
              {broadcastTarget === "CUSTOM" && (
                <div
                  style={{
                    maxHeight: 180,
                    overflowY: "auto",
                    border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.12))",
                    borderRadius: 8,
                    padding: "8px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    background: "rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                      {copy.broadcast.selectedCount(selectedBroadcastUsers.length)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedBroadcastUsers(
                          selectedBroadcastUsers.length === colleagues.length
                            ? []
                            : colleagues.map((c) => c.id)
                        )
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--gold, #d4af37)",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                      }}
                    >
                      {selectedBroadcastUsers.length === colleagues.length
                        ? copy.broadcast.deselectAll
                        : copy.broadcast.selectAll}
                    </button>
                  </div>

                  {colleagues.map((c) => {
                    const isChecked = selectedBroadcastUsers.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedBroadcastUsers(selectedBroadcastUsers.filter((id) => id !== c.id));
                            } else {
                              setSelectedBroadcastUsers([...selectedBroadcastUsers, c.id]);
                            }
                          }}
                          style={{ accentColor: "#d4af37" }}
                        />
                        <span>{c.fullName}</span>
                        <span style={{ fontSize: "0.72rem", opacity: 0.5 }}>({c.role})</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Message text */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 650, marginBottom: 6, color: "var(--ice-text)" }}>
                  {copy.broadcast.messageLabel}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={copy.broadcast.messagePlaceholder}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                    background: "rgba(0, 0, 0, 0.2)",
                    color: "var(--ice-text)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 6,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                    background: "transparent",
                    color: "var(--ice-text)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  {comms.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending || !broadcastText.trim()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(135deg, #d4af37, #b48c1e)",
                    color: "#000",
                    fontWeight: 750,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(212, 175, 55, 0.3)",
                  }}
                >
                  <Send size={15} />
                  {isPending ? copy.broadcast.sending : copy.broadcast.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offline Call Warning Modal */}
      {offlineCallPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              maxWidth: 440,
              width: "100%",
              background: "#181d24",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: 16,
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#f87171",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PhoneOff size={22} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--ice-text)" }}>
                  {copy.offlineModal.title}
                </h4>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#f87171",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
                  {copy.offlineModal.status}
                </span>
              </div>
            </div>

            <p style={{ margin: "0 0 20px 0", fontSize: "0.86rem", opacity: 0.85, lineHeight: 1.5 }}>
              <strong>{offlineCallPrompt.fullName}</strong> {copy.offlineModal.body}
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setOfflineCallPrompt(null)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "transparent",
                  color: "var(--ice-text)",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                {comms.common.cancel}
              </button>

              <button
                type="button"
                onClick={() => {
                  const peer = offlineCallPrompt;
                  setOfflineCallPrompt(null);
                  proceedWithCall(peer);
                }}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  color: "#fff",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {copy.offlineModal.callAnyway}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
