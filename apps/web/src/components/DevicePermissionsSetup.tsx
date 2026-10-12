"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  Bell,
  Volume2,
  CheckCircle,
  Lock,
  RefreshCw,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

declare global {
  interface Window {
    openDeviceSetup?: () => void;
  }
}

// Gentle Web Audio confirmation chime to unlock browser autoplay
function playUnlockChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Arpeggio notes: C5 (523.25), E5 (659.25), G5 (783.99)
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(783.99, now + 0.2);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 700);
  } catch {
    // Ignore audio errors
  }
}

export function DevicePermissionsSetup() {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastSuccess, setToastSuccess] = useState(false);
  const [micState, setMicState] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");
  const [notifState, setNotifState] = useState<"granted" | "denied" | "default" | "unsupported">("default");
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successAll, setSuccessAll] = useState(false);
  const [testAudioLevel, setTestAudioLevel] = useState(0);
  const [isTestingMic, setIsTestingMic] = useState(false);

  const testStreamRef = useRef<MediaStream | null>(null);
  const testAudioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Stop mic test
  const stopMicTest = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach((t) => t.stop());
      testStreamRef.current = null;
    }
    if (testAudioCtxRef.current && testAudioCtxRef.current.state !== "closed") {
      testAudioCtxRef.current.close().catch(() => {});
      testAudioCtxRef.current = null;
    }
    setIsTestingMic(false);
    setTestAudioLevel(0);
  }, []);

  // Check current permission statuses
  const checkStatuses = useCallback(async () => {
    // 1. Notifications
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifState(Notification.permission);
    } else {
      setNotifState("unsupported");
    }

    // 2. Microphone
    if (typeof navigator !== "undefined" && navigator.permissions?.query) {
      try {
        const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
        setMicState(status.state);
        status.onchange = () => {
          setMicState(status.state);
        };
      } catch {
        // Fallback: check if previously granted in localStorage
        const stored = localStorage.getItem("carzone_mic_granted");
        if (stored === "1") setMicState("granted");
      }
    } else {
      const stored = localStorage.getItem("carzone_mic_granted");
      if (stored === "1") setMicState("granted");
    }
  }, []);

  // Expose global trigger
  useEffect(() => {
    window.openDeviceSetup = () => {
      checkStatuses();
      setIsOpen(true);
    };
    return () => {
      delete window.openDeviceSetup;
    };
  }, [checkStatuses]);

  // Initial check on mount
  useEffect(() => {
    checkStatuses();

    // Auto-prompt notification toast discret sur première visite si non configuré
    const dismissed = localStorage.getItem("carzone_device_setup_dismissed");
    const completed = localStorage.getItem("carzone_device_setup_completed");

    if (!dismissed && !completed) {
      const timer = setTimeout(() => {
        const currentNotif = typeof Notification !== "undefined" ? Notification.permission : "granted";
        if (currentNotif !== "granted" || micState !== "granted") {
          setShowToast(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [checkStatuses, micState]);

  // Handle single notification request
  const requestNotification = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("Ce navigateur ne prend pas en charge les notifications du bureau.");
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setNotifState(perm);

      if (perm === "granted") {
        playUnlockChime();
        setAudioUnlocked(true);
        // User explicitly wanted: 'Notifications activées : oui'
        try {
          new Notification("Notifications activées : OUI ✅", {
            body: "Votre navigateur est désormais prêt à recevoir les alertes d'appels entrants, messages et notifications d'équipe.",
            icon: "/favicon.ico",
          });
        } catch {
          // Ignore
        }
      }
    } catch (e) {
      console.warn("Notification request failed:", e);
    }
  };

  // Handle single microphone request & quick live test
  const requestMicrophone = async () => {
    stopMicTest();
    setIsTestingMic(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      testStreamRef.current = stream;
      setMicState("granted");
      localStorage.setItem("carzone_mic_granted", "1");

      // Connect analyser for visual feedback
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const actx = new AudioCtx();
        testAudioCtxRef.current = actx;
        const source = actx.createMediaStreamSource(stream);
        const analyser = actx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkLevel = () => {
          if (!testAudioCtxRef.current || testAudioCtxRef.current.state === "closed") return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setTestAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(checkLevel);
        };
        checkLevel();
      }

      // Auto stop test after 2.5s and keep granted
      setTimeout(() => {
        stopMicTest();
      }, 2500);
    } catch (err: unknown) {
      stopMicTest();
      const error = err as { name?: string };
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setMicState("denied");
      } else {
        alert("Microphone non détecté ou indisponible.");
      }
    }
  };

  // Request all permissions at once (1-Click Setup)
  const requestAllPermissions = async () => {
    setIsProcessing(true);

    // 1. Play audio chime to unlock browser autoplay
    playUnlockChime();
    setAudioUnlocked(true);

    // 2. Request Notifications
    let notifResult = notifState;
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        notifResult = await Notification.requestPermission();
        setNotifState(notifResult);
        if (notifResult === "granted") {
          try {
            new Notification("Notifications activées : OUI ✅", {
              body: "Votre navigateur est configuré. Vous recevrez les alertes d'appels et messages d'équipe en direct.",
              icon: "/favicon.ico",
            });
          } catch {
            // Ignore
          }
        }
      } catch {
        // Ignore
      }
    }

    // 3. Request Microphone
    let micResult = micState;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micResult = "granted";
      setMicState("granted");
      localStorage.setItem("carzone_mic_granted", "1");

      // Brief 1-second sound test
      testStreamRef.current = stream;
      setIsTestingMic(true);
      setTimeout(() => {
        stopMicTest();
      }, 1500);
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        micResult = "denied";
        setMicState("denied");
      }
    }

    setIsProcessing(false);

    if (micResult === "granted") {
      setSuccessAll(true);
      localStorage.setItem("carzone_device_setup_completed", "1");
      localStorage.setItem("carzone_device_setup_dismissed", "1");
      setTimeout(() => {
        setIsOpen(false);
        setSuccessAll(false);
      }, 2000);
    } else {
      localStorage.setItem("carzone_device_setup_dismissed", "1");
    }
  };

  const handleDismiss = () => {
    stopMicTest();
    setIsOpen(false);
    setShowToast(false);
    localStorage.setItem("carzone_device_setup_dismissed", "1");
  };

  const handleDismissToast = () => {
    setShowToast(false);
    localStorage.setItem("carzone_device_setup_dismissed", "1");
  };

  const handleQuickActivate = async () => {
    setIsProcessing(true);
    playUnlockChime();
    setAudioUnlocked(true);

    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotifState(perm);
      } catch {}
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicState("granted");
      localStorage.setItem("carzone_mic_granted", "1");
      stream.getTracks().forEach((t) => t.stop());
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setMicState("denied");
      }
    }

    localStorage.setItem("carzone_device_setup_completed", "1");
    localStorage.setItem("carzone_device_setup_dismissed", "1");
    setIsProcessing(false);
    setToastSuccess(true);
    setTimeout(() => {
      setShowToast(false);
      setToastSuccess(false);
    }, 2000);
  };

  // Le microphone est le seul prérequis matériel essentiel aux appels
  const isMicDenied = micState === "denied";
  const isMicReady = micState === "granted";
  const isAllReady = isMicReady;

  return (
    <>
      {/* Toast Notification discret ("se réduise en notification simplement") */}
      {showToast && !isOpen && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            width: 360,
            maxWidth: "calc(100vw - 32px)",
            background: "linear-gradient(145deg, #0d1b28 0%, #071018 100%)",
            border: "1px solid rgba(160, 210, 230, 0.25)",
            borderRadius: 14,
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.65), 0 0 20px rgba(0, 120, 212, 0.2)",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            animation: "slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {toastSuccess ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#4ade80", padding: "6px 0" }}>
              <CheckCircle size={20} />
              <span style={{ fontSize: "0.85rem", fontWeight: 650 }}>
                Microphone et audio configurés avec succès !
              </span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: "rgba(0, 120, 212, 0.15)",
                      color: "#38bdf8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Mic size={17} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 650, fontSize: "0.86rem", color: "#ffffff" }}>
                      Appels vocaux & Alertes sonores
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "rgba(255, 255, 255, 0.68)", marginTop: 2 }}>
                      Activez le micro en 1 clic pour échanger avec l&apos;équipe.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDismissToast}
                  title="Fermer"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.5)",
                    cursor: "pointer",
                    padding: 3,
                    borderRadius: 4,
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 2 }}>
                <button
                  type="button"
                  onClick={handleDismissToast}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    background: "transparent",
                    color: "rgba(255, 255, 255, 0.75)",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Plus tard
                </button>
                <button
                  type="button"
                  onClick={handleQuickActivate}
                  disabled={isProcessing}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(135deg, #0078d4, #005a9e)",
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 650,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 2px 8px rgba(0, 120, 212, 0.35)",
                  }}
                >
                  <Zap size={14} />
                  {isProcessing ? "Activation..." : "Activer en 1 clic"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* ONBOARDING MODAL                                             */}
      {/* ============================================================ */}
      {isOpen && (
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
            background: "rgba(8, 10, 14, 0.82)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 540,
              background: "linear-gradient(180deg, #181d24 0%, #101317 100%)",
              border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
              borderRadius: 18,
              boxShadow: "0 25px 70px rgba(0, 0, 0, 0.75), 0 0 40px rgba(212, 175, 55, 0.1)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(255, 255, 255, 0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: "rgba(212, 175, 55, 0.15)",
                    color: "var(--gold, #d4af37)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--ice-text)" }}>
                    Configuration & Activation du Matériel
                  </h3>
                  <div style={{ fontSize: "0.75rem", opacity: 0.65 }}>
                    Pour les appels vocaux, alertes en direct et notifications
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--ice-text-muted)",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: 6,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>
              {/* Success Banner */}
              {successAll && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    marginBottom: 16,
                    color: "#4ade80",
                  }}
                >
                  <CheckCircle size={24} />
                  <div>
                    <div style={{ fontWeight: 750, fontSize: "0.92rem" }}>
                      Configuration Réussie avec Succès !
                    </div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                      Notifications activées : <strong>OUI ✅</strong> · Microphone opérationnel : <strong>OUI ✅</strong>
                    </div>
                  </div>
                </div>
              )}

              <p style={{ margin: "0 0 16px 0", fontSize: "0.84rem", opacity: 0.8, lineHeight: 1.5 }}>
                Afin de garantir le bon fonctionnement des modules de communication interne (appels audio entre collaborateurs, alertes en temps réel et avertissements de sécurité), activez les autorisations suivantes :
              </p>

              {/* Checklist items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {/* 1. Microphone */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${
                      micState === "granted"
                        ? "rgba(34, 197, 94, 0.3)"
                        : micState === "denied"
                        ? "rgba(239, 68, 68, 0.3)"
                        : "rgba(255, 255, 255, 0.1)"
                    }`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background:
                          micState === "granted"
                            ? "rgba(34, 197, 94, 0.15)"
                            : micState === "denied"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(212, 175, 55, 0.15)",
                        color:
                          micState === "granted"
                            ? "#4ade80"
                            : micState === "denied"
                            ? "#f87171"
                            : "var(--gold, #d4af37)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Mic size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 650, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 8 }}>
                        Microphone Audio
                        {micState === "granted" ? (
                          <span style={{ fontSize: "0.72rem", color: "#4ade80", background: "rgba(34, 197, 94, 0.15)", padding: "2px 8px", borderRadius: 999 }}>
                            Activé : OUI ✅
                          </span>
                        ) : micState === "denied" ? (
                          <span style={{ fontSize: "0.72rem", color: "#f87171", background: "rgba(239, 68, 68, 0.15)", padding: "2px 8px", borderRadius: 999 }}>
                            Bloqué 🔒
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.72rem", color: "#eab308", background: "rgba(234, 179, 8, 0.15)", padding: "2px 8px", borderRadius: 999 }}>
                            En attente ⏳
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.76rem", opacity: 0.65 }}>
                        Requis pour téléphoner avec vos collègues en direct
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={requestMicrophone}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      background: micState === "granted" ? "rgba(34, 197, 94, 0.1)" : "rgba(255, 255, 255, 0.05)",
                      color: micState === "granted" ? "#4ade80" : "var(--ice-text)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {isTestingMic ? "Test en cours..." : micState === "granted" ? "Tester le son" : "Autoriser"}
                  </button>
                </div>

                {/* Vumètre sonore si test en cours */}
                {isTestingMic && (
                  <div
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", marginBottom: 4 }}>
                      <span style={{ color: "#4ade80" }}>🎙️ Parlez dans votre micro pour tester :</span>
                      <span style={{ fontWeight: 700, color: "#4ade80" }}>{testAudioLevel > 2 ? "Voix détectée !" : "Écoute..."}</span>
                    </div>
                    <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.max(6, testAudioLevel)}%`,
                          background: "#22c55e",
                          transition: "width 0.1s ease",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 2. Notifications */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${
                      notifState === "granted"
                        ? "rgba(34, 197, 94, 0.3)"
                        : notifState === "denied"
                        ? "rgba(239, 68, 68, 0.3)"
                        : "rgba(255, 255, 255, 0.1)"
                    }`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background:
                          notifState === "granted"
                            ? "rgba(34, 197, 94, 0.15)"
                            : notifState === "denied"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(212, 175, 55, 0.15)",
                        color:
                          notifState === "granted"
                            ? "#4ade80"
                            : notifState === "denied"
                            ? "#60a5fa"
                            : "var(--gold, #d4af37)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Bell size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 650, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 8 }}>
                        Notifications du Navigateur
                        {notifState === "granted" ? (
                          <span style={{ fontSize: "0.72rem", color: "#4ade80", background: "rgba(34, 197, 94, 0.15)", padding: "2px 8px", borderRadius: 999 }}>
                            Activé : OUI ✅
                          </span>
                        ) : notifState === "denied" ? (
                          <span style={{ fontSize: "0.72rem", color: "#60a5fa", background: "rgba(96, 165, 250, 0.15)", padding: "2px 8px", borderRadius: 999 }}>
                            Alertes In-App : Actives 🔔
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.72rem", color: "#eab308", background: "rgba(234, 179, 8, 0.15)", padding: "2px 8px", borderRadius: 999 }}>
                            En attente ⏳
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.76rem", opacity: 0.65 }}>
                        {notifState === "denied"
                          ? "Alertes et sonneries d'appels actives en continu dans l'application (protection vie privée Brave)."
                          : "Requis pour recevoir les alertes d'appels entrants et messages hors de l'onglet"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={requestNotification}
                    disabled={notifState === "granted"}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      background:
                        notifState === "granted"
                          ? "rgba(34, 197, 94, 0.1)"
                          : notifState === "denied"
                          ? "rgba(96, 165, 250, 0.1)"
                          : "rgba(255, 255, 255, 0.05)",
                      color:
                        notifState === "granted"
                          ? "#4ade80"
                          : notifState === "denied"
                          ? "#60a5fa"
                          : "var(--ice-text)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: notifState === "granted" ? "default" : "pointer",
                      opacity: notifState === "granted" ? 0.8 : 1,
                    }}
                  >
                    {notifState === "granted"
                      ? "Activé ✅"
                      : notifState === "denied"
                      ? "Actif In-App 🔔"
                      : "Activer"}
                  </button>
                </div>

                {/* 3. Audio & Sonneries */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "rgba(34, 197, 94, 0.15)",
                        color: "#4ade80",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Volume2 size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 650, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 8 }}>
                        Rendu Sonore & Sonneries
                        <span style={{ fontSize: "0.72rem", color: "#4ade80", background: "rgba(34, 197, 94, 0.15)", padding: "2px 8px", borderRadius: 999 }}>
                          {audioUnlocked ? "Son Débloqué 🔊" : "Prêt ✅"}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.76rem", opacity: 0.65 }}>
                        Débloque la sonnerie d&apos;appel automatique sans restriction du navigateur
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playUnlockChime();
                      setAudioUnlocked(true);
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "var(--ice-text)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Tester le son 🔔
                  </button>
                </div>
              </div>

              {/* Guide de déblocage uniquement si le microphone est bloqué */}
              {isMicDenied && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    marginBottom: 20,
                    fontSize: "0.82rem",
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#fca5a5", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Lock size={15} />
                    Accès bloqué dans le navigateur (Brave / Chrome) :
                  </div>
                  <div style={{ opacity: 0.85 }}>
                    1. Cliquez sur le <strong>Cadenas 🔒</strong> ou <strong>Paramètres du site</strong> tout à gauche de la barre d&apos;adresse.
                  </div>
                  <div style={{ opacity: 0.85, marginTop: 4 }}>
                    2. Passez <strong>Microphone</strong> et <strong>Notifications</strong> sur <strong>Autoriser</strong> (sur Brave, désactivez également le bouclier 🦁 si le micro ne répond pas).
                  </div>
                  <div style={{ opacity: 0.85, marginTop: 4 }}>
                    3. Cliquez sur le bouton <strong>« Actualiser la page »</strong> ci-dessous pour valider.
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: "none",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                      }}
                    >
                      <RefreshCw size={14} />
                      Actualiser la page maintenant
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={handleDismiss}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 10,
                    border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                    background: "transparent",
                    color: "var(--ice-text-muted)",
                    fontSize: "0.84rem",
                    cursor: "pointer",
                  }}
                >
                  {isAllReady ? "Fermer" : "Plus tard"}
                </button>

                {!isAllReady && (
                  <button
                    type="button"
                    onClick={requestAllPermissions}
                    disabled={isProcessing}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 22px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg, #d4af37, #b48c1e)",
                      color: "#000",
                      fontWeight: 750,
                      fontSize: "0.88rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(212, 175, 55, 0.25)",
                      opacity: isProcessing ? 0.7 : 1,
                    }}
                  >
                    <Sparkles size={16} />
                    {isProcessing ? "Activation en cours..." : "🚀 Tout Activer & Autoriser en 1 Clic"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
