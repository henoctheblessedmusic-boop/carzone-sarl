"use client";

import { useState, useTransition, useMemo } from "react";
import {
  UploadCloud,
  Download,
  Plus,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Car,
  X,
  Edit2,
  Trash2,
  RefreshCw,
  Phone,
  Wrench,
} from "lucide-react";
import {
  importWorkshopExcel,
  createWorkshopEntry,
  updateWorkshopEntry,
  deleteWorkshopEntry,
} from "./actions";

export type WorkshopItem = {
  id: string;
  entryDate: string | null;
  entryTime: string | null;
  orNumber: string | null;
  immatriculation: string;
  chassis: string | null;
  brand: string | null;
  model: string | null;
  mileage: number | null;
  clientName: string;
  clientType: string | null;
  fuelLevel: string | null;
  phone: string | null;
  receptionist: string | null;
  immobilizationDuration: string | null;
  observations: string | null;
  presenceSav: string | null;
  statusCode: string;
  endWorksAt: string | null;
  executionDuration: string | null;
  worksDone: string | null;
  exitDate: string | null;
  exitTime: string | null;
  deliverer: string | null;
  paymentMode: string | null;
  createdAt: string;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; full: string; bg: string; text: string; border: string }
> = {
  L: {
    label: "L",
    full: "Livré",
    bg: "rgba(34, 197, 94, 0.15)",
    text: "#4ade80",
    border: "rgba(34, 197, 94, 0.3)",
  },
  C: {
    label: "C",
    full: "En Cours",
    bg: "rgba(59, 130, 246, 0.15)",
    text: "#60a5fa",
    border: "rgba(59, 130, 246, 0.3)",
  },
  AT: {
    label: "AT",
    full: "Attente Pièce",
    bg: "rgba(234, 179, 8, 0.15)",
    text: "#facc15",
    border: "rgba(234, 179, 8, 0.3)",
  },
  AC: {
    label: "AC",
    full: "Attente Accord Client",
    bg: "rgba(249, 115, 22, 0.15)",
    text: "#fb923c",
    border: "rgba(249, 115, 22, 0.3)",
  },
  F: {
    label: "F",
    full: "Fini (Prêt)",
    bg: "rgba(20, 184, 166, 0.15)",
    text: "#2dd4bf",
    border: "rgba(20, 184, 166, 0.3)",
  },
  D: {
    label: "D",
    full: "Diagnostic",
    bg: "rgba(168, 85, 247, 0.15)",
    text: "#c084fc",
    border: "rgba(168, 85, 247, 0.3)",
  },
  ATD: {
    label: "ATD",
    full: "Attente Décaissement",
    bg: "rgba(244, 63, 94, 0.15)",
    text: "#fb7185",
    border: "rgba(244, 63, 94, 0.3)",
  },
  AF: {
    label: "AF",
    full: "À Faire",
    bg: "rgba(148, 163, 184, 0.15)",
    text: "#cbd5e1",
    border: "rgba(148, 163, 184, 0.3)",
  },
  HSAV: {
    label: "HSAV",
    full: "Hors SAV",
    bg: "rgba(100, 116, 139, 0.15)",
    text: "#94a3b8",
    border: "rgba(100, 116, 139, 0.3)",
  },
  ANN: {
    label: "ANN",
    full: "Annulé (Fichier / Travaux annulés)",
    bg: "rgba(239, 68, 68, 0.15)",
    text: "#f87171",
    border: "rgba(239, 68, 68, 0.3)",
  },
};

export type CustomerOption = {
  id: string;
  name: string;
  phone: string;
  clientType?: string;
  immatriculation?: string;
  brand?: string;
  model?: string;
  chassis?: string;
};

function toInputDate(d?: string | null): string {
  if (!d) return "";
  const trimmed = d.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    let year = match[3];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }
  return "";
}

function toInputTime(t?: string | null): string {
  if (!t) return "";
  const trimmed = t.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }
  return "";
}

function formatDisplayDate(d?: string | null): string {
  if (!d) return "—";
  if (d.includes("-")) {
    const parts = d.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return d;
}

export function WorkshopView({
  initialEntries,
  userRole,
  customers = [],
  receptionists = [],
}: {
  initialEntries: WorkshopItem[];
  userRole: string;
  customers?: CustomerOption[];
  receptionists?: string[];
}) {
  const [entries, setEntries] = useState<WorkshopItem[]>(initialEntries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [clientTypeFilter, setClientTypeFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkshopItem | null>(null);

  // Next order number (Clé primaire séquentielle auto-générée : 1, 2, 3...)
  const nextOrderNumber = useMemo(() => {
    let max = 0;
    for (const e of entries) {
      if (e.orNumber) {
        const n = parseInt(e.orNumber.replace(/\D/g, ""), 10);
        if (!isNaN(n) && n > max && n < 100000) max = n;
      }
    }
    return max > 0 ? String(max + 1) : String(entries.length + 1);
  }, [entries]);

  // Form states for Create Modal (avec auto-remplissage quand un client est sélectionné)
  const [createCustomerSelection, setCreateCustomerSelection] = useState<string>("");
  const [createClientName, setCreateClientName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createBrand, setCreateBrand] = useState("");
  const [createModel, setCreateModel] = useState("");
  const [createImmat, setCreateImmat] = useState("");
  const [createMileage, setCreateMileage] = useState("");
  const [createChassis, setCreateChassis] = useState("");
  const [createClientType, setCreateClientType] = useState("Client");
  const [createEntryDate, setCreateEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [createEntryTime, setCreateEntryTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [createExitDate, setCreateExitDate] = useState("");
  const [createExitTime, setCreateExitTime] = useState("");
  const [createReceptionist, setCreateReceptionist] = useState(() => receptionists[0] || "Madochée");
  const [createStatusCode, setCreateStatusCode] = useState("C");
  const [createWorksDone, setCreateWorksDone] = useState("");
  const [createPaymentMode, setCreatePaymentMode] = useState("BC");

  const handleCustomerSelect = (customerId: string) => {
    setCreateCustomerSelection(customerId);
    if (customerId === "__NEW__" || !customerId) {
      return;
    }
    const found = customers.find((c) => c.id === customerId);
    if (found) {
      setCreateClientName(found.name);
      if (found.phone) setCreatePhone(found.phone);
      if (found.brand) setCreateBrand(found.brand);
      if (found.model) setCreateModel(found.model);
      if (found.immatriculation && !createImmat) setCreateImmat(found.immatriculation);
      if (found.chassis) setCreateChassis(found.chassis);
      if (found.clientType) setCreateClientType(found.clientType);
    }
  };

  const resetCreateForm = () => {
    setCreateCustomerSelection("");
    setCreateClientName("");
    setCreatePhone("");
    setCreateBrand("");
    setCreateModel("");
    setCreateImmat("");
    setCreateMileage("");
    setCreateChassis("");
    setCreateClientType("Client");
    setCreateEntryDate(new Date().toISOString().slice(0, 10));
    const d = new Date();
    setCreateEntryTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    setCreateExitDate("");
    setCreateExitTime("");
    setCreateReceptionist(receptionists[0] || "Madochée");
    setCreateStatusCode("C");
    setCreateWorksDone("");
    setCreatePaymentMode("BC");
  };

  // Import form state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = entries.length;
    const enCours = entries.filter((e) => e.statusCode === "C").length;
    const attentePiece = entries.filter((e) => e.statusCode === "AT").length;
    const attenteAccord = entries.filter((e) => e.statusCode === "AC").length;
    const livrés = entries.filter((e) => e.statusCode === "L").length;
    const diagnostics = entries.filter((e) => e.statusCode === "D").length;
    return { total, enCours, attentePiece, attenteAccord, livrés, diagnostics };
  }, [entries]);

  // Filtering
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (statusFilter !== "ALL" && entry.statusCode !== statusFilter) {
        return false;
      }
      if (clientTypeFilter !== "ALL" && (entry.clientType || "Client") !== clientTypeFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          entry.immatriculation.toLowerCase().includes(q) ||
          entry.clientName.toLowerCase().includes(q) ||
          (entry.orNumber && entry.orNumber.toLowerCase().includes(q)) ||
          (entry.brand && entry.brand.toLowerCase().includes(q)) ||
          (entry.model && entry.model.toLowerCase().includes(q)) ||
          (entry.chassis && entry.chassis.toLowerCase().includes(q)) ||
          (entry.receptionist && entry.receptionist.toLowerCase().includes(q)) ||
          (entry.phone && entry.phone.toLowerCase().includes(q)) ||
          (entry.worksDone && entry.worksDone.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [entries, search, statusFilter, clientTypeFilter]);

  // Handle Excel Upload
  const handleImportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!importFile) return;

    setImportStatus("Importation et structuration de la base de données en cours...");
    setImportError(null);

    const formData = new FormData();
    formData.append("file", importFile);

    startTransition(async () => {
      try {
        const res = await importWorkshopExcel(formData);
        setImportStatus(`Succès ! ${res.count} lignes importées depuis la feuille "${res.sheetName}".`);
        setTimeout(() => {
          setShowImportModal(false);
          setImportStatus(null);
          setImportFile(null);
          window.location.reload();
        }, 1200);
      } catch (err: unknown) {
        setImportError(err instanceof Error ? err.message : "Erreur lors de l'import");
        setImportStatus(null);
      }
    });
  };

  const handleDelete = (id: string, immat: string) => {
    if (!confirm(`Supprimer le passage du véhicule ${immat} ?`)) return;
    startTransition(async () => {
      try {
        await deleteWorkshopEntry(id);
        setEntries((prev) => prev.filter((e) => e.id !== id));
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Erreur suppression");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header & Quick Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          background: "var(--ice-card-bg, rgba(22, 27, 34, 0.6))",
          border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.08))",
          borderRadius: 16,
          padding: "20px 24px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "inline-flex",
                padding: "8px",
                borderRadius: "10px",
                background: "rgba(212, 175, 55, 0.15)",
                color: "var(--gold, #d4af37)",
              }}
            >
              <FileSpreadsheet size={24} />
            </span>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "var(--ice-text)" }}>
              Historique de passage des véhicules au SAV
            </h1>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "2px 8px",
                borderRadius: 6,
                background: "rgba(212, 175, 55, 0.15)",
                color: "var(--gold, #d4af37)",
                fontWeight: 600,
              }}
            >
              {userRole}
            </span>
          </div>
          <p style={{ margin: "6px 0 0 0", opacity: 0.75, fontSize: "0.875rem", maxWidth: 680 }}>
            Gestion centralisée de l&apos;atelier garage : téléversez directement vos anciens classeurs Excel
            programmés pour constituer et synchroniser la base de données de l&apos;entreprise.
          </p>
        </div>

        {/* Buttons Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Importer Excel */}
          <button
            onClick={() => setShowImportModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              borderRadius: 10,
              border: "1px solid rgba(34, 197, 94, 0.4)",
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(21, 128, 61, 0.3))",
              color: "#4ade80",
              fontWeight: 650,
              fontSize: "0.875rem",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(34, 197, 94, 0.15)",
            }}
          >
            <UploadCloud size={17} />
            Téléverser Fichier Excel SAV
          </button>

          {/* Exporter Excel */}
          <a
            href="/api/workshop/export"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 15px",
              borderRadius: 10,
              border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
              background: "var(--ice-card-bg, rgba(255, 255, 255, 0.05))",
              color: "var(--ice-text)",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Download size={16} />
            Exporter Excel (.xlsx)
          </a>

          {/* Modèle Excel Vierge */}
          <a
            href="/api/workshop/template"
            title="Télécharger le modèle Excel officiel préformaté"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
              background: "transparent",
              color: "var(--ice-text)",
              opacity: 0.8,
              textDecoration: "none",
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            <FileSpreadsheet size={15} />
            Gabarit
          </a>

          {/* Lien direct Magasin Pièces & Réf. Croisées */}
          <a
            href="/parts"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 14px",
              borderRadius: 10,
              border: "1px solid rgba(225, 29, 72, 0.4)",
              background: "rgba(225, 29, 72, 0.12)",
              color: "#fda4af",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <Wrench size={16} />
            Pièces & Réf. Croisées
          </a>

          {/* Nouvelle Entrée */}
          <button
            onClick={() => {
              resetCreateForm();
              setShowCreateModal(true);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              borderRadius: 10,
              border: 0,
              background: "linear-gradient(135deg, #c4a35a, #8b6914)",
              color: "#111",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(196, 163, 90, 0.3)",
            }}
          >
            <Plus size={17} />
            Nouvelle Entrée
          </button>

          
        </div>
      </div>

      {/* KPI Counters */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
        }}
      >
        <div style={kpiCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", opacity: 0.7, textTransform: "uppercase" }}>Total Passages</span>
            <Car size={16} style={{ color: "#d4af37" }} />
          </div>
          <span style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: 4 }}>{stats.total}</span>
          <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>En base de données</span>
        </div>

        <div style={kpiCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", opacity: 0.7, textTransform: "uppercase" }}>En cours [C]</span>
            <Clock size={16} style={{ color: "#60a5fa" }} />
          </div>
          <span style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: 4, color: "#60a5fa" }}>
            {stats.enCours}
          </span>
          <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>Véhicules en atelier</span>
        </div>

        <div style={kpiCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", opacity: 0.7, textTransform: "uppercase" }}>Attente Pièce [AT]</span>
            <AlertCircle size={16} style={{ color: "#facc15" }} />
          </div>
          <span style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: 4, color: "#facc15" }}>
            {stats.attentePiece}
          </span>
          <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>En commande pièces</span>
        </div>

        <div style={kpiCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", opacity: 0.7, textTransform: "uppercase" }}>Attente Accord [AC]</span>
            <AlertCircle size={16} style={{ color: "#fb923c" }} />
          </div>
          <span style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: 4, color: "#fb923c" }}>
            {stats.attenteAccord}
          </span>
          <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>Devis en attente client</span>
        </div>

        <div style={kpiCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", opacity: 0.7, textTransform: "uppercase" }}>Livrés [L]</span>
            <CheckCircle2 size={16} style={{ color: "#4ade80" }} />
          </div>
          <span style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: 4, color: "#4ade80" }}>
            {stats.livrés}
          </span>
          <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>Sorties validées</span>
        </div>
      </div>

      {/* Légende officielle interactive */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          padding: "10px 16px",
          background: "var(--ice-card-bg, rgba(22, 27, 34, 0.4))",
          border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.06))",
          borderRadius: 12,
          fontSize: "0.8rem",
        }}
      >
        <span style={{ fontWeight: 700, color: "var(--gold, #d4af37)", marginRight: 6 }}>
          LÉGENDES STATUTS :
        </span>
        {Object.entries(STATUS_CONFIG).map(([code, conf]) => (
          <button
            key={code}
            onClick={() => setStatusFilter(statusFilter === code ? "ALL" : code)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 8px",
              borderRadius: 6,
              border: statusFilter === code ? `2px solid ${conf.text}` : `1px solid ${conf.border}`,
              background: conf.bg,
              color: conf.text,
              fontSize: "0.76rem",
              fontWeight: 650,
              cursor: "pointer",
            }}
          >
            <span>{conf.label}</span>
            <span style={{ opacity: 0.85 }}>= {conf.full}</span>
          </button>
        ))}
      </div>

      {/* Barres de filtres & Recherche */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 280, maxWidth: 540 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--ice-input-bg, rgba(255, 255, 255, 0.05))",
              border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.12))",
              borderRadius: 10,
              padding: "0 12px",
              flex: 1,
            }}
          >
            <Search size={16} style={{ opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Rechercher par immat, client, châssis, N° d'ordre, marque..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 0,
                outline: "none",
                background: "transparent",
                color: "var(--ice-text)",
                padding: "9px 0",
                fontSize: "0.875rem",
                width: "100%",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ border: 0, background: "transparent", cursor: "pointer", color: "inherit", opacity: 0.5 }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Filtre Type Client */}
          <select
            value={clientTypeFilter}
            onChange={(e) => setClientTypeFilter(e.target.value)}
            style={{ ...selectStyle, width: "auto" }}
          >
            <option value="ALL" style={optionStyle}>Tous types clients</option>
            <option value="Client" style={optionStyle}>Clients</option>
            <option value="Interne" style={optionStyle}>Interne</option>
          </select>

          {/* Filtre Statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...selectStyle, width: "auto" }}
          >
            <option value="ALL" style={optionStyle}>Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k} style={optionStyle}>
                {v.label} — {v.full}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau interactif principal */}
      <div
        style={{
          overflowX: "auto",
          background: "var(--ice-card-bg, rgba(22, 27, 34, 0.5))",
          border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.08))",
          borderRadius: 14,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
          <thead>
            <tr
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                borderBottom: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
                color: "var(--ice-text)",
                opacity: 0.9,
                fontWeight: 650,
                whiteSpace: "nowrap",
              }}
            >
              <th style={thStyle}>Date & Heure</th>
              <th style={thStyle}>N° d&apos;Ordre</th>
              <th style={thStyle}>Immatriculation</th>
              <th style={thStyle}>Marque / Modèle</th>
              <th style={thStyle}>Châssis (VIN)</th>
              <th style={thStyle}>Kilométrage</th>
              <th style={thStyle}>Client</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Téléphone</th>
              <th style={thStyle}>Réceptionnaire</th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}>Travaux Effectués</th>
              <th style={thStyle}>Fin Travaux</th>
              <th style={thStyle}>Sortie (Date & H)</th>
              <th style={thStyle}>Livreur</th>
              <th style={thStyle}>Règlement</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={17} style={{ textAlign: "center", padding: "40px 20px", opacity: 0.6 }}>
                  Aucun passage de véhicule ne correspond aux critères.
                </td>
              </tr>
            ) : (
              filteredEntries.map((row) => {
                const conf = STATUS_CONFIG[row.statusCode] || {
                  label: row.statusCode,
                  full: row.statusCode,
                  bg: "rgba(255, 255, 255, 0.1)",
                  text: "inherit",
                  border: "transparent",
                };

                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{formatDisplayDate(row.entryDate)}</div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>{row.entryTime || ""}</div>
                    </td>
                    <td style={tdStyle}>
                      {row.orNumber ? (
                        <span
                          style={{
                            padding: "2px 7px",
                            borderRadius: 4,
                            background: "rgba(212, 175, 55, 0.12)",
                            color: "var(--gold, #d4af37)",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            border: "1px solid rgba(212, 175, 55, 0.25)",
                          }}
                        >
                          #{row.orNumber}
                        </span>
                      ) : (
                        <span style={{ opacity: 0.4 }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontWeight: 750,
                          letterSpacing: "0.5px",
                          color: "var(--ice-text)",
                        }}
                      >
                        {row.immatriculation}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{row.brand || "—"}</div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{row.model || ""}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.75rem", opacity: 0.8 }}>
                        {row.chassis || "—"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {row.mileage !== null && row.mileage !== undefined ? (
                        <span>{row.mileage.toLocaleString()} km</span>
                      ) : (
                        <span style={{ opacity: 0.4 }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 650, color: "var(--ice-text)" }}>{row.clientName}</div>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: "0.73rem",
                          background: row.clientType === "Interne" ? "rgba(99, 102, 241, 0.15)" : "rgba(255, 255, 255, 0.05)",
                          color: row.clientType === "Interne" ? "#818cf8" : "inherit",
                        }}
                      >
                        {row.clientType || "Client"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {row.phone ? (
                        <a
                          href={`tel:${row.phone}`}
                          style={{
                            color: "inherit",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Phone size={12} style={{ opacity: 0.5 }} />
                          {row.phone}
                        </a>
                      ) : (
                        <span style={{ opacity: 0.4 }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>{row.receptionist || "—"}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: conf.bg,
                          color: conf.text,
                          border: `1px solid ${conf.border}`,
                          fontWeight: 700,
                          fontSize: "0.76rem",
                        }}
                        title={conf.full}
                      >
                        {conf.label} ({conf.full})
                      </span>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 220 }}>
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={row.worksDone || ""}
                      >
                        {row.worksDone || "—"}
                      </div>
                    </td>
                    <td style={tdStyle}>{row.endWorksAt || "—"}</td>
                    <td style={tdStyle}>
                      <div>{row.exitDate || "—"}</div>
                      {row.exitTime && <div style={{ fontSize: "0.72rem", opacity: 0.6 }}>{row.exitTime}</div>}
                    </td>
                    <td style={tdStyle}>{row.deliverer || "—"}</td>
                    <td style={tdStyle}>
                      {row.paymentMode ? (
                        <span
                          style={{
                            padding: "2px 7px",
                            borderRadius: 4,
                            background:
                              row.paymentMode.toLowerCase().includes("bc")
                                ? "rgba(234, 179, 8, 0.15)"
                                : row.paymentMode.toLowerCase().includes("money")
                                ? "rgba(34, 197, 94, 0.15)"
                                : "rgba(255, 255, 255, 0.08)",
                            color:
                              row.paymentMode.toLowerCase().includes("bc")
                                ? "#facc15"
                                : row.paymentMode.toLowerCase().includes("money")
                                ? "#4ade80"
                                : "inherit",
                            fontSize: "0.75rem",
                            fontWeight: 650,
                          }}
                        >
                          {row.paymentMode}
                        </span>
                      ) : (
                        <span style={{ opacity: 0.4 }}>—</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => setEditingItem(row)}
                        title="Modifier cette entrée"
                        style={{
                          border: 0,
                          background: "transparent",
                          cursor: "pointer",
                          color: "var(--ice-text)",
                          opacity: 0.7,
                          padding: "4px 6px",
                        }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id, row.immatriculation)}
                        title="Supprimer"
                        style={{
                          border: 0,
                          background: "transparent",
                          cursor: "pointer",
                          color: "#f87171",
                          opacity: 0.8,
                          padding: "4px 6px",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Téléversement / Import Excel */}
      {showImportModal && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    background: "rgba(34, 197, 94, 0.15)",
                    color: "#4ade80",
                  }}
                >
                  <UploadCloud size={20} />
                </span>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                  Importer Fichier Excel d&apos;Atelier SAV
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                style={{ border: 0, background: "transparent", cursor: "pointer", color: "inherit", opacity: 0.6 }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", opacity: 0.8, lineHeight: 1.5, margin: "0 0 16px 0" }}>
              Sélectionnez votre classeur Excel (.xlsx, .xls ou .csv) contenant l&apos;historique de passage des
              véhicules. L&apos;application analyse automatiquement toutes les colonnes officielles (N° OR,
              Immatriculation, Châssis, Client, Statut L/C/AT/AC..., Travaux, Date de sortie, Mode de règlement)
              pour construire et alimenter la base de données.
            </p>

            <form onSubmit={handleImportSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  border: "2px dashed var(--ice-border, rgba(255, 255, 255, 0.2))",
                  borderRadius: 12,
                  padding: "30px 20px",
                  textAlign: "center",
                  background: "rgba(255, 255, 255, 0.02)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="file"
                  id="excelFileInput"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  style={{ display: "none" }}
                />
                <label htmlFor="excelFileInput" style={{ cursor: "pointer", display: "block" }}>
                  <FileSpreadsheet size={36} style={{ color: "#4ade80", marginBottom: 10 }} />
                  <div style={{ fontWeight: 650, fontSize: "0.95rem" }}>
                    {importFile ? importFile.name : "Cliquez pour choisir votre fichier Excel SAV"}
                  </div>
                  <div style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: 4 }}>
                    Formats acceptés : .xlsx, .xls, .csv (Taille max 15 Mo)
                  </div>
                </label>
              </div>

              {importStatus && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "#60a5fa",
                    fontSize: "0.85rem",
                  }}
                >
                  {importStatus}
                </div>
              )}

              {importError && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#f87171",
                    fontSize: "0.85rem",
                  }}
                >
                  {importError}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  style={btnSecondary}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!importFile || isPending}
                  style={{
                    ...btnPrimary,
                    opacity: !importFile || isPending ? 0.6 : 1,
                  }}
                >
                  {isPending ? "Traitement en cours..." : "Lancer l'importation & créer la base"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Nouvelle Entrée Manuelle */}
      {showCreateModal && (
        <div style={modalBackdrop}>
          <div style={{ ...modalBox, maxWidth: 680 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                  Enregistrer un passage de véhicule au SAV
                </h3>
                <span style={{ fontSize: "0.78rem", color: "var(--gold)", fontWeight: 600 }}>
                  N° d&apos;Ordre #{nextOrderNumber} • Clé primaire auto-assignée
                </span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ border: 0, background: "transparent", cursor: "pointer", color: "inherit", opacity: 0.6 }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              action={async (formData) => {
                startTransition(async () => {
                  try {
                    await createWorkshopEntry(formData);
                    setShowCreateModal(false);
                    window.location.reload();
                  } catch (err: unknown) {
                    alert(err instanceof Error ? err.message : "Erreur création");
                  }
                });
              }}
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              <input type="hidden" name="clientType" value={createClientType} />
              <input
                type="hidden"
                name="customerId"
                value={createCustomerSelection && createCustomerSelection !== "__NEW__" ? createCustomerSelection : ""}
              />
              <input type="hidden" name="chassis" value={createChassis} />
              <input type="hidden" name="orNumber" value={nextOrderNumber} />

              {/* Sélection Client en base ou Nouveau client */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.09)",
                  borderRadius: 10,
                  padding: "10px 14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ ...labelStyle, marginBottom: 0, fontWeight: 700, color: "var(--gold)" }}>
                    👤 Sélection du Client (Base de données ou Nouveau)
                  </label>
                  {createCustomerSelection && createCustomerSelection !== "__NEW__" && (
                    <span style={{ fontSize: "0.72rem", color: "#4ade80", fontWeight: 600 }}>
                      ✓ Données client auto-remplies
                    </span>
                  )}
                </div>
                <select
                  value={createCustomerSelection}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  style={{ ...selectStyle, fontWeight: 550 }}
                >
                  <option value="" style={{ ...optionStyle, color: "#94a3b8" }}>
                    -- Choisir un client existant ({customers.length} en base) ou saisir nouveau --
                  </option>
                  <option value="__NEW__" style={{ ...optionStyle, color: "#60a5fa", fontWeight: 700 }}>
                    ➕ Nouveau client (Saisir manuellement)
                  </option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} style={optionStyle}>
                      {c.name} {c.phone ? `— Tél: ${c.phone}` : ""} {c.brand ? `[${c.brand} ${c.model || ""}]` : ""}
                    </option>
                  ))}
                </select>
                {createCustomerSelection && createCustomerSelection !== "__NEW__" && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#86efac",
                      marginTop: 6,
                      background: "rgba(34, 197, 94, 0.1)",
                      padding: "5px 10px",
                      borderRadius: 6,
                    }}
                  >
                    ⚡ Téléphone ({createPhone || "—"}) et véhicule ({createBrand || "—"} {createModel || ""}) renseignés automatiquement.
                  </div>
                )}
              </div>

              {/* Immatriculation et Nom du Client */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Immatriculation *</label>
                  <input
                    name="immatriculation"
                    value={createImmat}
                    onChange={(e) => setCreateImmat(e.target.value.toUpperCase())}
                    placeholder="ex: CJ 0290 RB"
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nom du Client *</label>
                  <input
                    name="clientName"
                    value={createClientName}
                    onChange={(e) => setCreateClientName(e.target.value)}
                    placeholder="ex: Palais Présidentiel"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Marque, Modèle, Kilométrage */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Marque</label>
                  <input
                    name="brand"
                    value={createBrand}
                    onChange={(e) => setCreateBrand(e.target.value)}
                    placeholder="ex: MITSUBISHI"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Modèle</label>
                  <input
                    name="model"
                    value={createModel}
                    onChange={(e) => setCreateModel(e.target.value)}
                    placeholder="ex: OUTLANDER"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Kilométrage (Km)</label>
                  <input
                    name="mileage"
                    type="number"
                    value={createMileage}
                    onChange={(e) => setCreateMileage(e.target.value)}
                    placeholder="ex: 37445"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* N° d'Ordre (Clé primaire auto), Date d'entrée (Calendrier), Heure d'entrée (Sélecteur d'heure) */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>
                    N° d&apos;Ordre <span style={{ fontSize: "0.7rem", color: "var(--gold)" }}>(Clé primaire)</span>
                  </label>
                  <div
                    style={{
                      ...inputStyle,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(255, 255, 255, 0.04)",
                      borderColor: "rgba(212, 175, 55, 0.35)",
                      cursor: "not-allowed",
                      userSelect: "none",
                    }}
                    title="Numéro d'ordre / clé primaire incrémenté automatiquement (Non modifiable)"
                  >
                    <span style={{ fontWeight: 800, color: "var(--gold)", fontSize: "0.95rem" }}>
                      #{nextOrderNumber}
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "rgba(212, 175, 55, 0.15)",
                        color: "var(--gold)",
                        fontWeight: 600,
                      }}
                    >
                      🔒 Auto
                    </span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Date d&apos;entrée *</label>
                  <input
                    type="date"
                    name="entryDate"
                    value={createEntryDate}
                    onChange={(e) => setCreateEntryDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    required
                    style={{
                      ...inputStyle,
                      colorScheme: "dark",
                      cursor: "pointer",
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heure d&apos;entrée *</label>
                  <input
                    type="time"
                    name="entryTime"
                    value={createEntryTime}
                    onChange={(e) => setCreateEntryTime(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    required
                    style={{
                      ...inputStyle,
                      colorScheme: "dark",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>

              {/* Téléphone Client, Réceptionnaire (Sélectionné, pas taper), Statut */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Téléphone Client</label>
                  <input
                    name="phone"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="ex: 0167434244"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Réceptionnaire *</label>
                  <select
                    name="receptionist"
                    value={createReceptionist}
                    onChange={(e) => setCreateReceptionist(e.target.value)}
                    required
                    style={selectStyle}
                  >
                    <option value="" style={optionStyle}>-- Sélectionner le réceptionnaire --</option>
                    {receptionists.map((r) => (
                      <option key={r} value={r} style={optionStyle}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Statut (Code Légende) *</label>
                  <select
                    name="statusCode"
                    value={createStatusCode}
                    onChange={(e) => setCreateStatusCode(e.target.value)}
                    style={selectStyle}
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k} style={optionStyle}>
                        {v.label} — {v.full}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Travaux Effectués / Diagnostic</label>
                <textarea
                  name="worksDone"
                  rows={2}
                  value={createWorksDone}
                  onChange={(e) => setCreateWorksDone(e.target.value)}
                  placeholder="ex: Exécution de deux proformas, révision des 20 000 km..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {/* Date de sortie (Calendrier), Heure de sortie (Heure), Mode de Règlement */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Date de sortie</label>
                  <input
                    type="date"
                    name="exitDate"
                    value={createExitDate}
                    onChange={(e) => setCreateExitDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    style={{
                      ...inputStyle,
                      colorScheme: "dark",
                      cursor: "pointer",
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heure de sortie</label>
                  <input
                    type="time"
                    name="exitTime"
                    value={createExitTime}
                    onChange={(e) => setCreateExitTime(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    style={{
                      ...inputStyle,
                      colorScheme: "dark",
                      cursor: "pointer",
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Mode de Règlement</label>
                  <select
                    name="paymentMode"
                    value={createPaymentMode}
                    onChange={(e) => setCreatePaymentMode(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="BC" style={optionStyle}>BC (Bon de commande)</option>
                    <option value="Mobile Money" style={optionStyle}>Mobile Money</option>
                    <option value="En espèces" style={optionStyle}>En espèces</option>
                    <option value="Proforma" style={optionStyle}>Proforma</option>
                    <option value="Interne" style={optionStyle}>Interne</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={btnSecondary}>
                  Annuler
                </button>
                <button type="submit" disabled={isPending} style={btnPrimary}>
                  {isPending ? "Enregistrement..." : "Valider l'entrée"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Modification / Édition d'Entrée */}
      {editingItem && (
        <div style={modalBackdrop}>
          <div style={{ ...modalBox, maxWidth: 680 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                  Modifier le passage : {editingItem.immatriculation}
                </h3>
                <span style={{ fontSize: "0.78rem", color: "var(--gold)", fontWeight: 600 }}>
                  N° d&apos;Ordre #{editingItem.orNumber || "—"} (Clé primaire)
                </span>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                style={{ border: 0, background: "transparent", cursor: "pointer", color: "inherit", opacity: 0.6 }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              action={async (formData) => {
                startTransition(async () => {
                  try {
                    await updateWorkshopEntry(formData);
                    setEditingItem(null);
                    window.location.reload();
                  } catch (err: unknown) {
                    alert(err instanceof Error ? err.message : "Erreur mise à jour");
                  }
                });
              }}
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              <input type="hidden" name="id" value={editingItem.id} />
              <input type="hidden" name="orNumber" value={editingItem.orNumber || ""} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Immatriculation *</label>
                  <input
                    name="immatriculation"
                    defaultValue={editingItem.immatriculation}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Client *</label>
                  <input
                    name="clientName"
                    defaultValue={editingItem.clientName}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Marque</label>
                  <input name="brand" defaultValue={editingItem.brand || ""} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Modèle</label>
                  <input name="model" defaultValue={editingItem.model || ""} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Kilométrage</label>
                  <input
                    name="mileage"
                    type="number"
                    defaultValue={editingItem.mileage ?? ""}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>
                    N° d&apos;Ordre <span style={{ fontSize: "0.7rem", color: "var(--gold)" }}>(Clé primaire)</span>
                  </label>
                  <div
                    style={{
                      ...inputStyle,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(255, 255, 255, 0.04)",
                      borderColor: "rgba(212, 175, 55, 0.35)",
                      cursor: "not-allowed",
                    }}
                  >
                    <span style={{ fontWeight: 800, color: "var(--gold)" }}>
                      #{editingItem.orNumber || "—"}
                    </span>
                    <span style={{ fontSize: "0.68rem", opacity: 0.6 }}>Non modifiable</span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Date d&apos;entrée</label>
                  <input
                    type="date"
                    name="entryDate"
                    defaultValue={toInputDate(editingItem.entryDate)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    style={{ ...inputStyle, colorScheme: "dark", cursor: "pointer" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heure d&apos;entrée</label>
                  <input
                    type="time"
                    name="entryTime"
                    defaultValue={toInputTime(editingItem.entryTime)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    style={{ ...inputStyle, colorScheme: "dark", cursor: "pointer" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Téléphone</label>
                  <input name="phone" defaultValue={editingItem.phone || ""} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Réceptionnaire</label>
                  <select
                    name="receptionist"
                    defaultValue={editingItem.receptionist || ""}
                    style={selectStyle}
                  >
                    <option value="" style={optionStyle}>-- Sélectionner le réceptionnaire --</option>
                    {receptionists.map((r) => (
                      <option key={r} value={r} style={optionStyle}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Statut (Niv Exéc) *</label>
                  <select name="statusCode" defaultValue={editingItem.statusCode} style={selectStyle}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k} style={optionStyle}>
                        {v.label} — {v.full}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Travaux effectués</label>
                <textarea
                  name="worksDone"
                  rows={2}
                  defaultValue={editingItem.worksDone || ""}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Date et H fin des travaux</label>
                  <input
                    name="endWorksAt"
                    defaultValue={editingItem.endWorksAt || ""}
                    placeholder="ex: 16/07/2026 17:00:00"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Durée d&apos;exécution</label>
                  <input
                    name="executionDuration"
                    defaultValue={editingItem.executionDuration || ""}
                    placeholder="ex: 6 jours"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Date de sortie Véh</label>
                  <input
                    type="date"
                    name="exitDate"
                    defaultValue={toInputDate(editingItem.exitDate)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    style={{ ...inputStyle, colorScheme: "dark", cursor: "pointer" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Heure de sortie</label>
                  <input
                    type="time"
                    name="exitTime"
                    defaultValue={toInputTime(editingItem.exitTime)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    style={{ ...inputStyle, colorScheme: "dark", cursor: "pointer" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Mode de Règlement</label>
                  <select name="paymentMode" defaultValue={editingItem.paymentMode || "BC"} style={selectStyle}>
                    <option value="BC" style={optionStyle}>BC (Bon de commande)</option>
                    <option value="Mobile Money" style={optionStyle}>Mobile Money</option>
                    <option value="En espèces" style={optionStyle}>En espèces</option>
                    <option value="Proforma" style={optionStyle}>Proforma</option>
                    <option value="Interne" style={optionStyle}>Interne</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setEditingItem(null)} style={btnSecondary}>
                  Annuler
                </button>
                <button type="submit" disabled={isPending} style={btnPrimary}>
                  {isPending ? "Mise à jour..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "11px 14px",
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  verticalAlign: "middle",
};

const kpiCardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  padding: "14px 18px",
  borderRadius: 14,
  background: "var(--ice-card-bg, rgba(22, 27, 34, 0.6))",
  border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.08))",
};

const modalBackdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.75)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: 16,
};

const modalBox: React.CSSProperties = {
  background: "var(--ice-card-bg, #161b22)",
  border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
  borderRadius: 16,
  padding: 24,
  width: "100%",
  maxWidth: 540,
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
  color: "var(--ice-text)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 600,
  marginBottom: 4,
  opacity: 0.85,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
  background: "#161b22",
  color: "#ffffff",
  colorScheme: "dark",
  fontSize: "0.85rem",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  background: "#161b22",
  color: "#ffffff",
  colorScheme: "dark",
  fontSize: "0.85rem",
  boxSizing: "border-box",
  cursor: "pointer",
};

const optionStyle: React.CSSProperties = {
  backgroundColor: "#161b22",
  color: "#ffffff",
  padding: "8px 12px",
};

const btnPrimary: React.CSSProperties = {
  padding: "9px 18px",
  borderRadius: 8,
  border: 0,
  background: "linear-gradient(135deg, #c4a35a, #8b6914)",
  color: "#111",
  fontWeight: 700,
  fontSize: "0.875rem",
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 8,
  border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
  background: "transparent",
  color: "var(--ice-text)",
  fontSize: "0.875rem",
  cursor: "pointer",
};
