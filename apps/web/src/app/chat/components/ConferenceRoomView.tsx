"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  UserPlus,
  Radio,
  Clock,
  Shield,
  X,
} from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { usePrefs } from "@/components/PrefsProvider";
import { commsCopy } from "@/lib/i18n/messages/comms";
import { PREDEFINED_ROOMS } from "@/lib/conference-rooms";
import type { ChatUser } from "../ChatView";

export type RoomParticipant = {
  id: string;
  fullName: string;
  role: string;
  isMuted: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  joinedAt: string;
};

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  if (h > 0) {
    return `${h < 10 ? "0" : ""}${h}:${remM < 10 ? "0" : ""}${remM}:${s < 10 ? "0" : ""}${s}`;
  }
  return `${remM < 10 ? "0" : ""}${remM}:${s < 10 ? "0" : ""}${s}`;
}

export function ConferenceRoomView({
  roomId,
  currentUser,
  colleagues,
  onLeave,
  onSwitchRoom,
}: {
  roomId: string;
  currentUser: { id: string; fullName: string; role: string };
  colleagues: ChatUser[];
  onLeave: () => void;
  onSwitchRoom: (newRoomId: string) => void;
}) {
  const [isJoined, setIsJoined] = useState(false);
  const { locale } = usePrefs();
  const comms = commsCopy[locale];
  const copy = comms.conference;
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);

  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const isPrivileged =
    currentUser.role === "DEVELOPER" ||
    currentUser.role === "PDG" ||
    currentUser.role === "SG" ||
    currentUser.role === "DG" ||
    currentUser.role === "ADMIN";

  const roomInfo = PREDEFINED_ROOMS.find((r) => r.id === roomId) || {
    id: roomId,
    name: copy.fallbackName,
    category: "CUSTOM",
    icon: "🎙️",
    description: copy.fallbackDescription,
  };

  const roomCopy = copy.rooms[roomInfo.id];
  const roomName = roomCopy?.name ?? roomInfo.name;
  const roomDescription = roomCopy?.description ?? roomInfo.description;

  // Timer
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isJoined) {
      t = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isJoined]);

  // Audio capture & Level meter
  const startAudioCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      localStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch {
      // Audio capture fallback
    }
  }, []);

  const stopAudioCapture = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Rejoindre la conférence
  const handleJoin = async () => {
    try {
      await startAudioCapture();
      const res = await fetch("/api/calls/conference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", roomId, isMuted: false }),
      });
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants || []);
        setIsJoined(true);
      }
    } catch {
      alert(copy.errors.joinFailed);
    }
  };

  // Quitter la conférence
  const handleLeave = async () => {
    stopAudioCapture();
    try {
      await fetch("/api/calls/conference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave", roomId }),
      });
    } catch {
      // Ignorer
    }
    setIsJoined(false);
    setTimerSeconds(0);
    onLeave();
  };

  // Clôturer la conférence (DG / Admin)
  const handleCloseForEveryone = async () => {
    if (!confirm(copy.closeConfirm)) {
      return;
    }
    stopAudioCapture();
    try {
      await fetch("/api/calls/conference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close", roomId }),
      });
    } catch {
      // Ignorer
    }
    setIsJoined(false);
    setTimerSeconds(0);
    onLeave();
  };

  // Mute / Unmute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const nextMuted = !isMuted;
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
      setIsMuted(nextMuted);
    }
  };

  // Ping heartbeat
  useEffect(() => {
    const poll = async () => {
      try {
        if (isJoined) {
          const res = await fetch("/api/calls/conference", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "ping",
              roomId,
              isMuted,
              isSpeaking: audioLevel > 18 && !isMuted,
              audioLevel,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setParticipants(data.participants || []);
          }
        } else {
          // Mode lobby : vérifier qui est dans la salle
          const res = await fetch(`/api/calls/conference?roomId=${roomId}`);
          if (res.ok) {
            const data = await res.json();
            setParticipants(data.participants || []);
          }
        }
      } catch {
        // Ignorer
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [isJoined, isMuted, audioLevel, roomId]);

  // Inviter un collègue
  const handleInvite = async (user: ChatUser) => {
    try {
      await fetch("/api/calls/conference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invite", roomId, inviteUserId: user.id }),
      });
      setInvitedUsers((prev) => [...prev, user.id]);
    } catch {
      // Ignorer
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", background: "var(--surface-sunken)" }}>
      {/* Top Header */}
      <div
        style={{
          padding: "16px 22px",
          borderBottom: "1px solid var(--ice-border)",
          background: "linear-gradient(180deg, var(--surface-soft), transparent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--gold-soft)",
              color: "var(--gold-fg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              border: "1px solid var(--gold)",
            }}
          >
            {roomInfo.icon}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--ice-text)" }}>
                {roomName}
              </h3>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: isJoined ? "var(--success-soft)" : "var(--gold-soft)",
                  color: isJoined ? "var(--success-fg)" : "var(--gold-fg)",
                  border: isJoined ? "1px solid var(--success)" : "1px solid var(--gold)",
                }}
              >
                {isJoined ? copy.live : copy.open}
              </span>
            </div>
            <p style={{ margin: "3px 0 0 0", fontSize: "0.78rem", opacity: 0.65 }}>
              {roomDescription}
            </p>
          </div>
        </div>

        {/* Timer & Salons rapides */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isJoined && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                background: "var(--surface-sunken)",
                border: "1px solid var(--gold)",
                color: "var(--gold-fg)",
                fontSize: "0.88rem",
                fontWeight: 750,
                letterSpacing: "0.04em",
              }}
            >
              <Clock size={15} />
              <span>{formatTimer(timerSeconds)}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 5 }}>
            {PREDEFINED_ROOMS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSwitchRoom(r.id)}
                title={copy.rooms[r.id]?.name ?? r.name}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: r.id === roomId ? "1px solid var(--gold)" : "1px solid var(--border)",
                  background: r.id === roomId ? "var(--gold-soft)" : "var(--surface-soft)",
                  color: r.id === roomId ? "var(--gold-fg)" : "var(--ice-text)",
                  fontSize: "0.76rem",
                  cursor: "pointer",
                  fontWeight: r.id === roomId ? 700 : 400,
                }}
              >
                <span>{r.icon}</span> <span className="ox-hide-mobile">{copy.categories[r.category] ?? r.category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column" }}>
        {!isJoined ? (
          /* Lobby card */
          <div
            style={{
              margin: "auto",
              maxWidth: 500,
              width: "100%",
              padding: "32px 28px",
              borderRadius: 16,
              background: "var(--surface)",
              border: "1px solid var(--gold)",
              boxShadow: "0 15px 40px rgba(0, 0, 0, 0.5)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 10 }}>{roomInfo.icon}</div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.3rem", fontWeight: 700, color: "var(--ice-text)" }}>
              {roomName}
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "0.86rem", opacity: 0.75, lineHeight: 1.5 }}>
              {copy.lobbyText}
            </p>

            {/* Participants déjà en ligne */}
            <div
              style={{
                background: "var(--surface-soft)",
                borderRadius: 10,
                padding: "12px",
                marginBottom: 24,
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", opacity: 0.7, marginBottom: 8 }}>
                {copy.participantsInRoom(participants.length)}
              </div>
              {participants.length === 0 ? (
                <div style={{ fontSize: "0.8rem", opacity: 0.5, fontStyle: "italic" }}>
                  {copy.emptyRoom}
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                  {participants.map((p) => (
                    <span
                      key={p.id}
                      style={{
                        padding: "4px 9px",
                        borderRadius: 6,
                        background: "var(--success-soft)",
                        border: "1px solid var(--success)",
                        color: "var(--success-fg)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {p.fullName}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleJoin}
              style={{
                width: "100%",
                padding: "13px 24px",
                borderRadius: 10,
                border: "none",
                background: "var(--success-solid)",
                color: "var(--text-strong)",
                fontSize: "0.95rem",
                fontWeight: 750,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 15px rgba(34, 197, 94, 0.35)",
              }}
            >
              <Radio size={18} />
              <span>{copy.join}</span>
            </button>
          </div>
        ) : (
          /* Live Conference Room */
          <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 20 }}>
            {/* Grid of participants */}
            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                alignContent: "flex-start",
              }}
            >
              {/* Carte utilisateur local */}
              <div
                style={{
                  background: "var(--gold-soft)",
                  border:
                    audioLevel > 18 && !isMuted
                      ? "2px solid var(--success)"
                      : "1px solid var(--gold)",
                  borderRadius: 14,
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  boxShadow:
                    audioLevel > 18 && !isMuted
                      ? "0 0 20px rgba(34, 197, 94, 0.3)"
                      : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--gold-soft)",
                    border: "2px solid var(--gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "var(--gold-fg)",
                    marginBottom: 10,
                  }}
                >
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>

                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--ice-text)" }}>
                  {copy.me(currentUser.fullName)}
                </div>
                <div style={{ fontSize: "0.72rem", opacity: 0.7, marginTop: 2 }}>
                  {ROLE_LABELS[currentUser.role as Role] || currentUser.role}
                </div>

                <div style={{ marginTop: 12 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "4px 9px",
                      borderRadius: 12,
                      background: isMuted ? "var(--danger-soft)" : "var(--success-soft)",
                      color: isMuted ? "var(--danger-fg)" : "var(--success-fg)",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                    }}
                  >
                    {isMuted ? <MicOff size={12} /> : <Mic size={12} />}
                    {isMuted ? copy.micOff : copy.micOn}
                  </span>
                </div>
              </div>

              {/* Autres participants */}
              {participants
                .filter((p) => p.id !== currentUser.id)
                .map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: "var(--surface-soft)",
                      border: p.isSpeaking ? "2px solid var(--success)" : "1px solid var(--ice-border)",
                      borderRadius: 14,
                      padding: "18px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: p.isSpeaking ? "0 0 20px rgba(34, 197, 94, 0.3)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "var(--surface-soft)",
                        border: "2px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.4rem",
                        fontWeight: 800,
                        color: "var(--ice-text)",
                        marginBottom: 10,
                      }}
                    >
                      {p.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--ice-text)" }}>
                      {p.fullName}
                    </div>
                    <div style={{ fontSize: "0.72rem", opacity: 0.7, marginTop: 2 }}>
                      {ROLE_LABELS[p.role as Role] || p.role}
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "4px 9px",
                          borderRadius: 12,
                          background: p.isMuted ? "var(--danger-soft)" : "var(--success-soft)",
                          color: p.isMuted ? "var(--danger-fg)" : "var(--success-fg)",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                        }}
                      >
                        {p.isMuted ? <MicOff size={12} /> : <Mic size={12} />}
                        {p.isMuted ? copy.micOff : copy.listening}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Bottom Controls Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "14px 20px",
                borderRadius: 14,
                background: "var(--surface)",
                border: "1px solid var(--gold)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                flexWrap: "wrap",
              }}
            >
              {/* Mute toggle button */}
              <button
                type="button"
                onClick={toggleMute}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: isMuted ? "1px solid var(--danger)" : "1px solid var(--success)",
                  background: isMuted ? "var(--danger-soft)" : "var(--success-soft)",
                  color: isMuted ? "var(--danger-fg)" : "var(--success-fg)",
                  fontSize: "0.85rem",
                  fontWeight: 750,
                  cursor: "pointer",
                }}
              >
                {isMuted ? <MicOff size={17} /> : <Mic size={17} />}
                <span>{isMuted ? copy.unmute : copy.mute}</span>
              </button>

              {/* Inviter un collaborateur */}
              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "1px solid var(--gold)",
                  background: "var(--gold-soft)",
                  color: "var(--gold-fg)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <UserPlus size={16} />
                <span>{copy.invite}</span>
              </button>

              {/* Quitter */}
              <button
                type="button"
                onClick={handleLeave}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: "var(--danger-soft)",
                  color: "var(--text-on-accent)",
                  fontSize: "0.85rem",
                  fontWeight: 750,
                  cursor: "pointer",
                }}
              >
                <PhoneOff size={16} />
                <span>{copy.leave}</span>
              </button>

              {/* Clôturer pour tous (Direction / Admin) */}
              {isPrivileged && (
                <button
                  type="button"
                  onClick={handleCloseForEveryone}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "1px solid var(--danger)",
                    background: "var(--danger-soft)",
                    color: "var(--danger-fg)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  title={copy.closeForAllTitle}
                >
                  <Shield size={14} />
                  <span>{copy.closeForAll}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal d'invitation rapide */}
      {inviteModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--surface-sunken)",
            backdropFilter: "blur(6px)",
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "var(--surface)",
              border: "1px solid var(--gold)",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--ice-text)" }}>
                {copy.inviteTitle}
              </h4>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--ice-text)", opacity: 0.6, cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: "0 0 14px 0", fontSize: "0.78rem", opacity: 0.75 }}>
              {copy.inviteText(roomName)}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
              {colleagues
                .filter((c) => c.id !== currentUser.id)
                .map((colleague) => {
                  const isInvited = invitedUsers.includes(colleague.id);
                  return (
                    <div
                      key={colleague.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: "var(--surface-soft)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 650, color: "var(--ice-text)" }}>
                          {colleague.fullName}
                        </div>
                        <div style={{ fontSize: "0.7rem", opacity: 0.65 }}>
                          {ROLE_LABELS[colleague.role as Role] || colleague.role}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleInvite(colleague)}
                        disabled={isInvited}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 6,
                          border: "none",
                          background: isInvited ? "var(--success-soft)" : "var(--gold-soft)",
                          color: isInvited ? "var(--success-fg)" : "var(--gold-fg)",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          cursor: isInvited ? "default" : "pointer",
                        }}
                      >
                        {isInvited ? copy.invited : copy.inviteOne}
                      </button>
                    </div>
                  );
                })}
            </div>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--ice-text)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                {comms.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
