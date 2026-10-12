"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Download,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Receipt,
  Zap,
  X,
  FolderCheck,
  Upload,
  Check,
  Paperclip,
  FileCheck2,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  createCustomer,
  updateCustomer,
  toggleCustomerActive,
  deleteCustomer,
  uploadCustomerDocument,
  deleteCustomerDocument,
  updateCustomerDocumentStatus,
} from "./actions";

export type CustomerDocumentItem = {
  id: string;
  customerId: string;
  title: string;
  docType: string;
  fileName: string;
  fileSize: number | null;
  fileUrl: string;
  mimeType: string | null;
  status: string;
  notes: string | null;
  uploadedAt: string | Date;
};

export type CustomerItem = {
  id: string;
  contactName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  address?: string | null;
  ifu?: string | null;
  showroomNotes?: string | null;
  category: string | null;
  active: boolean;
  notes: string | null;
  createdAt: string | Date;
  documents?: CustomerDocumentItem[];
  _count: {
    quotes: number;
    invoices: number;
    rentals: number;
    installRequests: number;
    subscriptions: number;
  };
};

export function ClientsView({
  initialCustomers,
  canManage,
}: {
  initialCustomers: CustomerItem[];
  canManage: boolean;
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const [isPending, startTransition] = useTransition();

  // Documents & Immatriculation (KYC ANaTT) modal states
  const [selectedDocCustomer, setSelectedDocCustomer] = useState<CustomerItem | null>(null);
  const [docType, setDocType] = useState("CIP_CNI");
  const [docTitle, setDocTitle] = useState("");
  const [docNotes, setDocNotes] = useState("");
  const [docFileUrl, setDocFileUrl] = useState<string>("");
  const [docFileName, setDocFileName] = useState("");
  const [docFileSize, setDocFileSize] = useState(0);
  const [docMimeType, setDocMimeType] = useState("");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [immatriculationSuccessMsg, setImmatriculationSuccessMsg] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setDocFileUrl(result);
      setDocFileName(file.name);
      setDocFileSize(file.size);
      setDocMimeType(file.type);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleUploadDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDocCustomer || !docFileUrl) return;
    setIsUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append("customerId", selectedDocCustomer.id);
      fd.append("title", docTitle || docFileName || "Document Client");
      fd.append("docType", docType);
      fd.append("fileName", docFileName);
      fd.append("fileSize", String(docFileSize));
      fd.append("fileUrl", docFileUrl);
      fd.append("mimeType", docMimeType);
      if (docNotes) fd.append("notes", docNotes);

      const uploaded = await uploadCustomerDocument(fd);

      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === selectedDocCustomer.id) {
            const docs = c.documents ? [uploaded, ...c.documents] : [uploaded];
            return { ...c, documents: docs };
          }
          return c;
        })
      );
      setSelectedDocCustomer((prev) =>
        prev
          ? {
              ...prev,
              documents: prev.documents ? [uploaded, ...prev.documents] : [uploaded],
            }
          : null
      );
      setDocTitle("");
      setDocNotes("");
      setDocFileUrl("");
      setDocFileName("");
      setDocFileSize(0);
    } finally {
      setIsUploadingDoc(false);
    }
  }

  async function handleDeleteDoc(docId: string) {
    if (!selectedDocCustomer) return;
    if (!window.confirm("Supprimer ce document ?")) return;
    setIsUploadingDoc(true);
    try {
      await deleteCustomerDocument(docId, selectedDocCustomer.id);
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === selectedDocCustomer.id) {
            return {
              ...c,
              documents: (c.documents || []).filter((d) => d.id !== docId),
            };
          }
          return c;
        })
      );
      setSelectedDocCustomer((prev) =>
        prev
          ? {
              ...prev,
              documents: (prev.documents || []).filter((d) => d.id !== docId),
            }
          : null
      );
    } finally {
      setIsUploadingDoc(false);
    }
  }

  async function handleTransmitImmatriculation() {
    if (!selectedDocCustomer || !selectedDocCustomer.documents || selectedDocCustomer.documents.length === 0) {
      alert("Veuillez d'abord téléverser au moins un document pour ce client (CIP, IFU...)");
      return;
    }
    setIsUploadingDoc(true);
    try {
      for (const d of selectedDocCustomer.documents) {
        await updateCustomerDocumentStatus(d.id, selectedDocCustomer.id, "TRANSMIS_ANATT");
      }
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === selectedDocCustomer.id) {
            return {
              ...c,
              documents: (c.documents || []).map((d) => ({ ...d, status: "TRANSMIS_ANATT" })),
            };
          }
          return c;
        })
      );
      setSelectedDocCustomer((prev) =>
        prev
          ? {
              ...prev,
              documents: (prev.documents || []).map((d) => ({ ...d, status: "TRANSMIS_ANATT" })),
            }
          : null
      );
      setImmatriculationSuccessMsg("Dossier client et documents KYC transmis avec succès au service Immatriculation (ANaTT) !");
    } finally {
      setIsUploadingDoc(false);
    }
  }

  const totalCount = customers.length;
  const activeCount = customers.filter((c) => c.active).length;
  const companyCount = customers.filter(
    (c) => c.category === "Entreprise" || !!c.companyName
  ).length;
  const individualCount = totalCount - companyCount;

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      c.contactName.toLowerCase().includes(term) ||
      (c.companyName && c.companyName.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.city && c.city.toLowerCase().includes(term)) ||
      (c.ifu && c.ifu.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term)) ||
      (c.showroomNotes && c.showroomNotes.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && c.active) ||
      (statusFilter === "INACTIVE" && !c.active);

    const matchesCategory =
      categoryFilter === "ALL" ||
      (categoryFilter === "Entreprise" && (c.category === "Entreprise" || c.companyName)) ||
      (categoryFilter === "Particulier" && c.category === "Particulier" && !c.companyName) ||
      c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  function exportCsv() {
    const headers = [
      "ID",
      "Contact",
      "Entreprise",
      "N° IFU",
      "Email",
      "Téléphone",
      "Adresse",
      "Ville",
      "Catégorie",
      "Notes Showroom",
      "Documents",
      "Statut",
      "Devis",
      "Factures",
      "Date Création",
    ];
    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${c.contactName.replace(/"/g, '""')}"`,
      `"${(c.companyName || "").replace(/"/g, '""')}"`,
      `"${(c.ifu || "").replace(/"/g, '""')}"`,
      c.email || "",
      c.phone || "",
      `"${(c.address || "").replace(/"/g, '""')}"`,
      `"${(c.city || "").replace(/"/g, '""')}"`,
      `"${(c.category || "").replace(/"/g, '""')}"`,
      `"${(c.showroomNotes || "").replace(/"/g, '""')}"`,
      c.documents?.length || 0,
      c.active ? "Actif" : "Inactif",
      c._count.quotes,
      c._count.invoices,
      formatDate(c.createdAt),
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clients-carzone-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleToggleActive(customer: CustomerItem) {
    const newStatus = !customer.active;
    startTransition(async () => {
      await toggleCustomerActive(customer.id, newStatus);
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, active: newStatus } : c))
      );
    });
  }

  function handleDelete(customer: CustomerItem) {
    const hasHistory =
      customer._count.quotes > 0 || customer._count.invoices > 0 || customer._count.rentals > 0;
    const msg = hasHistory
      ? `Ce client possède des devis ou factures liés. Il sera désactivé pour préserver l'historique comptable. Confirmer ?`
      : `Voulez-vous vraiment supprimer définitivement le client "${customer.contactName}" ?`;

    if (!window.confirm(msg)) return;

    startTransition(async () => {
      await deleteCustomer(customer.id);
      if (hasHistory) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? { ...c, active: false } : c))
        );
      } else {
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: 14,
        }}
      >
        <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--ice-text-muted)", fontWeight: 550 }}>
              Total Clients
            </span>
            <User size={18} style={{ color: "var(--brand)" }} />
          </div>
          <div className="ox-metric-val" style={{ fontSize: "1.85rem", marginTop: 4 }}>{totalCount}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", marginTop: 2 }}>
            Base active CARZONE Motors
          </div>
        </div>

        <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.7, fontWeight: 550 }}>
              Clients Actifs
            </span>
            <CheckCircle2 size={18} style={{ color: "var(--ok)" }} />
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 750, marginTop: 4, color: "var(--ok)" }}>
            {activeCount}
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.65, marginTop: 2 }}>
            {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}% du portefeuille
          </div>
        </div>

        <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.7, fontWeight: 550 }}>
              Entreprises & Flottes
            </span>
            <Building2 size={18} style={{ color: "var(--gold)" }} />
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 750, marginTop: 4, color: "var(--gold)" }}>
            {companyCount}
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.65, marginTop: 2 }}>
            Comptes professionnels
          </div>
        </div>

        <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.7, fontWeight: 550 }}>
              Particuliers
            </span>
            <User size={18} style={{ opacity: 0.7 }} />
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 750, marginTop: 4 }}>
            {individualCount}
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.65, marginTop: 2 }}>
            Acheteurs individuels
          </div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div
        className="ox-glass"
        style={{
          padding: "1rem 1.25rem",
          borderRadius: 16,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, flex: 1, minWidth: 280 }}>
          {/* Search Bar */}
          <div style={{ position: "relative", minWidth: 240, flex: "1 1 240px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.5,
              }}
            />
            <input
              type="text"
              placeholder="Rechercher par nom, société, email, tél..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ox-input"
              style={{ width: "100%", paddingLeft: 36, height: 38 }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  opacity: 0.6,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
            className="ox-select"
            style={{ height: 38, fontSize: "0.88rem" }}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs uniquement</option>
            <option value="INACTIVE">Inactifs</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="ox-select"
            style={{ height: 38, fontSize: "0.88rem" }}
          >
            <option value="ALL">Toutes catégories</option>
            <option value="Entreprise">Entreprises</option>
            <option value="Particulier">Particuliers</option>
            <option value="ONG / Diplomate">ONG / Diplomates</option>
            <option value="Flotte">Flottes</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={exportCsv}
            className="ox-btn ox-btn-ghost"
            style={{ height: 38, padding: "0 0.9rem", fontSize: "0.88rem" }}
            title="Exporter la liste au format CSV"
          >
            <Download size={15} style={{ marginRight: 6 }} />
            Exporter CSV
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="ox-btn"
              style={{ height: 38, padding: "0 1.1rem", fontSize: "0.88rem" }}
            >
              <Plus size={16} style={{ marginRight: 6 }} />
              Nouveau client
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="ox-table-wrap">
        <table className="ox-table">
          <thead>
            <tr>
              <th style={{ width: 45 }}>N°</th>
              <th>Contact principal</th>
              <th>Entreprise</th>
              <th>Coordonnées</th>
              <th>Localisation</th>
              <th>Catégorie</th>
              <th>Activité liée</th>
              <th>Statut</th>
              <th style={{ textAlign: "right", paddingRight: "1.2rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "2.5rem 1rem", opacity: 0.6 }}>
                  Aucun client trouvé pour ces critères de recherche.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer, index) => {
                const initials = customer.contactName
                  .split(" ")
                  .filter(Boolean)
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr key={customer.id}>
                    <td style={{ opacity: 0.5, fontSize: "0.82rem" }}>{index + 1}</td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--brand), var(--brand-deep))",
                            color: "#fff",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            letterSpacing: "0.5px",
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <Link
                            href={`/clients/${customer.id}`}
                            style={{
                              fontWeight: 650,
                              color: "var(--ice-text)",
                              textDecoration: "none",
                            }}
                          >
                            {customer.contactName}
                          </Link>
                          {customer.ifu ? (
                            <div style={{ fontSize: "0.75rem", color: "var(--ice-highlight)", fontWeight: 600 }}>
                              IFU : {customer.ifu}
                            </div>
                          ) : (
                            <div style={{ fontSize: "0.7rem", color: "#f59e0b", opacity: 0.85 }}>
                              ⚠️ Sans IFU
                            </div>
                          )}
                          <div style={{ fontSize: "0.74rem", opacity: 0.55, marginTop: 1 }}>
                            Ajouté le {formatDate(customer.createdAt)}
                          </div>
                          {customer.showroomNotes && (
                            <div
                              title={customer.showroomNotes}
                              style={{
                                fontSize: "0.7rem",
                                background: "rgba(212, 175, 55, 0.15)",
                                color: "var(--gold)",
                                padding: "1px 6px",
                                borderRadius: 4,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                                marginTop: 3,
                                border: "1px solid rgba(212, 175, 55, 0.25)",
                              }}
                            >
                              🏷️ Visite Showroom
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      {customer.companyName ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 550 }}>
                          <Building2 size={14} style={{ opacity: 0.6, color: "var(--gold)" }} />
                          <span>{customer.companyName}</span>
                        </div>
                      ) : (
                        <span style={{ opacity: 0.4 }}>—</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "0.82rem" }}>
                        {customer.email ? (
                          <a
                            href={`mailto:${customer.email}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              color: "var(--ice-text)",
                              textDecoration: "none",
                              opacity: 0.85,
                            }}
                          >
                            <Mail size={12} style={{ opacity: 0.6 }} />
                            <span>{customer.email}</span>
                          </a>
                        ) : null}
                        {customer.phone ? (
                          <a
                            href={`tel:${customer.phone}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              color: "var(--ice-text)",
                              textDecoration: "none",
                              opacity: 0.85,
                            }}
                          >
                            <Phone size={12} style={{ opacity: 0.6 }} />
                            <span>{customer.phone}</span>
                          </a>
                        ) : null}
                        {!customer.email && !customer.phone && <span style={{ opacity: 0.4 }}>—</span>}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.85rem" }}>
                        <MapPin size={13} style={{ opacity: 0.6 }} />
                        <span>{customer.city || "Cotonou"}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className="ox-badge"
                        style={{
                          background:
                            customer.category === "Entreprise"
                              ? "rgba(196, 163, 90, 0.15)"
                              : "rgba(126, 200, 227, 0.12)",
                          color:
                            customer.category === "Entreprise"
                              ? "var(--gold)"
                              : "var(--ice-highlight)",
                          borderColor:
                            customer.category === "Entreprise"
                              ? "rgba(196, 163, 90, 0.3)"
                              : "rgba(126, 200, 227, 0.25)",
                        }}
                      >
                        {customer.category || (customer.companyName ? "Entreprise" : "Particulier")}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem" }}>
                        {customer._count.quotes > 0 && (
                          <span
                            title={`${customer._count.quotes} devis/proformas`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 3, opacity: 0.85 }}
                          >
                            <FileText size={12} style={{ color: "var(--ice-highlight)" }} />
                            {customer._count.quotes}
                          </span>
                        )}
                        {customer._count.invoices > 0 && (
                          <span
                            title={`${customer._count.invoices} factures`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 3, opacity: 0.85 }}
                          >
                            <Receipt size={12} style={{ color: "var(--brand)" }} />
                            {customer._count.invoices}
                          </span>
                        )}
                        {customer._count.subscriptions > 0 && (
                          <span
                            title={`${customer._count.subscriptions} abonnement(s) borne`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--ok)" }}
                          >
                            <Zap size={12} />
                            {customer._count.subscriptions}
                          </span>
                        )}
                        {customer._count.quotes === 0 &&
                          customer._count.invoices === 0 &&
                          customer._count.subscriptions === 0 && (
                            <span style={{ opacity: 0.4 }}>Nouveau</span>
                          )}
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(customer)}
                        disabled={isPending || !canManage}
                        className={`ox-badge ox-badge--${customer.active ? "ok" : "bad"}`}
                        style={{ cursor: canManage ? "pointer" : "default", border: 0 }}
                        title={canManage ? "Cliquer pour basculer le statut" : undefined}
                      >
                        {customer.active ? "Actif" : "Inactif"}
                      </button>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Link
                          href={`/clients/${customer.id}`}
                          className="ox-btn ox-btn-ghost ox-btn-sm"
                          title="Fiche 360°"
                          style={{ padding: "0.3rem 0.5rem" }}
                        >
                          <Eye size={14} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDocCustomer(customer);
                            setImmatriculationSuccessMsg(null);
                          }}
                          className="ox-btn ox-btn-ghost ox-btn-sm"
                          title="Dossier Documents & Immatriculation (CIP, IFU...)"
                          style={{
                            padding: "0.3rem 0.5rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            color: customer.documents && customer.documents.length > 0 ? "var(--ice-highlight)" : "inherit",
                            border: customer.documents && customer.documents.length > 0 ? "1px solid rgba(0, 120, 212, 0.3)" : undefined,
                          }}
                        >
                          <FolderCheck size={14} />
                          <span style={{ fontSize: "0.72rem", fontWeight: 650 }}>
                            {customer.documents?.length || 0}
                          </span>
                        </button>

                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingCustomer(customer)}
                              className="ox-btn ox-btn-ghost ox-btn-sm"
                              title="Modifier"
                              style={{ padding: "0.3rem 0.5rem" }}
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(customer)}
                              className="ox-btn ox-btn-ghost ox-btn-sm"
                              title="Supprimer / Désactiver"
                              style={{ padding: "0.3rem 0.5rem", color: "var(--bad)" }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Création Client */}
      {isCreateModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(6px)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div
            className="ox-glass"
            style={{
              width: "100%",
              maxWidth: 520,
              borderRadius: 20,
              padding: "1.75rem",
              background: "rgba(10, 24, 34, 0.95)",
              border: "1px solid var(--ice-border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>Nouveau Client</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", opacity: 0.65 }}>
                  Enregistrez un nouveau client particulier ou entreprise
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="ox-btn ox-btn-ghost ox-btn-sm"
                style={{ padding: 6, borderRadius: "50%" }}
              >
                <X size={16} />
              </button>
            </div>

            <form
              action={async (formData) => {
                await createCustomer(formData);
                setIsCreateModalOpen(false);
              }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  Contact principal <span style={{ color: "var(--bad)" }}>*</span>
                </label>
                <input
                  name="contactName"
                  required
                  placeholder="Ex: Augustin JOHNSON, Dr Nadine HOUVI"
                  className="ox-input"
                  style={{ width: "100%" }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  Entreprise / Raison sociale (optionnel)
                </label>
                <input
                  name="companyName"
                  placeholder="Ex: Impact Plus Consulting, DHL Bénin, J-J Telecom"
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  N° IFU Bénin <span style={{ color: "var(--gold)", fontSize: "0.75rem" }}>(Fiscalité MECEF &amp; Immatriculation ANaTT)</span>
                </label>
                <input
                  name="ifu"
                  placeholder="Ex: 0201910815523 (13 chiffres)"
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    E-mail
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="contact@domaine.bj"
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    Téléphone
                  </label>
                  <input
                    name="phone"
                    placeholder="+229 01 48 65 50 40"
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  Adresse physique / Quartier (Showroom / Domicile)
                </label>
                <input
                  name="address"
                  placeholder="Ex: Haie Vive, Rue 340, Cotonou"
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    Ville / Localisation
                  </label>
                  <input
                    name="city"
                    defaultValue="Cotonou"
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    Catégorie
                  </label>
                  <select name="category" className="ox-select" style={{ width: "100%" }}>
                    <option value="Particulier">Particulier</option>
                    <option value="Entreprise">Entreprise</option>
                    <option value="ONG / Diplomate">ONG / Diplomate</option>
                    <option value="Flotte">Flotte</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  Récapitulatif Visite Showroom &amp; Projet
                </label>
                <textarea
                  name="showroomNotes"
                  rows={2}
                  placeholder="Passé en showroom le 08/10, intéressé par BYD Dolphin ou Song Plus, devis demandé avec borne de recharge..."
                  className="ox-textarea"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  Notes &amp; Préférences complémentaires
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Intérêt véhicule électrique, besoin d'une borne à domicile..."
                  className="ox-textarea"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="ox-btn ox-btn-ghost"
                >
                  Annuler
                </button>
                <button type="submit" className="ox-btn">
                  Enregistrer le client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modification Client */}
      {editingCustomer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(6px)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingCustomer(null);
          }}
        >
          <div
            className="ox-glass"
            style={{
              width: "100%",
              maxWidth: 520,
              borderRadius: 20,
              padding: "1.75rem",
              background: "rgba(10, 24, 34, 0.95)",
              border: "1px solid var(--ice-border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>Modifier le client</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", opacity: 0.65 }}>
                  Mise à jour des coordonnées et statuts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="ox-btn ox-btn-ghost ox-btn-sm"
                style={{ padding: 6, borderRadius: "50%" }}
              >
                <X size={16} />
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateCustomer(formData);
                setEditingCustomer(null);
              }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <input type="hidden" name="id" value={editingCustomer.id} />

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  Contact principal <span style={{ color: "var(--bad)" }}>*</span>
                </label>
                <input
                  name="contactName"
                  required
                  defaultValue={editingCustomer.contactName}
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  Entreprise / Raison sociale
                </label>
                <input
                  name="companyName"
                  defaultValue={editingCustomer.companyName || ""}
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  N° IFU Bénin <span style={{ color: "var(--gold)", fontSize: "0.75rem" }}>(Fiscalité MECEF &amp; Immatriculation ANaTT)</span>
                </label>
                <input
                  name="ifu"
                  defaultValue={editingCustomer.ifu || ""}
                  placeholder="Ex: 0201910815523 (13 chiffres)"
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    E-mail
                  </label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingCustomer.email || ""}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    Téléphone
                  </label>
                  <input
                    name="phone"
                    defaultValue={editingCustomer.phone || ""}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  Adresse physique / Quartier
                </label>
                <input
                  name="address"
                  defaultValue={editingCustomer.address || ""}
                  placeholder="Ex: Haie Vive, Rue 340, Cotonou"
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    Ville / Localisation
                  </label>
                  <input
                    name="city"
                    defaultValue={editingCustomer.city || "Cotonou"}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    Catégorie
                  </label>
                  <select
                    name="category"
                    defaultValue={editingCustomer.category || "Particulier"}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="Particulier">Particulier</option>
                    <option value="Entreprise">Entreprise</option>
                    <option value="ONG / Diplomate">ONG / Diplomate</option>
                    <option value="Flotte">Flotte</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  Récapitulatif Visite Showroom &amp; Échanges
                </label>
                <textarea
                  name="showroomNotes"
                  rows={2}
                  defaultValue={editingCustomer.showroomNotes || ""}
                  placeholder="Passé au showroom le 08/10, intéressé par BYD Song Plus ou Dolphin, essai routier souhaité..."
                  className="ox-textarea"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  Notes &amp; Préférences complémentaires
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingCustomer.notes || ""}
                  className="ox-textarea"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="activeCheckbox"
                  name="active"
                  defaultChecked={editingCustomer.active}
                  value="true"
                  style={{ width: 16, height: 16, accentColor: "var(--brand)" }}
                />
                <label htmlFor="activeCheckbox" style={{ fontSize: "0.85rem", cursor: "pointer" }}>
                  Client actif (autoriser nouvelles opportunités, devis et commandes)
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="ox-btn ox-btn-ghost"
                >
                  Annuler
                </button>
                <button type="submit" className="ox-btn">
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DOCUMENTS & IMMATRICULATION (ANaTT) */}
      {selectedDocCustomer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 16,
            overflowY: "auto",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isUploadingDoc) {
              setSelectedDocCustomer(null);
            }
          }}
        >
          <div
            className="ox-glass"
            style={{
              width: "100%",
              maxWidth: 720,
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 20,
              padding: "1.75rem",
              background: "rgba(10, 24, 34, 0.98)",
              border: "1px solid var(--ice-border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--ice-border)", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FolderCheck size={24} color="var(--gold)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
                    Documents Client &amp; Immatriculation (ANaTT)
                  </h3>
                  <div style={{ fontSize: "0.82rem", opacity: 0.75, marginTop: 2 }}>
                    Client : <strong>{selectedDocCustomer.contactName}</strong> {selectedDocCustomer.companyName ? `(${selectedDocCustomer.companyName})` : ""}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocCustomer(null)}
                className="ox-btn ox-btn-ghost ox-btn-sm"
                style={{ padding: 6, borderRadius: "50%" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Fiche récap fiscale & immatriculation */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 10,
                padding: "0.75rem 1rem",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                fontSize: "0.82rem",
              }}
            >
              <div>
                <span style={{ opacity: 0.65 }}>N° IFU Bénin : </span>
                <strong style={{ color: selectedDocCustomer.ifu ? "var(--ice-highlight)" : "#f59e0b" }}>
                  {selectedDocCustomer.ifu || "⚠️ Non renseigné"}
                </strong>
              </div>
              <div>
                <span style={{ opacity: 0.65 }}>Téléphone : </span>
                <strong>{selectedDocCustomer.phone || "—"}</strong>
              </div>
              <div>
                <span style={{ opacity: 0.65 }}>Email : </span>
                <strong>{selectedDocCustomer.email || "—"}</strong>
              </div>
              <div>
                <span style={{ opacity: 0.65 }}>Adresse : </span>
                <strong>{selectedDocCustomer.address || selectedDocCustomer.city || "Cotonou"}</strong>
              </div>
            </div>

            {immatriculationSuccessMsg && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  background: "rgba(74, 222, 128, 0.15)",
                  border: "1px solid rgba(74, 222, 128, 0.3)",
                  color: "#4ade80",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Check size={18} />
                <span>{immatriculationSuccessMsg}</span>
              </div>
            )}

            {/* Liste des documents existants */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                  Pièces du dossier ({selectedDocCustomer.documents?.length || 0})
                </h4>
                <span style={{ fontSize: "0.75rem", opacity: 0.65 }}>
                  CIP / IFU / Domicile / Permis / Conformité
                </span>
              </div>

              {!selectedDocCustomer.documents || selectedDocCustomer.documents.length === 0 ? (
                <div
                  style={{
                    padding: "1.5rem",
                    textAlign: "center",
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px dashed rgba(255, 255, 255, 0.1)",
                    opacity: 0.65,
                    fontSize: "0.85rem",
                  }}
                >
                  Aucun document téléversé pour ce client pour le moment.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedDocCustomer.documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                        <Paperclip size={18} style={{ color: "var(--brand)", flexShrink: 0 }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 650, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {doc.title}
                          </div>
                          <div style={{ fontSize: "0.75rem", opacity: 0.65, display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                            <span>Fichier : {doc.fileName}</span>
                            <span>· Type : {doc.docType}</span>
                            <span>· Ajouté le {formatDate(doc.uploadedAt)}</span>
                          </div>
                          {doc.notes && (
                            <div style={{ fontSize: "0.73rem", opacity: 0.8, color: "var(--gold)", marginTop: 2 }}>
                              Note : {doc.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          className="ox-badge"
                          style={{
                            fontSize: "0.72rem",
                            background: doc.status === "TRANSMIS_ANATT" ? "rgba(56, 189, 248, 0.15)" : "rgba(74, 222, 128, 0.15)",
                            color: doc.status === "TRANSMIS_ANATT" ? "#38bdf8" : "#4ade80",
                            borderColor: doc.status === "TRANSMIS_ANATT" ? "rgba(56, 189, 248, 0.3)" : "rgba(74, 222, 128, 0.3)",
                          }}
                        >
                          {doc.status === "TRANSMIS_ANATT" ? "Transmis ANaTT" : "Validé"}
                        </span>

                        <a
                          href={doc.fileUrl}
                          download={doc.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="ox-btn ox-btn-ghost ox-btn-sm"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.78rem" }}
                          title="Télécharger / Visualiser la pièce"
                        >
                          <Download size={13} style={{ marginRight: 4 }} />
                          Télécharger
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="ox-btn ox-btn-ghost ox-btn-sm"
                          style={{ padding: "0.3rem 0.5rem", color: "var(--bad)" }}
                          title="Supprimer la pièce"
                          disabled={isUploadingDoc}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulaire d'upload de document */}
            <form
              onSubmit={handleUploadDoc}
              style={{
                marginTop: 4,
                padding: "1rem",
                borderRadius: 12,
                background: "rgba(0, 120, 212, 0.04)",
                border: "1px dashed rgba(0, 120, 212, 0.3)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 650, fontSize: "0.88rem", color: "var(--ice-highlight)", display: "flex", alignItems: "center", gap: 6 }}>
                <Upload size={16} />
                Ajouter une pièce justificative au dossier
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: 4 }}>
                    Type de document *
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="ox-select"
                    style={{ width: "100%", fontSize: "0.82rem" }}
                  >
                    <option value="CIP_CNI">🆔 CIP ou CNI (Identité)</option>
                    <option value="ATTESTATION_IFU">📄 Attestation IFU (Fiscal)</option>
                    <option value="JUSTIFICATIF_DOMICILE">🏠 Justificatif de domicile / Résidence</option>
                    <option value="PERMIS_CONDUIRE">🚗 Permis de conduire</option>
                    <option value="CERTIFICAT_CONFORMITE">🚢 Conformité / Dédouanement Port</option>
                    <option value="FACTURE_OU_DEVIS">📑 Facture de vente / Proforma</option>
                    <option value="AUTRE">📎 Autre pièce jointe</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: 4 }}>
                    Intitulé / Nom du document
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: CIP M. Dossou, IFU 020..."
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="ox-input"
                    style={{ width: "100%", fontSize: "0.82rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 10, alignItems: "end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: 4 }}>
                    Fichier (PDF, image JPG/PNG) *
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileSelect}
                    className="ox-input"
                    style={{ width: "100%", fontSize: "0.8rem", padding: "0.35rem 0.5rem" }}
                    disabled={isUploadingDoc}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isUploadingDoc || !docFileUrl}
                    className="ox-btn"
                    style={{ width: "100%", height: 38, fontSize: "0.82rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <Upload size={14} />
                    {isUploadingDoc ? "Téléversement..." : "Téléverser le document"}
                  </button>
                </div>
              </div>
            </form>

            {/* Bouton de transmission ANaTT */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid var(--ice-border)",
                paddingTop: 12,
                marginTop: 4,
              }}
            >
              <div style={{ fontSize: "0.78rem", opacity: 0.7 }}>
                Dossier vérifié par CARZONE Motors Showroom
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSelectedDocCustomer(null)}
                  className="ox-btn ox-btn-ghost"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleTransmitImmatriculation}
                  disabled={isUploadingDoc || !selectedDocCustomer.documents || selectedDocCustomer.documents.length === 0}
                  className="ox-btn"
                  style={{
                    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                    color: "#fff",
                    fontWeight: 650,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  title="Marquer le dossier complet et le transmettre pour immatriculation"
                >
                  <FileCheck2 size={16} />
                  Transmettre au service Immatriculation (ANaTT)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
