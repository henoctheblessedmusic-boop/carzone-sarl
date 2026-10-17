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

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "getting-started",
    title: "1. Premiers Pas & Prise en Main",
    icon: Compass,
    badge: "Démarrage",
    summary: "Découverte générale de l'interface CARZONE Ops, navigation par rôle et principes clés.",
    sections: [
      {
        heading: "Architecture de la plateforme",
        content:
          "CARZONE Ops est l'ERP de gestion intégrée conçu spécialement pour CARZONE SARL Bénin. Il centralise le showroom automobile de véhicules neufs, l'Atelier SAV haute tension, la facturation normalisée, les flux de trésorerie réels et la communication d'équipe.",
        tips: [
          "Chaque collaborateur dispose d'une vue personnalisée selon son rôle métier.",
          "Les données affichées dans l'application sont 100% synchronisées avec la base de données PostgreSQL.",
        ],
      },
      {
        heading: "Navigation et Raccourcis",
        content:
          "Utilisez la barre latérale gauche pour naviguer entre les différents modules. Sur mobile, le menu s'ouvre d'un clic sur l'icône de navigation. La barre supérieure contient l'accès direct aux messages/appels, aux alertes de sécurité pour la Direction, aux préférences de thème et au présent Centre d'Aide.",
      },
    ],
  },
  {
    id: "dashboard",
    title: "2. Tableau de Bord Financier & Performance",
    icon: TrendingUp,
    badge: "Finance & DG",
    summary: "Analyse de la rentabilité réelle, flux de trésorerie consolidés et filtres temporels au goût du DG.",
    linkText: "Ouvrir le Tableau de Bord",
    linkHref: "/dashboard",
    sections: [
      {
        heading: "Les 4 Graphes de Performance Réelle",
        content:
          "Le tableau de bord ne comporte aucune donnée fictive. Toutes les courbes sont calculées mensuellement sur la base des écritures réelles :",
        tips: [
          "💎 1. Bénéfice Général Réel : Marge brute sur ventes encaissées MOINS l'intégralité des dépenses d'entreprise (charges, prestataires, loyers) et MOINS les salaires du personnel versés chaque mois.",
          "💰 2. Évolution des Ventes : Comparaison directe entre le montant total facturé (proformas / ventes) et le montant effectivement encaissé en trésorerie.",
          "💸 3. Dépenses d'Entreprise : Consolidation de tous les décaissements réels (Bons de commande BC, charges d'exploitation, fournisseurs et paie).",
          "⚡ 4. Activités & Opérations : Suivi volumétrique réel des entrées/sorties Atelier SAV, des devis émis et des fiches véhicules actives.",
        ],
      },
      {
        heading: "Sélecteur de Période Temporelle",
        content:
          "En haut à droite du tableau de bord, vous pouvez ajuster l'horizon temporel en un clic : 1 Mois, 6 Mois, 1 An, 2 Ans ou 3 Ans. Tous les totaux, pourcentages et moyennes mensuelles s'adaptent instantanément.",
      },
    ],
  },
  {
    id: "vehicles",
    title: "3. Véhicules, Fiches Techniques IA & Stock",
    icon: Car,
    badge: "Showroom",
    summary: "Parc automobile de luxe, fiches techniques homologuées, génération IA unitaire et impression officielle.",
    linkText: "Gérer le Stock Véhicules",
    linkHref: "/vehicles",
    sections: [
      {
        heading: "Fiches Techniques Homologuées & Confirmation BDD",
        content:
          "Chaque véhicule dispose d'une fiche technique ultra-complète (motorisation, batterie, autonomie CLTC/WLTP, dimensions, sécurité, équipements de luxe).",
        tips: [
          "Génération OpenAI unitaire : L'IA ne s'exécute que sur demande explicite pour un véhicule spécifique, sans jamais consommer de crédits sur les autres véhicules.",
          "Confirmation définitive : Dès que vous cliquez sur le bouton vert « Confirmer la fiche technique », elle est scellée en base de données PostgreSQL. Le système priorise toujours les données de la base.",
          "Consultation sur place : Lorsque vous cliquez sur « Fiche technique », celle-ci s'ouvre dans la même fenêtre pour vous permettre de naviguer et revenir en arrière facilement.",
        ],
      },
      {
        heading: "Impression & Devis Clients",
        content:
          "Le bouton « Imprimer la Fiche Technique » produit un document officiel de prestige, sans coupure de texte ni débordement, prêt à être remis aux acheteurs ou annexé aux factures proformas.",
      },
    ],
  },
  {
    id: "workshop",
    title: "4. Atelier SAV, Réparations & Matrice Excel",
    icon: Wrench,
    badge: "Atelier Garage",
    summary: "Gestion des Ordres de Réparation (OR), diagnostics haute tension et fichier Excel officiel Carzone.",
    linkText: "Consulter l'Atelier SAV",
    linkHref: "/workshop",
    sections: [
      {
        heading: "Workflow d'un Ordre de Réparation (OR)",
        content:
          "À l'arrivée d'un véhicule à l'Atelier Carzone : 1) Créez l'OR avec immatriculation, kilométrage et motif. 2) Attribuez un technicien. 3) Établissez le diagnostic technique et le devis de pièces. 4) Validez l'exécution des travaux et enregistrez la sortie.",
      },
      {
        heading: "Matrice Excel SAV Carzone",
        content:
          "L'Atelier SAV dispose d'une compatibilité Excel complète :",
        tips: [
          "Télécharger le modèle : Cliquez sur « Télécharger Modèle Excel » pour obtenir la grille officielle avec les colonnes homologuées.",
          "Exporter l'historique : Cliquez sur « Exporter l'historique en Excel » pour extraire l'intégralité des passages d'atelier vers un fichier .XLSX prêt pour la comptabilité ou la Direction.",
        ],
      },
    ],
  },
  {
    id: "invoices-expenses",
    title: "5. Ventes, Facturation, Dépenses & Salaires",
    icon: Receipt,
    badge: "Comptabilité",
    summary: "Devis, factures normalisées, enregistrement des encaissements et gestion des charges de fonctionnement.",
    linkText: "Gérer la Facturation",
    linkHref: "/invoices",
    sections: [
      {
        heading: "Facturation & Règlements Clients",
        content:
          "Émettez des factures proformas et convertissez-les en factures de vente. Lors de la réception d'un paiement, utilisez le bouton « Encaisser » en renseignant le mode (Virement, Chèque, Espèces, Mobile Money) et la référence.",
        tips: [
          "Le système suit automatiquement les statuts : BROUILLON, EN_ATTENTE, PAYEE_PARTIEL, PAYEE.",
          "Un grand livre financier complet est téléchargeable via « Extraction Bilan Financier ».",
        ],
      },
      {
        heading: "Dépenses d'Entreprise & Bons de Commande (BC)",
        content:
          "Dans la section Dépenses (/expenses), enregistrez les achats auprès des prestataires, fournisseurs et loyers avec leur bon de commande automatique (ex: BC-2026-001). Les salaires du personnel versés dans le module RH (/hr) sont également consolidés.",
      },
    ],
  },
  {
    id: "voip-chat",
    title: "6. Téléphonie VoIP, Conférences & Chat",
    icon: PhoneCall,
    badge: "Communication",
    summary: "Appels vocaux directs entre collaborateurs, salons de conférence audio virtuels et messagerie d'équipe.",
    linkText: "Accéder à la Messagerie & Appels",
    linkHref: "/chat",
    sections: [
      {
        heading: "Passer un Appel Direct Interne",
        content:
          "Depuis le module Chat (/chat) ou l'annuaire d'équipe, cliquez sur le bouton téléphone vert à côté du nom d'un collègue. Votre navigateur utilise une liaison audio WebRTC sécurisée et chiffrée.",
      },
      {
        heading: "Salons de Conférence Audio",
        content:
          "Rejoignez les salons virtuels permanents (Comité de Direction, Atelier SAV, Réunion Commerciale). Vous pouvez couper votre micro, observer les indicateurs de parole en direct et inviter des collaborateurs d'un clic.",
        tips: [
          "Assurez-vous d'avoir accordé l'autorisation d'accès au microphone dans votre navigateur.",
          "La clôture d'un salon de conférence est protégée et réservée à son organisateur ou aux membres de la Direction.",
        ],
      },
    ],
  },
  {
    id: "charging",
    title: "7. Bornes de Recharge & Terminal Express",
    icon: Zap,
    badge: "Énergie",
    summary: "Réseau de bornes de recharge rapide à Cotonou, abonnements Club VIP et terminal d'encaissement.",
    linkText: "Voir les Bornes de Recharge",
    linkHref: "/charging",
    sections: [
      {
        heading: "Tarifs & Abonnements Électriques",
        content:
          "CARZONE SARL exploite un réseau de bornes de recharge ultra-rapides. Le tarif d'accès public est fixé à 125 FCFA / kWh, tandis que les abonnés au Club CARZONE VIP bénéficient d'un tarif préférentiel de 90 FCFA / kWh.",
      },
      {
        heading: "Terminal Express au Comptoir (/terminal)",
        content:
          "Permet à l'hôtesse ou au caissier d'enregistrer une session de recharge manuelle pour un client, de calculer automatiquement le montant en FCFA et de générer la facture de recharge correspondante.",
      },
    ],
  },
  {
    id: "security",
    title: "8. Sécurité, Profils Utilisateurs & Bcrypt",
    icon: ShieldCheck,
    badge: "Sécurité & Audit",
    summary: "Chiffrement irréversible des mots de passe, gestion des rôles et contrôle strict des accès.",
    linkText: "Gérer les Utilisateurs",
    linkHref: "/users",
    sections: [
      {
        heading: "Protection Maximale des Identifiants",
        content:
          "La plateforme applique les standards de sécurité les plus stricts. Aucun mot de passe n'est stocké en texte clair. Tous les mots de passe sont hachés de manière irréversible avec l'algorithme Bcrypt.",
        tips: [
          "Le DG et l'Administrateur peuvent définir ou réinitialiser le mot de passe d'un collaborateur à tout moment depuis la vue Utilisateurs (/users).",
          "Les sessions inactives ou expirées sont automatiquement invalidées et les accès des collaborateurs désactivés sont coupés en temps réel.",
        ],
      },
      {
        heading: "Gouvernance des Rôles & Permissions",
        content:
          "Chaque compte dispose de permissions ciblées (DG, ADV, RF, Commercial, Chef d'Atelier, RH, etc.) garantissant l'étanchéité des données confidentielles de l'entreprise.",
      },
    ],
  },
];

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
    if (!q) return HELP_TOPICS;
    return HELP_TOPICS.filter((t) => {
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
  }, [searchQuery]);

  const activeTopic = useMemo(() => {
    return (
      filteredTopics.find((t) => t.id === activeTopicId) ||
      filteredTopics[0] ||
      HELP_TOPICS[0]
    );
  }, [filteredTopics, activeTopicId]);

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
        background: "rgba(3, 7, 18, 0.75)",
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
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(9, 14, 26, 0.99) 100%)",
          border: "1px solid rgba(225, 29, 72, 0.35)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(225, 29, 72, 0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          color: "#ffffff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header du Centre d'Aide */}
        <div
          style={{
            padding: "1.2rem 1.6rem",
            background: "linear-gradient(90deg, rgba(225, 29, 72, 0.15) 0%, rgba(15, 23, 42, 0.4) 100%)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
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
                background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(225, 29, 72, 0.4)",
              }}
            >
              <HelpCircle size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Centre d&apos;Aide &amp; Documentation CARZONE Ops
                </h2>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 750,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: "rgba(225, 29, 72, 0.2)",
                    color: "#fb7185",
                    border: "1px solid rgba(225, 29, 72, 0.4)",
                  }}
                >
                  Version Officielle 2026
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#94a3b8" }}>
                Guides détaillés, règles de gestion et procédures d&apos;exploitation pour l&apos;équipe CARZONE SARL.
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
                background: "linear-gradient(135deg, rgba(225, 29, 72, 0.2) 0%, rgba(190, 18, 60, 0.25) 100%)",
                border: "1px solid rgba(225, 29, 72, 0.4)",
                color: "#fda4af",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title="Ré-ouvrir la checklist guidée de prise en main adaptée à votre rôle"
            >
              <Compass size={14} style={{ color: "#f43f5e" }} />
              <span>Relancer Premiers Pas</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              title="Fermer (Échap)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Barre de Recherche */}
        <div
          style={{
            padding: "0.75rem 1.6rem",
            background: "rgba(0, 0, 0, 0.25)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Search size={17} style={{ color: "#64748b" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une procédure, un module (Dashboard, Fiches IA, Atelier Excel, Facturation, VoIP...)"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#ffffff",
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
                color: "#94a3b8",
                fontSize: "0.75rem",
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              Effacer
            </button>
          )}
        </div>

        {/* Corps : Menu à gauche & Contenu à droite */}
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* Liste des rubriques à gauche */}
          <div
            style={{
              width: "min(320px, 35%)",
              borderRight: "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(10, 15, 29, 0.5)",
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
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "6px 10px 4px",
              }}
            >
              Rubriques &amp; Modules
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
                      ? "1px solid rgba(225, 29, 72, 0.4)"
                      : "1px solid transparent",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)"
                      : "transparent",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                      e.currentTarget.style.color = "#ffffff";
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
                      background: isActive ? "#e11d48" : "rgba(255, 255, 255, 0.07)",
                      color: "#ffffff",
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
                    <div style={{ fontSize: "0.68rem", color: "#64748b" }}>{topic.badge}</div>
                  </div>

                  {isActive && <ChevronRight size={14} style={{ color: "#fb7185", flexShrink: 0 }} />}
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
              background: "rgba(15, 23, 42, 0.4)",
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
                      background: "rgba(225, 29, 72, 0.15)",
                      color: "#fb7185",
                      border: "1px solid rgba(225, 29, 72, 0.3)",
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
                    color: "#ffffff",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {activeTopic.title}
                </h3>
                <p style={{ margin: "6px 0 1.25rem", fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.5 }}>
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
                        background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                        color: "#ffffff",
                        textDecoration: "none",
                        fontSize: "0.82rem",
                        fontWeight: 750,
                        boxShadow: "0 4px 14px rgba(225, 29, 72, 0.35)",
                      }}
                    >
                      <span>{activeTopic.linkText || "Accéder au module"}</span>
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
                        background: "rgba(30, 41, 59, 0.4)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 8px",
                          fontSize: "1.02rem",
                          fontWeight: 750,
                          color: "#ffffff",
                        }}
                      >
                        {sec.heading}
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.86rem", color: "#cbd5e1", lineHeight: 1.6 }}>
                        {sec.content}
                      </p>

                      {sec.tips && sec.tips.length > 0 && (
                        <div
                          style={{
                            marginTop: "1rem",
                            paddingTop: "0.85rem",
                            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
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
                                color: "#e2e8f0",
                                lineHeight: 1.5,
                              }}
                            >
                              <div style={{ marginTop: 2, color: "#10b981", flexShrink: 0 }}>
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
              <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                Aucun résultat ne correspond à votre recherche.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
