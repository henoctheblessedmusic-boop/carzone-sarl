"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Smartphone,
  Monitor,
  Columns,
  Download,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Wrench,
  PhoneCall,
  Bell,
  HelpCircle,
  CheckCircle2,
  Layers,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Scene {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  desktopImage: string;
  mobileImage?: string;
  zoomTarget: "center" | "bottom" | "top-right" | "middle-left" | "charts" | "header";
  zoomScale: number;
  description: string;
  keyPoints: string[];
  stats: { label: string; value: string }[];
}

const SCENES: Scene[] = [
  {
    id: "intro",
    number: "01",
    title: "CARZONE Ops — Système d'Exploitation Concessionnaire",
    subtitle: "Architecture d'Entreprise Unifiée & Mobilité Haute Performance",
    badge: "100% Production · BDD Neon",
    badgeColor: "#3b82f6",
    desktopImage: "/presentation/dashboard_16_9.png",
    mobileImage: "/presentation/dashboard_mobile.png",
    zoomTarget: "center",
    zoomScale: 1.08,
    description:
      "Plateforme centralisée tout-en-un pour le pilotage complet de la concession Carzone SARL à Cotonou : stocks véhicules, atelier SAV, comptabilité, CRM, VoIP interne et bornes électriques.",
    keyPoints: [
      "Authentification sécurisée par hachage Bcrypt & sessions inviolables",
      "Matrice de permissions granulaires sur 18 rôles opérationnels",
      "Expérience unifiée sur ordinateur grand écran et smartphone",
    ],
    stats: [
      { label: "Rôles Métiers", value: "18 Rôles" },
      { label: "Intégrité BDD", value: "100% Réelle" },
      { label: "Temps Réel", value: "< 250ms" },
    ],
  },
  {
    id: "finance",
    number: "02",
    title: "Tableau de Bord Financier & Graphes Réels",
    subtitle: "Visibilité Totale sur les Ventes, Dépenses et Bénéfices Réels",
    badge: "Zéro Donnée Fictive",
    badgeColor: "#10b981",
    desktopImage: "/presentation/charts_16_9.png",
    mobileImage: "/presentation/dashboard_mobile.png",
    zoomTarget: "charts",
    zoomScale: 1.25,
    description:
      "4 graphes dynamiques reliés directement aux écritures comptables réelles : Évolution des ventes, Évolution des dépenses, Performance des activités et Bénéfice général net calculé après salaires et charges.",
    keyPoints: [
      "Calcul automatique du bénéfice net après salaires et charges réelles",
      "Filtre temporel instantané : 1 mois, 6 mois, 1 an, 2 ans, 3 ans",
      "Corrélation stricte avec les factures réglées et les bons de caisse",
    ],
    stats: [
      { label: "Graphes Clés", value: "4 Piliers" },
      { label: "Horizons", value: "1M à 3 Ans" },
      { label: "Précision", value: "Comptable" },
    ],
  },
  {
    id: "tech-sheet",
    number: "03",
    title: "Fiches Techniques IA & Stock Véhicules",
    subtitle: "Génération OpenAI GPT-4o & Enregistrement Définitif en BDD",
    badge: "Immuabilité Base de Données",
    badgeColor: "#8b5cf6",
    desktopImage: "/presentation/tech_sheet_16_9.png",
    mobileImage: "/presentation/vehicles_16_9.png",
    zoomTarget: "center",
    zoomScale: 1.22,
    description:
      "Génération assistée par IA avec bouton de confirmation : une fois la fiche technique validée, elle reste définitivement stockée en BDD sans aucune régénération redondante. Navigation fluide sans ouverture d'autre onglet.",
    keyPoints: [
      "Spécifications complètes : Motorisation, Puissance, Autonomie, Dimensions",
      "Bouton 'Confirmer la fiche technique' pour gel immuable en BDD",
      "Consultation directe in-app avec retour facile au catalogue",
    ],
    stats: [
      { label: "Modèle IA", value: "GPT-4o" },
      { label: "Persistance", value: "Définitive" },
      { label: "Économie Tokens", value: "> 95%" },
    ],
  },
  {
    id: "workshop",
    number: "04",
    title: "Atelier SAV & Matrice Excel Bidirectionnelle",
    subtitle: "Suivi des Réparations, Ordres de Travail & Import/Export XLSX",
    badge: "Compatibilité Excel Native",
    badgeColor: "#f59e0b",
    desktopImage: "/presentation/workshop_16_9.png",
    mobileImage: "/presentation/dashboard_mobile.png",
    zoomTarget: "center",
    zoomScale: 1.18,
    description:
      "Pilotage des ordres de réparation, pièces détachées et devis techniques. Export et import instantanés avec modèle Excel structuré pour les équipes terrain et le chef d'atelier.",
    keyPoints: [
      "Téléchargement du modèle de matrice Excel préformaté en 1 clic",
      "Synchronisation bidirectionnelle fluide entre l'atelier et la facturation",
      "Suivi des délais, kilométrages et statuts d'intervention en direct",
    ],
    stats: [
      { label: "Format Fichier", value: ".XLSX" },
      { label: "Temps Synchro", value: "Instantané" },
      { label: "Suivi Pièces", value: "Intégré" },
    ],
  },
  {
    id: "voip",
    number: "05",
    title: "Téléphonie VoIP & Salons de Conférence Audio",
    subtitle: "Communications d'Équipe Chiffrées & Salons Virtuels Dédiés",
    badge: "WebRTC Audio HD",
    badgeColor: "#06b6d4",
    desktopImage: "/presentation/conference_voip_16_9.png",
    mobileImage: "/presentation/chat_mobile.png",
    zoomTarget: "center",
    zoomScale: 1.2,
    description:
      "Messagerie interne instantanée, appels vocaux poste-à-poste et 4 salons de conférence audio virtuels permanents : Direction Générale, Atelier SAV, Commercial et Entreprise.",
    keyPoints: [
      "Communication audio chiffrée de bout en bout sans standard téléphonique externe",
      "Visualiseur audio animé et gestion des micros en temps réel",
      "Canaux d'annonces officielles et diffusion de consignes urgentes",
    ],
    stats: [
      { label: "Salons Permanents", value: "4 Espaces" },
      { label: "Latence Audio", value: "< 50ms" },
      { label: "Confidentialité", value: "Chiffré" },
    ],
  },
  {
    id: "mobile",
    number: "06",
    title: "Mobile Checking & Notifications en Temps Réel",
    subtitle: "Supervision Nomade pour la Direction et les Équipes Terrain",
    badge: "Ultra-Responsive Mobile",
    badgeColor: "#ec4899",
    desktopImage: "/presentation/dashboard_mobile.png",
    mobileImage: "/presentation/menu_mobile.png",
    zoomTarget: "top-right",
    zoomScale: 1.15,
    description:
      "Interface mobile conçue pour le contrôle à la volée : consultation des notifications d'urgence, validation de devis, vérification des entrées/sorties de véhicules et navigation au pouce optimisée.",
    keyPoints: [
      "Cloche de notifications temps réel avec alertes sonores et visuelles",
      "Tiroir de navigation rapide adapté aux manipulations à une main",
      "Vitesse de chargement fulgurante optimisée pour les réseaux 4G/5G",
    ],
    stats: [
      { label: "Viewport", value: "390 × 844" },
      { label: "Touch UX", value: "100% Fluide" },
      { label: "Alertes", value: "Push Réel" },
    ],
  },
  {
    id: "help",
    number: "07",
    title: "Centre d'Aide & Documentation Stylée",
    subtitle: "Guides Intégrés, Recherche Instantanée & Premiers Pas Mémorisés",
    badge: "Design Glassmorphism",
    badgeColor: "#6366f1",
    desktopImage: "/presentation/help_center_16_9.png",
    mobileImage: "/presentation/menu_mobile.png",
    zoomTarget: "center",
    zoomScale: 1.18,
    description:
      "Modal d'aide moderne accessible depuis le header et le menu mobile. Mémorisation du guide 'Premiers pas' par utilisateur pour ne plus encombrer l'écran une fois fermé, avec possibilité de relance à la demande.",
    keyPoints: [
      "Recherche instantanée filtrant tous les modules et procédures",
      "Guides thématiques complets pour chaque corps de métier",
      "Nettoyage complet de l'interface : aucun bouton flottant persistant",
    ],
    stats: [
      { label: "Guides Métiers", value: "8 Modules" },
      { label: "Filtre Recherche", value: "Instant" },
      { label: "UX Clutter", value: "0% Déchet" },
    ],
  },
  {
    id: "security",
    number: "08",
    title: "Sécurité d'Entreprise, Rôles & Scalabilité",
    subtitle: "Une Infrastructure Pérenne Prête pour l'Expansion Nationale",
    badge: "Conforme Normes Bancaires",
    badgeColor: "#14b8a6",
    desktopImage: "/presentation/login_16_9.png",
    mobileImage: "/presentation/dashboard_mobile.png",
    zoomTarget: "center",
    zoomScale: 1.12,
    description:
      "Base de données relationnelle Neon PostgreSQL avec pool de connexions haute disponibilité, mots de passe chiffrés Bcrypt avec temporisation anti-bruteforce progressive, et isolation stricte du rôle DEVELOPER.",
    keyPoints: [
      "Protection multi-niveaux contre les attaques par force brute (verrou progressif)",
      "Journalisation d'audit des actions critiques et des transactions",
      "Hébergement cloud Vercel avec bascule instantanée et sauvegardes continues",
    ],
    stats: [
      { label: "Chiffrement", value: "Bcrypt Cost 10" },
      { label: "Uptime Cloud", value: "99.98%" },
      { label: "Audit Log", value: "100% Traçable" },
    ],
  },
];

export function PresentationClient() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<"landscape" | "mobile" | "split">("landscape");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomPhase, setZoomPhase] = useState(0); // 0 = standard, 1 = zoomé
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const currentScene = SCENES[currentIdx];

  // Alternance périodique des zooms toutes les 3.5 secondes pour rendre la scène vivante
  useEffect(() => {
    const zoomInterval = setInterval(() => {
      setZoomPhase((prev) => (prev === 0 ? 1 : 0));
    }, 3500);
    return () => clearInterval(zoomInterval);
  }, [currentIdx]);

  // Défilement automatique des scènes en mode lecture
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SCENES.length);
      setZoomPhase(0);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Navigation clavier
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentIdx((p) => (p + 1) % SCENES.length);
        setZoomPhase(0);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIdx((p) => (p - 1 + SCENES.length) % SCENES.length);
        setZoomPhase(0);
      } else if (e.key === "f") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Enregistrement vidéo haute qualité via Canvas / MediaStream
  const startRecording = async () => {
    try {
      // Capture d'écran de l'onglet/fenêtre via getDisplayMedia pour une vidéo fluide
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 60, width: 1920, height: 1080 },
        audio: false,
      });

      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `carzone_motion_presentation_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setRecordingSeconds(0);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(500);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setIsPlaying(true);
    } catch {
      alert("Enregistrement annulé ou non supporté par ce navigateur.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Calcul du facteur de zoom dynamique
  const currentScale = zoomPhase === 1 ? currentScene.zoomScale : 1.0;
  const zoomOrigin =
    currentScene.zoomTarget === "charts"
      ? "50% 65%"
      : currentScene.zoomTarget === "bottom"
      ? "50% 90%"
      : currentScene.zoomTarget === "top-right"
      ? "85% 15%"
      : currentScene.zoomTarget === "middle-left"
      ? "20% 50%"
      : "50% 50%";

  return (
    <div
      ref={containerRef}
      className="carzone-motion-suite"
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #0a0a14 55%, #030307 100%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Top Header Controls Bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 2rem",
          background: "rgba(10, 10, 20, 0.75)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.45rem 0.9rem",
              background: "rgba(255, 255, 255, 0.06)",
              borderRadius: "10px",
              color: "#e2e8f0",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              transition: "all 0.2s ease",
            }}
          >
            ← Retour à l&apos;App
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "#fff",
                fontWeight: 900,
                fontSize: "0.75rem",
                padding: "0.25rem 0.65rem",
                borderRadius: "6px",
                letterSpacing: "0.08em",
                boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)",
              }}
            >
              STUDIO MOTION
            </span>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              CARZONE SARL <span style={{ color: "#38bdf8", fontWeight: 400 }}>· Présentation Officielle</span>
            </span>
          </div>
        </div>

        {/* View Mode Switcher (16:9 Landscape / Mobile 9:16 / Split) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(15, 23, 42, 0.8)",
            padding: "4px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            gap: "4px",
          }}
        >
          <button
            onClick={() => setViewMode("landscape")}
            title="Format Ordinateur 16:9 Landscape"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0.4rem 0.9rem",
              borderRadius: "8px",
              border: "none",
              background: viewMode === "landscape" ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "transparent",
              color: viewMode === "landscape" ? "#fff" : "#94a3b8",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.82rem",
              transition: "all 0.2s ease",
            }}
          >
            <Monitor size={15} /> 16:9 Ordinateur
          </button>
          <button
            onClick={() => setViewMode("mobile")}
            title="Format Mobile 9:16 (06:19 Checking Nomade)"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0.4rem 0.9rem",
              borderRadius: "8px",
              border: "none",
              background: viewMode === "mobile" ? "linear-gradient(135deg, #ec4899, #be185d)" : "transparent",
              color: viewMode === "mobile" ? "#fff" : "#94a3b8",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.82rem",
              transition: "all 0.2s ease",
            }}
          >
            <Smartphone size={15} /> Mobile Checking
          </button>
          <button
            onClick={() => setViewMode("split")}
            title="Vue Duo Synchronisée Ordinateur + Mobile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0.4rem 0.9rem",
              borderRadius: "8px",
              border: "none",
              background: viewMode === "split" ? "linear-gradient(135deg, #8b5cf6, #6d28d9)" : "transparent",
              color: viewMode === "split" ? "#fff" : "#94a3b8",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.82rem",
              transition: "all 0.2s ease",
            }}
          >
            <Columns size={15} /> Vue Duo Miroir
          </button>
        </div>

        {/* Video Recording & Fullscreen Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {!isRecording ? (
            <button
              onClick={startRecording}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)",
                transition: "all 0.2s ease",
              }}
            >
              <Download size={15} /> Enregistrer Vidéo Motion
            </button>
          ) : (
            <button
              onClick={stopRecording}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                border: "none",
                background: "#f97316",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                animation: "pulse 1.5s infinite",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#fff",
                  display: "inline-block",
                }}
              />
              Arrêter & Télécharger ({recordingSeconds}s)
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#fff",
              padding: "0.5rem",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Plein Écran (Touche F)"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* Main Motion Design Cinema Theater */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem 2rem",
          position: "relative",
          maxWidth: 1600,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Dynamic HUD Tag Line */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
            padding: "0 0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontFamily: "monospace",
                color: "#38bdf8",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              SCÈNE {currentScene.number} / {SCENES.length.toString().padStart(2, "0")}
            </span>
            <span
              style={{
                background: `${currentScene.badgeColor}22`,
                color: currentScene.badgeColor,
                border: `1px solid ${currentScene.badgeColor}55`,
                padding: "0.2rem 0.7rem",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {currentScene.badge}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: "0.82rem", color: "#94a3b8" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: isPlaying ? "#10b981" : "#f59e0b",
                  boxShadow: isPlaying ? "0 0 10px #10b981" : "none",
                }}
              />
              {isPlaying ? "LECTURE CINÉMATIQUE AUTOMATIQUE" : "PAUSE"}
            </span>
            <span style={{ opacity: 0.6 }}>|</span>
            <span style={{ fontFamily: "monospace" }}>ZOOM ACTIF : ×{currentScale.toFixed(2)}</span>
          </div>
        </div>

        {/* 16:9 Cinema Container with Glowing Backdrop */}
        <div
          style={{
            width: "100%",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            perspective: "1200px",
          }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: "absolute",
              width: "80%",
              height: "70%",
              background: `radial-gradient(circle, ${currentScene.badgeColor}33 0%, transparent 70%)`,
              filter: "blur(60px)",
              pointerEvents: "none",
              zIndex: 0,
              transition: "all 1s ease",
            }}
          />

          {/* VIEW: Landscape 16:9 View */}
          {viewMode === "landscape" && (
            <div
              style={{
                width: "100%",
                maxWidth: 1280,
                aspectRatio: "16 / 9",
                background: "#0a0a14",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.15)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Window Frame Bar */}
              <div
                style={{
                  height: 38,
                  background: "rgba(20, 20, 35, 0.95)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 1rem",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  fontSize: "0.8rem",
                  color: "#94a3b8",
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ef4444" }} />
                  <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#f59e0b" }} />
                  <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#10b981" }} />
                </div>
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    padding: "3px 14px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    color: "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ShieldCheck size={12} color="#10b981" />
                  https://carzone-sarl.vercel.app/
                </div>
                <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>16:9 UHD · 60 FPS</div>
              </div>

              {/* Viewport with Animated Periodic Zoom */}
              <div
                style={{
                  width: "100%",
                  height: "calc(100% - 38px)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    transformOrigin: zoomOrigin,
                    transform: `scale(${currentScale})`,
                    transition: "transform 3.2s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                >
                  <Image
                    src={currentScene.desktopImage}
                    alt={currentScene.title}
                    fill
                    priority
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    style={{ objectFit: "cover", objectPosition: "top center" }}
                  />
                </div>

                {/* Live HUD Overlay Card */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "1.5rem",
                    left: "1.5rem",
                    maxWidth: 480,
                    background: "rgba(10, 10, 25, 0.82)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    padding: "1.2rem",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                    animation: "fadeIn 0.5s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: currentScene.badgeColor,
                      }}
                    />
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: currentScene.badgeColor }}>
                      {currentScene.badge}
                    </span>
                  </div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", fontWeight: 800 }}>{currentScene.title}</h3>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.45 }}>
                    {currentScene.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: Mobile 9:16 (06:19 Checking Nomade) */}
          {viewMode === "mobile" && (
            <div
              style={{
                width: 380,
                height: 760,
                background: "#020617",
                borderRadius: "50px",
                border: "8px solid #27272a",
                boxShadow:
                  "0 25px 70px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(236, 72, 153, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.1)",
                position: "relative",
                overflow: "hidden",
                zIndex: 1,
              }}
            >
              {/* Dynamic Island Notch */}
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 110,
                  height: 28,
                  background: "#000",
                  borderRadius: "20px",
                  zIndex: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 10px",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06b6d4" }} />
              </div>

              {/* Mobile Screen Content */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  transformOrigin: "50% 30%",
                  transform: `scale(${zoomPhase === 1 ? 1.08 : 1.0})`,
                  transition: "transform 3.2s cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              >
                <Image
                  src={currentScene.mobileImage || currentScene.desktopImage}
                  alt={currentScene.title}
                  fill
                  priority
                  sizes="380px"
                  style={{ objectFit: "cover", objectPosition: "top center" }}
                />
              </div>

              {/* Bottom Touch Indicator */}
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 130,
                  height: 4,
                  background: "rgba(255, 255, 255, 0.6)",
                  borderRadius: "10px",
                  zIndex: 20,
                }}
              />
            </div>
          )}

          {/* VIEW: Split Duo (Desktop 16:9 + Mobile Checking) */}
          {viewMode === "split" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "2rem",
                width: "100%",
                maxWidth: 1400,
                zIndex: 1,
                flexWrap: "wrap",
              }}
            >
              {/* Desktop Window Mini */}
              <div
                style={{
                  flex: "1 1 700px",
                  aspectRatio: "16 / 9",
                  background: "#0a0a14",
                  borderRadius: "18px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: 30,
                    background: "rgba(20, 20, 35, 0.95)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 10px",
                    gap: 6,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444" }} />
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f59e0b" }} />
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", marginLeft: 8 }}>Bureau 16:9</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "calc(100% - 30px)",
                    position: "relative",
                    transformOrigin: zoomOrigin,
                    transform: `scale(${currentScale})`,
                    transition: "transform 3.2s ease",
                  }}
                >
                  <Image
                    src={currentScene.desktopImage}
                    alt={currentScene.title}
                    fill
                    sizes="700px"
                    style={{ objectFit: "cover", objectPosition: "top center" }}
                  />
                </div>
              </div>

              {/* Mobile Phone Device */}
              <div
                style={{
                  width: 290,
                  height: 560,
                  background: "#020617",
                  borderRadius: "40px",
                  border: "6px solid #27272a",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 80,
                    height: 20,
                    background: "#000",
                    borderRadius: "14px",
                    zIndex: 20,
                  }}
                />
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    transform: `scale(${zoomPhase === 1 ? 1.05 : 1.0})`,
                    transition: "transform 3.2s ease",
                  }}
                >
                  <Image
                    src={currentScene.mobileImage || currentScene.desktopImage}
                    alt={currentScene.title}
                    fill
                    sizes="290px"
                    style={{ objectFit: "cover", objectPosition: "top center" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Scene Storyboard & Metrics Bar */}
        <section
          style={{
            width: "100%",
            maxWidth: 1280,
            marginTop: "1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.2rem",
          }}
        >
          {/* Card 1: Key Points */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(16px)",
              borderRadius: "16px",
              padding: "1.2rem 1.4rem",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Sparkles size={17} color="#38bdf8" />
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#f8fafc" }}>
                Fonctionnalités Clés en Production
              </h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.6 }}>
              {currentScene.keyPoints.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>

          {/* Card 2: Live Indicators / Stats */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(16px)",
              borderRadius: "16px",
              padding: "1.2rem 1.4rem",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <TrendingUp size={17} color="#10b981" />
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#f8fafc" }}>
                Métriques Opérationnelles
              </h4>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.8rem", textAlign: "center" }}>
              {currentScene.stats.map((st, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    padding: "0.6rem 0.4rem",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: currentScene.badgeColor }}>
                    {st.value}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Playback Controls & Scene Timeline */}
        <footer
          style={{
            width: "100%",
            maxWidth: 1280,
            marginTop: "1.5rem",
            background: "rgba(10, 10, 20, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "1rem 1.4rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
          }}
        >
          {/* Progress Scrubber */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              width: "100%",
            }}
          >
            {SCENES.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => {
                  setCurrentIdx(idx);
                  setZoomPhase(0);
                }}
                title={`${sc.number} - ${sc.title}`}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  border: "none",
                  background:
                    idx === currentIdx
                      ? currentScene.badgeColor
                      : idx < currentIdx
                      ? "rgba(255, 255, 255, 0.35)"
                      : "rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              />
            ))}
          </div>

          {/* Buttons & Scene Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            {/* Play/Pause & Nav */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <button
                onClick={() => setCurrentIdx((p) => (p - 1 + SCENES.length) % SCENES.length)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "0.45rem",
                  cursor: "pointer",
                }}
                title="Scène précédente"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: isPlaying ? "rgba(255, 255, 255, 0.12)" : currentScene.badgeColor,
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.45rem 1rem",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? "Pause" : "Lecture"}
              </button>

              <button
                onClick={() => setCurrentIdx((p) => (p + 1) % SCENES.length)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "0.45rem",
                  cursor: "pointer",
                }}
                title="Scène suivante"
              >
                <ChevronRight size={18} />
              </button>

              <button
                onClick={() => {
                  setCurrentIdx(0);
                  setZoomPhase(0);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "0.45rem",
                  cursor: "pointer",
                }}
                title="Recommencer depuis le début"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Current Scene Title & Navigation Pills */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                overflowX: "auto",
                maxWidth: "60%",
                paddingBottom: 4,
              }}
            >
              {SCENES.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setCurrentIdx(idx);
                    setZoomPhase(0);
                  }}
                  style={{
                    padding: "0.3rem 0.7rem",
                    borderRadius: "6px",
                    border: "none",
                    background: idx === currentIdx ? "rgba(255, 255, 255, 0.18)" : "transparent",
                    color: idx === currentIdx ? "#fff" : "#94a3b8",
                    fontSize: "0.78rem",
                    fontWeight: idx === currentIdx ? 700 : 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                >
                  {sc.number}. {sc.title.split("—")[0].split("&")[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
