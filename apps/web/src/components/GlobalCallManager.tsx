"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Phone,
  PhoneOff,
  PhoneIncoming,
  Mic,
  MicOff,
  Volume2,
  ShieldAlert,
  CheckCircle,
  X,
  RefreshCw,
  Lock,
  MessageSquare,
} from "lucide-react";

declare global {
  interface Window {
    startVoiceCall?: (userId: string, userName: string) => void;
    openMicModal?: (pendingTarget?: { id: string; name: string }) => void;
  }
}

// Gentle incoming message chime via Web Audio API synth
function playMessageChime(): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc2.frequency.setValueAtTime(880.0, now + 0.08); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.12);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);
  } catch {
    // Autoplay restrictions ignored
  }
}

// Simple Web Audio API ringtone generator (zero external asset dependency)
function playRingtone(): () => void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return () => {};
    const ctx = new AudioContextClass();

    let isPlaying = true;
    const playBurst = () => {
      if (!isPlaying || ctx.state === "closed") return;
      try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(440, ctx.currentTime); // 440 Hz
        osc2.frequency.setValueAtTime(480, ctx.currentTime); // 480 Hz

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 1.2);
        osc2.stop(ctx.currentTime + 1.2);
      } catch {
        // Ignorer
      }
    };

    playBurst();
    const interval = setInterval(() => {
      if (isPlaying) playBurst();
    }, 2800);

    return () => {
      isPlaying = false;
      clearInterval(interval);
      try {
        ctx.close();
      } catch {
        // Ignorer
      }
    };
  } catch {
    return () => {};
  }
}

type PendingAction = {
  type: "START_CALL" | "ACCEPT_CALL";
  peerId?: string;
  peerName?: string;
  callId?: string;
};

export function GlobalCallManager({ currentUserId }: { currentUserId: string }) {
  const [incomingCall, setIncomingCall] = useState<{
    id: string;
    callerId: string;
    callerName: string;
    callerRole?: string | null;
  } | null>(null);

  const [activeCall, setActiveCall] = useState<{
    id: string;
    peerName: string;
    isCaller: boolean;
    status: "CALLING" | "CONNECTED";
  } | null>(null);

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Microphone Permission & Live Volume State
  const [micModal, setMicModal] = useState<{
    isOpen: boolean;
    state: "PROMPT" | "DENIED" | "GRANTED" | "ERROR";
    errorMessage?: string;
    pendingAction?: PendingAction | null;
  } | null>(null);
  const [isRetryingMic, setIsRetryingMic] = useState(false);

  const [micAudioLevel, setMicAudioLevel] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const currentCallIdRef = useRef<string | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const ringtoneStopRef = useRef<(() => void) | null>(null);

  // Message Toast State
  const [messageToast, setMessageToast] = useState<{
    id: string;
    senderName: string;
    senderId: string;
    content: string;
    sticker?: string | null;
    isBroadcast: boolean;
  } | null>(null);
  const lastNotifiedMsgIdRef = useRef<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const testStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Stop test stream and cleanup audio meters
  const stopTestStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach((t) => t.stop());
      testStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicAudioLevel(0);
  }, []);

  // Stop ringtone helper
  const stopRing = useCallback(() => {
    if (ringtoneStopRef.current) {
      ringtoneStopRef.current();
      ringtoneStopRef.current = null;
    }
  }, []);

  // Cleanup helper
  const terminateCall = useCallback(async (callId?: string) => {
    stopRing();

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    const cid = callId || activeCall?.id || incomingCall?.id;
    if (cid) {
      try {
        await fetch("/api/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "end", callId: cid, durationSeconds: callDuration }),
        });
      } catch {
        // Ignorer
      }
    }

    setActiveCall(null);
    setIncomingCall(null);
    setCallDuration(0);
    setIsMuted(false);
  }, [activeCall, callDuration, incomingCall, stopRing]);

  // Timer for active call duration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeCall?.status === "CONNECTED") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCall?.status]);

  // Poll for incoming calls when idle
  useEffect(() => {
    if (activeCall || incomingCall) return;

    const checkIncoming = async () => {
      try {
        const res = await fetch("/api/calls?check_incoming=1");
        if (res.ok) {
          const data = await res.json();
          if (typeof data.missedCount === "number" && typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("carzone:missed_calls", {
                detail: { count: data.missedCount },
              })
            );
          }
          if (data.incomingCall) {
            setIncomingCall({
              id: data.incomingCall.id,
              callerId: data.incomingCall.callerId,
              callerName: data.incomingCall.callerName,
              callerRole: data.incomingCall.callerRole,
            });
            // Native desktop push notification
            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              try {
                const notif = new Notification(`📞 Appel Entrant : ${data.incomingCall.callerName}`, {
                  body: "Un collaborateur vous appelle sur CARZONE. Cliquez ici pour décrocher.",
                  icon: "/favicon.ico",
                  tag: "call-" + data.incomingCall.id,
                });
                notif.onclick = () => {
                  window.focus();
                };
              } catch {
                // Ignore
              }
            }
            // Play ringtone on receiver
            if (!ringtoneStopRef.current) {
              ringtoneStopRef.current = playRingtone();
            }
          }
        }
      } catch {
        // Ignorer
      }
    };

    const interval = setInterval(checkIncoming, 3000);
    return () => clearInterval(interval);
  }, [activeCall, incomingCall, stopRing]);

  // Poll for unread messages and alert user with sound chime & toast notification
  useEffect(() => {
    let isSubscribed = true;

    const checkMessages = async () => {
      try {
        const res = await fetch("/api/chat/unread");
        if (!res.ok) return;
        const data = await res.json();
        if (!isSubscribed) return;

        // Dispatch unread event for header badge & ChatView badges
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("carzone:unread_chat", {
              detail: {
                unreadCount: data.unreadCount || 0,
                bySender: data.bySender || {},
                broadcastUnread: data.broadcastUnread || 0,
              },
            })
          );
        }

        if (data.latestMessage && data.latestMessage.id) {
          if (lastNotifiedMsgIdRef.current === null) {
            // First run on page load: record ID without alerting past messages
            lastNotifiedMsgIdRef.current = data.latestMessage.id;
          } else if (lastNotifiedMsgIdRef.current !== data.latestMessage.id) {
            lastNotifiedMsgIdRef.current = data.latestMessage.id;

            // Don't toast if user is already chatting with this sender in /chat
            const isCurrentlyChatting =
              typeof window !== "undefined" &&
              window.location.pathname === "/chat" &&
              (window as unknown as { __carzoneActivePeerId?: string }).__carzoneActivePeerId === data.latestMessage.senderId;

            if (!isCurrentlyChatting) {
              playMessageChime();

              setMessageToast({
                id: data.latestMessage.id,
                senderName: data.latestMessage.senderName,
                senderId: data.latestMessage.senderId,
                content: data.latestMessage.content,
                sticker: data.latestMessage.sticker,
                isBroadcast: data.latestMessage.isBroadcast,
              });

              if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
              toastTimeoutRef.current = setTimeout(() => {
                setMessageToast(null);
              }, 6000);

              // Native desktop / mobile notification
              if (
                typeof window !== "undefined" &&
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                try {
                  const title = data.latestMessage.isBroadcast
                    ? `📢 Annonce Direction : ${data.latestMessage.senderName}`
                    : `💬 Nouveau message de ${data.latestMessage.senderName}`;
                  const n = new Notification(title, {
                    body: data.latestMessage.content || data.latestMessage.sticker || "Nouveau message",
                    icon: "/favicon.ico",
                    tag: "msg-" + data.latestMessage.id,
                  });
                  n.onclick = () => {
                    window.focus();
                    window.location.href = "/chat";
                  };
                } catch {}
              }
            }
          }
        }
      } catch {}
    };

    checkMessages();
    const interval = setInterval(checkMessages, 4000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Helper to wait for initial ICE gathering before posting offer/answer SDP
  const waitForIce = (pc: RTCPeerConnection, timeoutMs = 800) => {
    if (pc.iceGatheringState === "complete") return Promise.resolve();
    return new Promise<void>((resolve) => {
      let resolved = false;
      const check = () => {
        if (pc.iceGatheringState === "complete" && !resolved) {
          resolved = true;
          pc.removeEventListener("icegatheringstatechange", check);
          resolve();
        }
      };
      pc.addEventListener("icegatheringstatechange", check);
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          pc.removeEventListener("icegatheringstatechange", check);
          resolve();
        }
      }, timeoutMs);
    });
  };

  // Initialize WebRTC PeerConnection
  const initPeerConnection = useCallback((callId?: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (event) => {
      const activeCid = callId || currentCallIdRef.current;
      if (event.candidate && activeCid) {
        fetch("/api/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "candidate",
            callId: activeCid,
            candidate: event.candidate,
          }),
        }).catch(() => {});
      }
    };

    pc.ontrack = (event) => {
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch(() => {});
      }
    };

    pcRef.current = pc;
    return pc;
  }, []);

  // Execute outgoing call with an already active stream
  const executeStartCallWithStream = useCallback(
    async (receiverId: string, receiverName: string, stream: MediaStream) => {
      localStreamRef.current = stream;

      // 1. Initialiser WebRTC et créer l'offre
      const pc = initPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
      });
      await pc.setLocalDescription(offer);

      // Récupérer les candidats ICE initiaux directement dans le SDP de l'offre
      await waitForIce(pc, 800);

      // 2. Démarrer la session sur le serveur en UNE SEULE requête avec l'offre SDP complète
      const startRes = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          receiverId,
          sdp: JSON.stringify(pc.localDescription || offer),
        }),
      });
      const startData = await startRes.json();
      if (!startData.success || !startData.call) {
        throw new Error(startData.error || "Erreur démarrage de l'appel");
      }

      const callId = startData.call.id;
      currentCallIdRef.current = callId;

      setActiveCall({
        id: callId,
        peerName: receiverName,
        isCaller: true,
        status: "CALLING",
      });

      // Poll for answer and remote ICE candidates
      const appliedCandidates = new Set<string>();
      const pollInterval = setInterval(async () => {
        try {
          const checkRes = await fetch(`/api/calls?call_id=${callId}`);
          const checkData = await checkRes.json();
          if (!checkData.call) return;

          // Appliquer les candidats ICE distants
          if (Array.isArray(checkData.call.iceCandidates)) {
            for (const item of checkData.call.iceCandidates) {
              const candKey = JSON.stringify(item.candidate);
              if (item.senderId !== currentUserId && !appliedCandidates.has(candKey)) {
                appliedCandidates.add(candKey);
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(item.candidate));
                } catch {}
              }
            }
          }

          if (checkData.call.status === "ACCEPTED" && checkData.call.answerSdp) {
            clearInterval(pollInterval);
            if (pc.signalingState !== "stable") {
              await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(checkData.call.answerSdp)));
            }
            setActiveCall((prev) => (prev ? { ...prev, status: "CONNECTED" } : null));
          } else if (checkData.call.status === "REJECTED") {
            clearInterval(pollInterval);
            alert(`${receiverName} a refusé l'appel.`);
            terminateCall(callId);
          } else if (checkData.call.status === "ENDED") {
            clearInterval(pollInterval);
            terminateCall(callId);
          }
        } catch {
          // Ignorer
        }
      }, 1500);

      // Auto cancel after 45s if no answer
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 45000);
    },
    [currentUserId, initPeerConnection, terminateCall]
  );

  // Execute accept call with stream
  const executeAcceptCallWithStream = useCallback(
    async (callId: string, callerName: string, stream: MediaStream) => {
      localStreamRef.current = stream;
      currentCallIdRef.current = callId;
      stopRing();

      const callRes = await fetch(`/api/calls?call_id=${callId}`);
      const callData = await callRes.json();
      if (!callData.call || callData.call.status === "ENDED" || callData.call.status === "REJECTED") {
        setIncomingCall(null);
        alert("L'appel a déjà été terminé ou annulé par votre collègue.");
        terminateCall(callId);
        return;
      }

      const pc = initPeerConnection(callId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      if (callData.call.offerSdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(callData.call.offerSdp)));

        // Appliquer les candidats ICE déjà collectés par l'appelant
        const appliedCandidates = new Set<string>();
        if (Array.isArray(callData.call.iceCandidates)) {
          for (const item of callData.call.iceCandidates) {
            const candKey = JSON.stringify(item.candidate);
            if (item.senderId !== currentUserId && !appliedCandidates.has(candKey)) {
              appliedCandidates.add(candKey);
              try {
                await pc.addIceCandidate(new RTCIceCandidate(item.candidate));
              } catch {}
            }
          }
        }

        const answer = await pc.createAnswer({
          offerToReceiveAudio: true,
        });
        await pc.setLocalDescription(answer);

        // Attendre que les candidats de réponse soient intégrés au SDP
        await waitForIce(pc, 800);

        await fetch("/api/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "accept",
            callId,
            sdp: JSON.stringify(pc.localDescription || answer),
          }),
        });
      }

      setActiveCall({
        id: callId,
        peerName: callerName,
        isCaller: false,
        status: "CONNECTED",
      });
      setIncomingCall(null);
    },
    [currentUserId, initPeerConnection, stopRing, terminateCall]
  );

  // Attempt to acquire microphone permission with live volume test and multi-attempt fallbacks
  const tryAcquireMicrophone = useCallback(
    async (pendingAction?: PendingAction | null) => {
      setIsRetryingMic(true);

      try {
        let stream: MediaStream | null = null;
        let lastError: unknown = null;

        // Tentative 1 : Demande standard
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e1) {
          lastError = e1;
          // Tentative 2 : DSP allégé (contourne les conflits de sample rate et audio exclusif Windows)
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
              },
            });
          } catch (e2) {
            lastError = e2;
            // Tentative 3 : Sélection explicite du premier périphérique d'entrée audio
            try {
              const devices = await navigator.mediaDevices.enumerateDevices();
              const audioInput = devices.find((d) => d.kind === "audioinput" && d.deviceId);
              if (audioInput) {
                stream = await navigator.mediaDevices.getUserMedia({
                  audio: { deviceId: { exact: audioInput.deviceId } },
                });
              }
            } catch (e3) {
              lastError = e3;
            }
          }
        }

        if (!stream) {
          throw lastError || new Error("Flux audio inaccessible");
        }

        // If an action was pending (e.g. user clicked Call or Pick Up), run directly with the fresh stream!
        if (pendingAction) {
          setIsRetryingMic(false);
          // Clean up old audio meter without stopping the active stream's tracks
          if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
          }
          if (audioContextRef.current && audioContextRef.current.state !== "closed") {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
          }
          if (testStreamRef.current) {
            testStreamRef.current.getTracks().forEach((t) => t.stop());
            testStreamRef.current = null;
          }

          setMicModal(null);

          if (
            pendingAction.type === "START_CALL" &&
            pendingAction.peerId &&
            pendingAction.peerName
          ) {
            executeStartCallWithStream(
              pendingAction.peerId,
              pendingAction.peerName,
              stream
            );
          } else if (
            pendingAction.type === "ACCEPT_CALL" &&
            pendingAction.callId &&
            pendingAction.peerName
          ) {
            executeAcceptCallWithStream(
              pendingAction.callId,
              pendingAction.peerName,
              stream
            );
          }
          return;
        }

        // Otherwise (standalone mic test), connect Web Audio Analyser to show volume
        stopTestStream();
        testStreamRef.current = stream;

        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkLevel = () => {
            if (!audioContextRef.current || audioContextRef.current.state === "closed") return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setMicAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(checkLevel);
          };
          checkLevel();
        }

        setIsRetryingMic(false);
        setMicModal({
          isOpen: true,
          state: "GRANTED",
          pendingAction: null,
        });
      } catch (err: unknown) {
        setIsRetryingMic(false);
        stopTestStream();
        console.warn("Microphone access error:", err);

        const error = err as { name?: string; message?: string };
        let isDenied = false;
        let msg = "Impossible d'accéder au micro.";

        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          isDenied = true;
          msg = "L'accès au microphone a été refusé par le navigateur (Brave/Chrome) ou nécessite l'actualisation de la page.";
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          msg = "Aucun microphone physique n'a été détecté. Veuillez brancher un casque ou des écouteurs.";
        } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
          msg = "Le microphone est verrouillé par une autre application en cours d'exécution (ex: Wispr Flow, Teams, Zoom).";
        } else if (error.message) {
          msg = error.message;
        }

        setMicModal({
          isOpen: true,
          state: isDenied ? "DENIED" : "ERROR",
          errorMessage: msg,
          pendingAction,
        });
      }
    },
    [executeAcceptCallWithStream, executeStartCallWithStream, stopTestStream]
  );

  // Accept incoming call
  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    stopRing();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // Microphone blocked or prompt needed -> Open interactive modal
      tryAcquireMicrophone({
        type: "ACCEPT_CALL",
        callId: incomingCall.id,
        peerName: incomingCall.callerName,
      });
      return;
    }

    try {
      await executeAcceptCallWithStream(incomingCall.id, incomingCall.callerName, stream);
    } catch (err) {
      console.error("Accept call error:", err);
      alert("Impossible de décrocher l'appel. La session est peut-être expirée.");
    }
  };

  // Reject incoming call
  const handleRejectCall = async () => {
    if (!incomingCall) return;
    stopRing();
    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", callId: incomingCall.id }),
      });
    } catch {
      // Ignorer
    }
    setIncomingCall(null);
  };

  // Start outgoing call
  const startCall = useCallback(
    async (receiverId: string, receiverName: string) => {
      if (receiverId === currentUserId) {
        alert("Vous ne pouvez pas vous appeler vous-même.");
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        // Microphone access blocked or not granted -> Show in-app permission popup!
        tryAcquireMicrophone({
          type: "START_CALL",
          peerId: receiverId,
          peerName: receiverName,
        });
        return;
      }

      try {
        await executeStartCallWithStream(receiverId, receiverName, stream);
      } catch (err) {
        console.error("Call initialization error:", err);
        alert("Impossible de joindre le serveur d'appel. Veuillez vérifier votre connexion.");
      }
    },
    [currentUserId, executeStartCallWithStream, tryAcquireMicrophone]
  );

  // Auto-resume pending call or test if page was reloaded after granting mic permission
  useEffect(() => {
    try {
      const savedCall = sessionStorage.getItem("saas_pending_voice_call");
      if (savedCall) {
        sessionStorage.removeItem("saas_pending_voice_call");
        const data = JSON.parse(savedCall);
        if (data && data.peerId && data.peerName && Date.now() - data.timestamp < 120000) {
          const timer = setTimeout(() => {
            startCall(data.peerId, data.peerName);
          }, 600);
          return () => clearTimeout(timer);
        }
      }

      const savedTest = sessionStorage.getItem("saas_pending_mic_test");
      if (savedTest) {
        sessionStorage.removeItem("saas_pending_mic_test");
        const timer = setTimeout(() => {
          tryAcquireMicrophone(null);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore
    }
  }, [startCall, tryAcquireMicrophone]);

  // Listen for window focus and permission changes to auto-retry mic when user closes the padlock popup
  useEffect(() => {
    if (!micModal || (micModal.state !== "DENIED" && micModal.state !== "ERROR")) return;

    const handleFocus = () => {
      tryAcquireMicrophone(micModal.pendingAction);
    };

    window.addEventListener("focus", handleFocus);

    let permStatus: PermissionStatus | null = null;
    if (typeof navigator !== "undefined" && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          permStatus = status;
          status.onchange = () => {
            if (status.state === "granted") {
              tryAcquireMicrophone(micModal.pendingAction);
            }
          };
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("focus", handleFocus);
      if (permStatus) {
        permStatus.onchange = null;
      }
    };
  }, [micModal, tryAcquireMicrophone]);

  // Expose global window hooks for chat interface
  useEffect(() => {
    window.startVoiceCall = (userId: string, userName: string) => {
      startCall(userId, userName);
    };

    window.openMicModal = (pendingTarget?: { id: string; name: string }) => {
      if (pendingTarget) {
        tryAcquireMicrophone({
          type: "START_CALL",
          peerId: pendingTarget.id,
          peerName: pendingTarget.name,
        });
      } else {
        tryAcquireMicrophone(null);
      }
    };

    return () => {
      delete window.startVoiceCall;
      delete window.openMicModal;
    };
  }, [startCall, tryAcquireMicrophone]);

  // Toggle Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const formatSecs = (total: number) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Invisible HTML Audio Element for remote peer's voice */}
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: "none" }} />

      {/* ============================================================ */}
      {/* 1. MODALE D'APPEL ENTRANT (SONNERIE)                         */}
      {/* ============================================================ */}
      {incomingCall && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100vw - 32px)",
            maxWidth: 360,
            background: "linear-gradient(135deg, #181d24, #12151a)",
            border: "1px solid rgba(212, 175, 55, 0.4)",
            borderRadius: 16,
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 175, 55, 0.2)",
            zIndex: 100000,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "rgba(34, 197, 94, 0.15)",
              color: "#4ade80",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              border: "1px solid rgba(34, 197, 94, 0.4)",
              boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)",
            }}
          >
            <PhoneIncoming size={28} />
          </div>

          <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--gold, #d4af37)", fontWeight: 700 }}>
            Appel Audio Entrant
          </div>

          <div style={{ fontSize: "1.1rem", fontWeight: 700, margin: "4px 0 2px 0", color: "var(--ice-text)" }}>
            {incomingCall.callerName}
          </div>

          <div style={{ fontSize: "0.75rem", opacity: 0.65, marginBottom: 16 }}>
            {incomingCall.callerRole || "Collaborateur"} vous appelle en direct...
          </div>

          <div style={{ display: "flex", gap: 12, width: "100%" }}>
            <button
              onClick={handleRejectCall}
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px",
                borderRadius: 8,
                border: "1px solid rgba(239, 68, 68, 0.4)",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                fontWeight: 650,
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              <PhoneOff size={15} />
              Refuser
            </button>

            <button
              onClick={handleAcceptCall}
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)",
              }}
            >
              <Phone size={15} />
              Décrocher
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. BARRE FLOTTANTE D'APPEL ACTIF                             */}
      {/* ============================================================ */}
      {activeCall && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100vw - 32px)",
            maxWidth: 420,
            background: "rgba(22, 26, 32, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(212, 175, 55, 0.4)",
            borderRadius: 30,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6)",
            zIndex: 100000,
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: activeCall.status === "CONNECTED" ? "#4ade80" : "var(--gold, #d4af37)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: activeCall.status === "CONNECTED" ? "#22c55e" : "#eab308",
                boxShadow: "0 0 8px currentColor",
              }}
            />
            <Volume2 size={18} />
          </div>

          <div>
            <div style={{ fontWeight: 650, fontSize: "0.88rem", color: "var(--ice-text)" }}>
              {activeCall.peerName}
            </div>
            <div style={{ fontSize: "0.75rem", opacity: 0.65 }}>
              {activeCall.status === "CONNECTED"
                ? `En communication (${formatSecs(callDuration)})`
                : "Sonnerie en cours..."}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Mute button */}
            {activeCall.status === "CONNECTED" && (
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? "Activer le micro" : "Couper le micro"}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: isMuted ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.1)",
                  color: isMuted ? "#f87171" : "var(--ice-text)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}

            {/* Hangup button */}
            <button
              type="button"
              onClick={() => terminateCall(activeCall.id)}
              title="Raccrocher"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "none",
                background: "#ef4444",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(239, 68, 68, 0.4)",
              }}
            >
              <PhoneOff size={17} />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. POPUP MODALE D'AUTORISATION ET DE TEST DU MICROPHONE     */}
      {/* ============================================================ */}
      {micModal?.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#161a20",
              border: "1px solid rgba(212, 175, 55, 0.35)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 480,
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.15)",
              textAlign: "center",
            }}
          >
            {/* Header / Close */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px 0 20px",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--gold, #d4af37)",
                }}
              >
                Audio & Téléphonie d&apos;Entreprise
              </span>
              <button
                type="button"
                onClick={() => {
                  stopTestStream();
                  setMicModal(null);
                }}
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

            <div style={{ padding: "24px 28px 28px 28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              {/* Status Icon */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background:
                    micModal.state === "GRANTED"
                      ? "rgba(34, 197, 94, 0.15)"
                      : micModal.state === "DENIED"
                      ? "rgba(239, 68, 68, 0.15)"
                      : "rgba(212, 175, 55, 0.15)",
                  color:
                    micModal.state === "GRANTED"
                      ? "#4ade80"
                      : micModal.state === "DENIED"
                      ? "#f87171"
                      : "var(--gold, #d4af37)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  border:
                    micModal.state === "GRANTED"
                      ? "1px solid rgba(34, 197, 94, 0.4)"
                      : micModal.state === "DENIED"
                      ? "1px solid rgba(239, 68, 68, 0.4)"
                      : "1px solid rgba(212, 175, 55, 0.4)",
                  boxShadow:
                    micModal.state === "GRANTED"
                      ? "0 0 20px rgba(34, 197, 94, 0.2)"
                      : micModal.state === "DENIED"
                      ? "0 0 20px rgba(239, 68, 68, 0.2)"
                      : "0 0 20px rgba(212, 175, 55, 0.2)",
                }}
              >
                {micModal.state === "GRANTED" ? (
                  <CheckCircle size={36} />
                ) : micModal.state === "DENIED" ? (
                  <ShieldAlert size={36} />
                ) : (
                  <Mic size={36} />
                )}
              </div>

              {/* Title & Description */}
              <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: 750, color: "var(--ice-text)" }}>
                {micModal.state === "GRANTED"
                  ? "Microphone Connecté & Validé !"
                  : micModal.state === "DENIED"
                  ? "Microphone Bloqué par le Navigateur"
                  : "Autorisation du Microphone Requise"}
              </h3>

              <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", opacity: 0.75, lineHeight: 1.45, maxWidth: 400 }}>
                {micModal.state === "GRANTED"
                  ? "Votre micro capte correctement votre voix. Vous pouvez maintenant appeler vos collègues en direct."
                  : micModal.errorMessage
                  ? micModal.errorMessage
                  : micModal.state === "DENIED"
                  ? "Votre navigateur (Brave, Chrome ou Edge) bloque actuellement l'accès au microphone pour cette page web."
                  : "Pour téléphoner en direct avec vos collègues, l'application a besoin d'accéder au micro de votre ordinateur."}
              </p>

              {/* Denied Instructions Box */}
              {micModal.state === "DENIED" && (
                <div
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    textAlign: "left",
                    fontSize: "0.82rem",
                    lineHeight: 1.5,
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#fca5a5", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <Lock size={14} />
                    Comment débloquer le micro (Brave, Chrome, Edge) :
                  </div>
                  <div style={{ opacity: 0.85 }}>
                    1. Dans la barre d&apos;adresse tout en haut, cliquez sur l&apos;icône <strong>Cadenas 🔒</strong> ou <strong>Réglages du site</strong> (à gauche de l&apos;URL).
                  </div>
                  <div style={{ opacity: 0.85, marginTop: 4 }}>
                    2. Repérez <strong>Microphone</strong> et vérifiez qu&apos;il est bien sur <strong>Autoriser</strong>.
                  </div>
                  <div style={{ opacity: 0.95, marginTop: 8, background: "rgba(34, 197, 94, 0.12)", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(34, 197, 94, 0.3)", color: "#bbf7d0" }}>
                    💡 <strong>Important :</strong> Si le bouton Micro est déjà activé dans le cadenas (comme sur votre écran), le navigateur <em>exige</em> une <strong>actualisation de la page</strong> pour recharger la permission. Cliquez sur le bouton vert ci-dessous !
                  </div>
                </div>
              )}

              {/* Granted Vumeter */}
              {micModal.state === "GRANTED" && (
                <div style={{ width: "100%", marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 6, opacity: 0.7 }}>
                    <span>Niveau sonore détecté :</span>
                    <span style={{ fontWeight: 700, color: "#4ade80" }}>{micAudioLevel > 3 ? "Parole détectée" : "Prêt"}</span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: 10,
                      background: "rgba(255, 255, 255, 0.08)",
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.max(8, micAudioLevel)}%`,
                        background: micAudioLevel > 60 ? "#ef4444" : micAudioLevel > 30 ? "#eab308" : "#22c55e",
                        transition: "width 0.1s ease",
                        borderRadius: 6,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "center", flexWrap: "wrap" }}>
                {micModal.state === "GRANTED" ? (
                  micModal.pendingAction ? (
                    <button
                      type="button"
                      onClick={() => {
                        const act = micModal.pendingAction;
                        stopTestStream();
                        setMicModal(null);
                        if (act?.type === "START_CALL" && act.peerId && act.peerName) {
                          startCall(act.peerId, act.peerName);
                        } else if (act?.type === "ACCEPT_CALL" && act.callId) {
                          handleAcceptCall();
                        }
                      }}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
                      }}
                    >
                      📞 Lancer l&apos;Appel avec {micModal.pendingAction.peerName}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        stopTestStream();
                        setMicModal(null);
                      }}
                      style={{
                        padding: "10px 24px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                      }}
                    >
                      Fermer (Micro Prêt)
                    </button>
                  )
                ) : micModal.state === "DENIED" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        stopTestStream();
                        setMicModal(null);
                      }}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 10,
                        border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                        background: "transparent",
                        color: "var(--ice-text)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      Annuler
                    </button>

                    {/* Reload & Resume Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (micModal.pendingAction?.peerId && micModal.pendingAction?.peerName) {
                          sessionStorage.setItem(
                            "saas_pending_voice_call",
                            JSON.stringify({
                              peerId: micModal.pendingAction.peerId,
                              peerName: micModal.pendingAction.peerName,
                              timestamp: Date.now(),
                            })
                          );
                        } else {
                          sessionStorage.setItem("saas_pending_mic_test", "true");
                        }
                        window.location.reload();
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 20px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #22c55e, #15803d)",
                        color: "#fff",
                        fontWeight: 750,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
                      }}
                    >
                      <RefreshCw size={16} />
                      {micModal.pendingAction ? "Actualiser & Lancer l'Appel" : "Actualiser la page"}
                    </button>

                    {/* Re-try without reload */}
                    <button
                      type="button"
                      disabled={isRetryingMic}
                      onClick={() => tryAcquireMicrophone(micModal.pendingAction)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 16px",
                        borderRadius: 10,
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "var(--ice-text)",
                        fontWeight: 650,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        opacity: isRetryingMic ? 0.6 : 1,
                      }}
                    >
                      {isRetryingMic ? "Vérification..." : "Tester sans actualiser"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        stopTestStream();
                        setMicModal(null);
                      }}
                      style={{
                        padding: "10px 18px",
                        borderRadius: 10,
                        border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                        background: "transparent",
                        color: "var(--ice-text)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      Annuler
                    </button>

                    <button
                      type="button"
                      disabled={isRetryingMic}
                      onClick={() => tryAcquireMicrophone(micModal.pendingAction)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 22px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #d4af37, #b48c1e)",
                        color: "#000",
                        fontWeight: 750,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                        opacity: isRetryingMic ? 0.6 : 1,
                      }}
                    >
                      <Mic size={16} />
                      {isRetryingMic ? "Connexion au micro..." : "Autoriser le Microphone"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. TOAST FLOTTANT DE NOUVEAU MESSAGE REÇU                    */}
      {/* ============================================================ */}
      {messageToast && (
        <div
          role="alert"
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            width: "calc(100vw - 32px)",
            maxWidth: 380,
            background: "linear-gradient(135deg, rgba(22, 26, 32, 0.98), rgba(15, 20, 26, 0.98))",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(212, 175, 55, 0.45)",
            borderRadius: 14,
            boxShadow: "0 10px 35px rgba(0, 0, 0, 0.5), 0 0 15px rgba(212, 175, 55, 0.2)",
            zIndex: 1000001,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "rgba(212, 175, 55, 0.2)",
              color: "var(--gold, #d4af37)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            <MessageSquare size={18} />
          </div>

          <div
            style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
            onClick={() => {
              setMessageToast(null);
              window.location.href = "/chat";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--gold, #d4af37)", textTransform: "uppercase" }}>
                {messageToast.isBroadcast ? "📢 Diffusion Direction" : "Nouveau Message"}
              </span>
            </div>
            <div style={{ fontSize: "0.88rem", fontWeight: 650, color: "var(--ice-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {messageToast.senderName}
            </div>
            <div style={{ fontSize: "0.78rem", opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--ice-text)" }}>
              {messageToast.content || messageToast.sticker || "Nouveau message"}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={() => {
                setMessageToast(null);
                window.location.href = "/chat";
              }}
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                background: "linear-gradient(135deg, #d4af37, #b48c1e)",
                border: "none",
                color: "#000",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Voir
            </button>
            <button
              type="button"
              onClick={() => setMessageToast(null)}
              style={{
                background: "none",
                border: "none",
                color: "var(--ice-text)",
                opacity: 0.6,
                cursor: "pointer",
                padding: 4,
              }}
              aria-label="Fermer la notification"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
