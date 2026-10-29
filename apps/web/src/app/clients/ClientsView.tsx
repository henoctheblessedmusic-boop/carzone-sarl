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
import { usePrefs } from "@/components/PrefsProvider";
import { clientsCopy } from "@/lib/i18n/messages/clients";
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
  const { locale } = usePrefs();
  const copy = clientsCopy[locale];
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
      fd.append("title", docTitle || docFileName || copy.docsModal.defaultTitle);
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
    if (!window.confirm(copy.confirmations.deleteDocument)) return;
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
      alert(copy.confirmations.uploadFirst);
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
      setImmatriculationSuccessMsg(copy.confirmations.transferSuccess);
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
    const headers = copy.csv.headers;
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
      c.active ? copy.status.active : copy.status.inactive,
      c._count.quotes,
      c._count.invoices,
      copy.formatDate(c.createdAt),
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
      ? copy.confirmations.deleteWithHistory
      : copy.confirmations.deletePermanent(customer.contactName);

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
              {copy.stats.totalTitle}
            </span>
            <User size={18} style={{ color: "var(--brand)" }} />
          </div>
          <div className="ox-metric-val" style={{ fontSize: "1.85rem", marginTop: 4 }}>{totalCount}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--ice-text-muted)", marginTop: 2 }}>
            {copy.stats.totalHint}
          </div>
        </div>

        <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.7, fontWeight: 550 }}>
              {copy.stats.activeTitle}
            </span>
            <CheckCircle2 size={18} style={{ color: "var(--ok)" }} />
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 750, marginTop: 4, color: "var(--ok)" }}>
            {activeCount}
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.65, marginTop: 2 }}>
            {copy.stats.activeShare(totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0)}
          </div>
        </div>

        <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.7, fontWeight: 550 }}>
              {copy.stats.companiesTitle}
            </span>
            <Building2 size={18} style={{ color: "var(--gold)" }} />
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 750, marginTop: 4, color: "var(--gold)" }}>
            {companyCount}
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.65, marginTop: 2 }}>
            {copy.stats.companiesHint}
          </div>
        </div>

        <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.7, fontWeight: 550 }}>
              {copy.stats.individualsTitle}
            </span>
            <User size={18} style={{ opacity: 0.7 }} />
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 750, marginTop: 4 }}>
            {individualCount}
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.65, marginTop: 2 }}>
            {copy.stats.individualsHint}
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
              placeholder={copy.search.placeholder}
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
            <option value="ALL">{copy.filters.statusAll}</option>
            <option value="ACTIVE">{copy.filters.statusActiveOnly}</option>
            <option value="INACTIVE">{copy.filters.statusInactive}</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="ox-select"
            style={{ height: 38, fontSize: "0.88rem" }}
          >
            <option value="ALL">{copy.filters.categoryAll}</option>
            <option value="Entreprise">{copy.filters.categoryCompanies}</option>
            <option value="Particulier">{copy.filters.categoryIndividuals}</option>
            <option value="ONG / Diplomate">{copy.filters.categoryNgos}</option>
            <option value="Flotte">{copy.filters.categoryFleets}</option>
            <option value="Autre">{copy.filters.categoryOther}</option>
          </select>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={exportCsv}
            className="ox-btn ox-btn-ghost"
            style={{ height: 38, padding: "0 0.9rem", fontSize: "0.88rem" }}
            title={copy.toolbar.exportCsvTitle}
          >
            <Download size={15} style={{ marginRight: 6 }} />
            {copy.toolbar.exportCsv}
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="ox-btn"
              style={{ height: 38, padding: "0 1.1rem", fontSize: "0.88rem" }}
            >
              <Plus size={16} style={{ marginRight: 6 }} />
              {copy.toolbar.newCustomer}
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="ox-table-wrap">
        <table className="ox-table">
          <thead>
            <tr>
              <th style={{ width: 45 }}>{copy.table.index}</th>
              <th>{copy.table.contact}</th>
              <th>{copy.table.company}</th>
              <th>{copy.table.contactInfo}</th>
              <th>{copy.table.location}</th>
              <th>{copy.table.category}</th>
              <th>{copy.table.activity}</th>
              <th>{copy.table.status}</th>
              <th style={{ textAlign: "right", paddingRight: "1.2rem" }}>{copy.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "2.5rem 1rem", opacity: 0.6 }}>
                  {copy.table.empty}
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
                              {copy.table.ifuPrefix}{customer.ifu}
                            </div>
                          ) : (
                            <div style={{ fontSize: "0.7rem", color: "#f59e0b", opacity: 0.85 }}>
                              {copy.table.missingIfu}
                            </div>
                          )}
                          <div style={{ fontSize: "0.74rem", opacity: 0.55, marginTop: 1 }}>
                            {copy.table.addedOn(copy.formatDate(customer.createdAt))}
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
                              {copy.table.showroomVisit}
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
                        <span style={{ opacity: 0.4 }}>-</span>
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
                        {!customer.email && !customer.phone && <span style={{ opacity: 0.4 }}>-</span>}
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
                        {customer.category
                          ? copy.categoryLabel(customer.category)
                          : customer.companyName
                          ? copy.category.company
                          : copy.category.individual}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem" }}>
                        {customer._count.quotes > 0 && (
                          <span
                            title={copy.table.quotesTooltip(customer._count.quotes)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 3, opacity: 0.85 }}
                          >
                            <FileText size={12} style={{ color: "var(--ice-highlight)" }} />
                            {customer._count.quotes}
                          </span>
                        )}
                        {customer._count.invoices > 0 && (
                          <span
                            title={copy.table.invoicesTooltip(customer._count.invoices)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 3, opacity: 0.85 }}
                          >
                            <Receipt size={12} style={{ color: "var(--brand)" }} />
                            {customer._count.invoices}
                          </span>
                        )}
                        {customer._count.subscriptions > 0 && (
                          <span
                            title={copy.table.subscriptionsTooltip(customer._count.subscriptions)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--ok)" }}
                          >
                            <Zap size={12} />
                            {customer._count.subscriptions}
                          </span>
                        )}
                        {customer._count.quotes === 0 &&
                          customer._count.invoices === 0 &&
                          customer._count.subscriptions === 0 && (
                            <span style={{ opacity: 0.4 }}>{copy.table.noActivity}</span>
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
                        title={canManage ? copy.table.toggleTitle : undefined}
                      >
                        {customer.active ? copy.status.active : copy.status.inactive}
                      </button>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Link
                          href={`/clients/${customer.id}`}
                          className="ox-btn ox-btn-ghost ox-btn-sm"
                          title={copy.table.viewTitle}
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
                          title={copy.table.documentsTitle}
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
                              title={copy.table.editTitle}
                              style={{ padding: "0.3rem 0.5rem" }}
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(customer)}
                              className="ox-btn ox-btn-ghost ox-btn-sm"
                              title={copy.table.deleteTitle}
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
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{copy.createModal.title}</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", opacity: 0.65 }}>
                  {copy.createModal.subtitle}
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
                  {copy.createModal.contactLabel} <span style={{ color: "var(--bad)" }}>*</span>
                </label>
                <input
                  name="contactName"
                  required
                  placeholder={copy.createModal.contactPlaceholder}
                  className="ox-input"
                  style={{ width: "100%" }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  {copy.createModal.companyLabel}
                </label>
                <input
                  name="companyName"
                  placeholder={copy.createModal.companyPlaceholder}
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  {copy.createModal.ifuLabel} <span style={{ color: "var(--gold)", fontSize: "0.75rem" }}>{copy.createModal.ifuHint}</span>
                </label>
                <input
                  name="ifu"
                  placeholder={copy.createModal.ifuPlaceholder}
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    {copy.createModal.emailLabel}
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder={copy.createModal.emailPlaceholder}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    {copy.createModal.phoneLabel}
                  </label>
                  <input
                    name="phone"
                    placeholder={copy.createModal.phonePlaceholder}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  {copy.createModal.addressLabel}
                </label>
                <input
                  name="address"
                  placeholder={copy.createModal.addressPlaceholder}
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    {copy.createModal.cityLabel}
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
                    {copy.createModal.categoryLabel}
                  </label>
                  <select name="category" className="ox-select" style={{ width: "100%" }}>
                    <option value="Particulier">{copy.category.individual}</option>
                    <option value="Entreprise">{copy.category.company}</option>
                    <option value="ONG / Diplomate">{copy.category.ngo}</option>
                    <option value="Flotte">{copy.category.fleet}</option>
                    <option value="Autre">{copy.category.other}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  {copy.createModal.showroomNotesLabel}
                </label>
                <textarea
                  name="showroomNotes"
                  rows={2}
                  placeholder={copy.createModal.showroomNotesPlaceholder}
                  className="ox-textarea"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  {copy.createModal.notesLabel}
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder={copy.createModal.notesPlaceholder}
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
                  {copy.createModal.cancel}
                </button>
                <button type="submit" className="ox-btn">
                  {copy.createModal.submit}
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
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{copy.editModal.title}</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", opacity: 0.65 }}>
                  {copy.editModal.subtitle}
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
                  {copy.editModal.contactLabel} <span style={{ color: "var(--bad)" }}>*</span>
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
                  {copy.editModal.companyLabel}
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
                  {copy.editModal.ifuLabel} <span style={{ color: "var(--gold)", fontSize: "0.75rem" }}>{copy.editModal.ifuHint}</span>
                </label>
                <input
                  name="ifu"
                  defaultValue={editingCustomer.ifu || ""}
                  placeholder={copy.editModal.ifuPlaceholder}
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    {copy.editModal.emailLabel}
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
                    {copy.editModal.phoneLabel}
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
                  {copy.editModal.addressLabel}
                </label>
                <input
                  name="address"
                  defaultValue={editingCustomer.address || ""}
                  placeholder={copy.editModal.addressPlaceholder}
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    {copy.editModal.cityLabel}
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
                    {copy.editModal.categoryLabel}
                  </label>
                  <select
                    name="category"
                    defaultValue={editingCustomer.category || "Particulier"}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="Particulier">{copy.category.individual}</option>
                    <option value="Entreprise">{copy.category.company}</option>
                    <option value="ONG / Diplomate">{copy.category.ngo}</option>
                    <option value="Flotte">{copy.category.fleet}</option>
                    <option value="Autre">{copy.category.other}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  {copy.editModal.showroomNotesLabel}
                </label>
                <textarea
                  name="showroomNotes"
                  rows={2}
                  defaultValue={editingCustomer.showroomNotes || ""}
                  placeholder={copy.editModal.showroomNotesPlaceholder}
                  className="ox-textarea"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  {copy.editModal.notesLabel}
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
                  {copy.editModal.activeLabel}
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="ox-btn ox-btn-ghost"
                >
                  {copy.editModal.cancel}
                </button>
                <button type="submit" className="ox-btn">
                  {copy.editModal.submit}
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
                    {copy.docsModal.title}
                  </h3>
                  <div style={{ fontSize: "0.82rem", opacity: 0.75, marginTop: 2 }}>
                    {copy.docsModal.clientPrefix}<strong>{selectedDocCustomer.contactName}</strong> {selectedDocCustomer.companyName ? `(${selectedDocCustomer.companyName})` : ""}
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
                <span style={{ opacity: 0.65 }}>{copy.docsModal.ifuLabel}</span>
                <strong style={{ color: selectedDocCustomer.ifu ? "var(--ice-highlight)" : "#f59e0b" }}>
                  {selectedDocCustomer.ifu || copy.docsModal.ifuMissing}
                </strong>
              </div>
              <div>
                <span style={{ opacity: 0.65 }}>{copy.docsModal.phoneLabel}</span>
                <strong>{selectedDocCustomer.phone || "-"}</strong>
              </div>
              <div>
                <span style={{ opacity: 0.65 }}>{copy.docsModal.emailLabel}</span>
                <strong>{selectedDocCustomer.email || "-"}</strong>
              </div>
              <div>
                <span style={{ opacity: 0.65 }}>{copy.docsModal.addressLabel}</span>
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
                  {copy.docsModal.piecesTitle(selectedDocCustomer.documents?.length || 0)}
                </h4>
                <span style={{ fontSize: "0.75rem", opacity: 0.65 }}>
                  {copy.docsModal.piecesHint}
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
                  {copy.docsModal.empty}
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
                            <span>{copy.docsModal.filePrefix}{doc.fileName}</span>
                            <span>· {copy.docsModal.typePrefix}{copy.docTypeLabel(doc.docType)}</span>
                            <span>· {copy.docsModal.addedOn(copy.formatDate(doc.uploadedAt))}</span>
                          </div>
                          {doc.notes && (
                            <div style={{ fontSize: "0.73rem", opacity: 0.8, color: "var(--gold)", marginTop: 2 }}>
                              {copy.docsModal.notePrefix}{doc.notes}
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
                          {doc.status === "TRANSMIS_ANATT" ? copy.documentStatus.transmitted : copy.documentStatus.validated}
                        </span>

                        <a
                          href={doc.fileUrl}
                          download={doc.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="ox-btn ox-btn-ghost ox-btn-sm"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.78rem" }}
                          title={copy.docsModal.downloadTitle}
                        >
                          <Download size={13} style={{ marginRight: 4 }} />
                          {copy.docsModal.download}
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="ox-btn ox-btn-ghost ox-btn-sm"
                          style={{ padding: "0.3rem 0.5rem", color: "var(--bad)" }}
                          title={copy.docsModal.deleteTitle}
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
                {copy.docsModal.uploadTitle}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: 4 }}>
                    {copy.docsModal.docTypeLabel}
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="ox-select"
                    style={{ width: "100%", fontSize: "0.82rem" }}
                  >
                    <option value="CIP_CNI">{copy.docsModal.docTypeIdentity}</option>
                    <option value="ATTESTATION_IFU">{copy.docsModal.docTypeIfu}</option>
                    <option value="JUSTIFICATIF_DOMICILE">{copy.docsModal.docTypeResidence}</option>
                    <option value="PERMIS_CONDUIRE">{copy.docsModal.docTypeLicense}</option>
                    <option value="CERTIFICAT_CONFORMITE">{copy.docsModal.docTypeCustoms}</option>
                    <option value="FACTURE_OU_DEVIS">{copy.docsModal.docTypeInvoice}</option>
                    <option value="AUTRE">{copy.docsModal.docTypeOther}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: 4 }}>
                    {copy.docsModal.docTitleLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={copy.docsModal.docTitlePlaceholder}
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
                    {copy.docsModal.fileLabel}
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
                    {isUploadingDoc ? copy.docsModal.uploading : copy.docsModal.upload}
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
                {copy.docsModal.footerNote}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSelectedDocCustomer(null)}
                  className="ox-btn ox-btn-ghost"
                >
                  {copy.docsModal.close}
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
                  title={copy.docsModal.transmitTitle}
                >
                  <FileCheck2 size={16} />
                  {copy.docsModal.transmit}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
