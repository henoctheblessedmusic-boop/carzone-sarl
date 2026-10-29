"use client";

import { useState, useTransition } from "react";
import {
  Inbox,
  Send,
  FileText,
  Star,
  Trash2,
  Plus,
  RefreshCw,
  X,
  Search,
  Reply,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  sendEmail,
  markMailRead,
  toggleMailStar,
  deleteMail,
} from "./actions";

export type MailItem = {
  id: string;
  folder: string;
  from: string;
  to: string;
  subject: string;
  snippet: string | null;
  body: string;
  isRead: boolean;
  starred: boolean;
  createdAt: string | Date;
  customer?: { id: string; contactName: string; email: string | null } | null;
};

export type CustomerOption = {
  id: string;
  contactName: string;
  companyName: string | null;
  email: string | null;
};

export function MailboxView({
  initialMails,
  customers,
  currentUserEmail,
}: {
  initialMails: MailItem[];
  customers: CustomerOption[];
  currentUserEmail: string;
}) {
  const [mails, setMails] = useState(initialMails);
  const [activeFolder, setActiveFolder] = useState<"INBOX" | "SENT" | "DRAFT" | "STARRED" | "TRASH">("INBOX");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<MailItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [, startTransition] = useTransition();

  // Counts
  const inboxUnread = mails.filter((m) => m.folder === "INBOX" && !m.isRead).length;
  const sentCount = mails.filter((m) => m.folder === "SENT").length;
  const draftCount = mails.filter((m) => m.folder === "DRAFT").length;
  const starredCount = mails.filter((m) => m.starred).length;
  const trashCount = mails.filter((m) => m.folder === "TRASH").length;

  // Filtered
  const filteredMails = mails.filter((m) => {
    let matchesFolder = false;
    if (activeFolder === "STARRED") {
      matchesFolder = m.starred;
    } else {
      matchesFolder = m.folder === activeFolder;
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      m.subject.toLowerCase().includes(term) ||
      m.from.toLowerCase().includes(term) ||
      m.to.toLowerCase().includes(term) ||
      m.body.toLowerCase().includes(term);

    return matchesFolder && matchesSearch;
  });

  function handleOpenMail(mail: MailItem) {
    setSelectedMail(mail);
    if (!mail.isRead) {
      startTransition(async () => {
        await markMailRead(mail.id, true);
        setMails((prev) =>
          prev.map((m) => (m.id === mail.id ? { ...m, isRead: true } : m))
        );
      });
    }
  }

  function handleToggleStar(e: React.MouseEvent, mail: MailItem) {
    e.stopPropagation();
    const newStar = !mail.starred;
    startTransition(async () => {
      await toggleMailStar(mail.id, newStar);
      setMails((prev) =>
        prev.map((m) => (m.id === mail.id ? { ...m, starred: newStar } : m))
      );
    });
  }

  function handleDelete(e: React.MouseEvent, mail: MailItem) {
    e.stopPropagation();
    startTransition(async () => {
      await deleteMail(mail.id);
      if (mail.folder === "TRASH") {
        setMails((prev) => prev.filter((m) => m.id !== mail.id));
      } else {
        setMails((prev) =>
          prev.map((m) => (m.id === mail.id ? { ...m, folder: "TRASH" } : m))
        );
      }
      if (selectedMail?.id === mail.id) setSelectedMail(null);
    });
  }

  function handleSync() {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 800);
  }



  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 18, minHeight: 650 }}>
      {/* Sidebar Folders */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <button
          type="button"
          onClick={() => {
            setReplyTo(null);
            setIsComposeOpen(true);
          }}
          className="ox-btn"
          style={{ width: "100%", padding: "0.75rem 1rem", fontSize: "0.92rem", justifyContent: "flex-start" }}
        >
          <Plus size={18} style={{ marginRight: 8 }} />
          Composer
        </button>

        {/* Folders Card */}
        <div className="ox-glass" style={{ padding: "0.8rem", borderRadius: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <button
              type="button"
              onClick={() => { setActiveFolder("INBOX"); setSelectedMail(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.55rem 0.8rem",
                borderRadius: 10,
                border: 0,
                background: activeFolder === "INBOX" ? "var(--ice-highlight-soft)" : "transparent",
                color: activeFolder === "INBOX" ? "var(--ice-highlight)" : "var(--ice-text)",
                fontWeight: activeFolder === "INBOX" ? 650 : 500,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Inbox size={16} />
                <span>Boîte de réception</span>
              </div>
              {inboxUnread > 0 && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.15rem 0.5rem",
                    borderRadius: 999,
                    background: "var(--brand)",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  {inboxUnread}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveFolder("SENT"); setSelectedMail(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.55rem 0.8rem",
                borderRadius: 10,
                border: 0,
                background: activeFolder === "SENT" ? "var(--ice-highlight-soft)" : "transparent",
                color: activeFolder === "SENT" ? "var(--ice-highlight)" : "var(--ice-text)",
                fontWeight: activeFolder === "SENT" ? 650 : 500,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Send size={16} />
                <span>Envoyés</span>
              </div>
              <span style={{ fontSize: "0.78rem", opacity: 0.6 }}>{sentCount}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveFolder("STARRED"); setSelectedMail(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.55rem 0.8rem",
                borderRadius: 10,
                border: 0,
                background: activeFolder === "STARRED" ? "var(--ice-highlight-soft)" : "transparent",
                color: activeFolder === "STARRED" ? "var(--gold)" : "var(--ice-text)",
                fontWeight: activeFolder === "STARRED" ? 650 : 500,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Star size={16} style={{ color: "var(--gold)" }} />
                <span>Favoris</span>
              </div>
              <span style={{ fontSize: "0.78rem", opacity: 0.6 }}>{starredCount}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveFolder("DRAFT"); setSelectedMail(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.55rem 0.8rem",
                borderRadius: 10,
                border: 0,
                background: activeFolder === "DRAFT" ? "var(--ice-highlight-soft)" : "transparent",
                color: activeFolder === "DRAFT" ? "var(--ice-highlight)" : "var(--ice-text)",
                fontWeight: activeFolder === "DRAFT" ? 650 : 500,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileText size={16} />
                <span>Brouillons</span>
              </div>
              <span style={{ fontSize: "0.78rem", opacity: 0.6 }}>{draftCount}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveFolder("TRASH"); setSelectedMail(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.55rem 0.8rem",
                borderRadius: 10,
                border: 0,
                background: activeFolder === "TRASH" ? "var(--ice-highlight-soft)" : "transparent",
                color: activeFolder === "TRASH" ? "var(--bad)" : "var(--ice-text)",
                fontWeight: activeFolder === "TRASH" ? 650 : 500,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Trash2 size={16} />
                <span>Corbeille</span>
              </div>
              <span style={{ fontSize: "0.78rem", opacity: 0.6 }}>{trashCount}</span>
            </button>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="ox-glass" style={{ padding: "0.9rem", borderRadius: 16 }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, opacity: 0.6, letterSpacing: "0.5px", marginBottom: 10, textTransform: "uppercase" }}>
            Comptes connectés
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ok)", flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>contact@topcarzone.com</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", opacity: 0.8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ok)", flexShrink: 0 }} />
              <span>{currentUserEmail || "direction@topcarzone.com"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mail Area */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Top Header of List */}
        <div
          className="ox-glass"
          style={{
            padding: "0.8rem 1.1rem",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <div style={{ position: "relative", minWidth: 260, flex: "1 1 260px" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: 0.5,
                }}
              />
              <input
                type="text"
                placeholder="Rechercher un message, expéditeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ox-input"
                style={{ width: "100%", paddingLeft: 34, height: 34, fontSize: "0.85rem" }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="ox-btn ox-btn-ghost ox-btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            title="Synchroniser la boîte de réception"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            <span>Synchroniser</span>
          </button>
        </div>

        {/* Selected Mail Reader or List */}
        {selectedMail ? (
          /* Reader View */
          <div className="ox-glass" style={{ padding: "1.5rem", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setSelectedMail(null)}
                className="ox-btn ox-btn-ghost ox-btn-sm"
              >
                ← Retour aux messages
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(selectedMail);
                    setIsComposeOpen(true);
                  }}
                  className="ox-btn ox-btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  <Reply size={14} />
                  Répondre
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, selectedMail)}
                  className="ox-btn ox-btn-ghost ox-btn-sm"
                  style={{ color: "var(--bad)" }}
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <h2 style={{ margin: "0 0 12px 0", fontSize: "1.35rem", fontWeight: 700 }}>
              {selectedMail.subject}
            </h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                padding: "0.8rem 1rem",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--ice-border)",
                marginBottom: 20,
                fontSize: "0.85rem",
              }}
            >
              <div>
                <span style={{ opacity: 0.6 }}>De : </span>
                <strong>{selectedMail.from}</strong>
              </div>
              <div>
                <span style={{ opacity: 0.6 }}>À : </span>
                <strong>{selectedMail.to}</strong>
              </div>
              <div style={{ marginLeft: "auto", opacity: 0.7 }}>
                {formatDate(selectedMail.createdAt)}
              </div>
            </div>

            <div
              style={{
                whiteSpace: "pre-line",
                lineHeight: 1.7,
                fontSize: "0.95rem",
                color: "var(--ice-text)",
                padding: "0.5rem 0",
              }}
            >
              {selectedMail.body}
            </div>
          </div>
        ) : (
          /* Messages Table */
          <div className="ox-table-wrap">
            <table className="ox-table">
              <tbody>
                {filteredMails.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "3rem 1rem", opacity: 0.6 }}>
                      Aucun message dans ce dossier.
                    </td>
                  </tr>
                ) : (
                  filteredMails.map((mail) => (
                    <tr
                      key={mail.id}
                      onClick={() => handleOpenMail(mail)}
                      style={{
                        cursor: "pointer",
                        fontWeight: mail.isRead ? 400 : 700,
                        background: mail.isRead ? "transparent" : "rgba(126, 200, 227, 0.05)",
                      }}
                    >
                      {/* Star */}
                      <td style={{ width: 36, paddingLeft: "1rem" }}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(e, mail)}
                          style={{
                            background: "transparent",
                            border: 0,
                            cursor: "pointer",
                            padding: 0,
                            color: mail.starred ? "var(--gold)" : "rgba(255,255,255,0.25)",
                          }}
                        >
                          <Star size={16} fill={mail.starred ? "var(--gold)" : "transparent"} />
                        </button>
                      </td>

                      {/* Sender / Recipient */}
                      <td style={{ width: 220, whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              background: "rgba(126, 200, 227, 0.15)",
                              color: "var(--ice-highlight)",
                              display: "grid",
                              placeItems: "center",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {(activeFolder === "SENT" ? mail.to : mail.from)[0].toUpperCase()}
                          </div>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 }}>
                            {activeFolder === "SENT" ? `À : ${mail.to}` : mail.from}
                          </span>
                        </div>
                      </td>

                      {/* Subject + Snippet */}
                      <td>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, overflow: "hidden" }}>
                          <span style={{ color: "var(--ice-text)" }}>{mail.subject}</span>
                          <span style={{ opacity: 0.5, fontSize: "0.82rem", fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            · {mail.snippet || mail.body.slice(0, 80)}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ width: 110, textAlign: "right", opacity: 0.65, fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                        {formatDate(mail.createdAt)}
                      </td>

                      {/* Action */}
                      <td style={{ width: 45, textAlign: "right", paddingRight: "1rem" }}>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, mail)}
                          style={{
                            background: "transparent",
                            border: 0,
                            cursor: "pointer",
                            opacity: 0.5,
                            color: "var(--bad)",
                          }}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(6px)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsComposeOpen(false);
          }}
        >
          <div
            className="ox-glass"
            style={{
              width: "100%",
              maxWidth: 560,
              borderRadius: 20,
              padding: "1.75rem",
              background: "rgba(10, 24, 34, 0.96)",
              border: "1px solid var(--ice-border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
                  {replyTo ? `Répondre à ${replyTo.from}` : "Nouveau Message"}
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", opacity: 0.65 }}>
                  Envoi d&apos;email depuis CARZONE SARL
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="ox-btn ox-btn-ghost ox-btn-sm"
                style={{ padding: 6, borderRadius: "50%" }}
              >
                <X size={16} />
              </button>
            </div>

            <form
              action={async (formData) => {
                await sendEmail(formData);
                setIsComposeOpen(false);
                setReplyTo(null);
              }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    Destinataire <span style={{ color: "var(--bad)" }}>*</span>
                  </label>
                  {customers.length > 0 && (
                    <select
                      onChange={(e) => {
                        const targetInput = document.getElementById("mailToInput") as HTMLInputElement;
                        if (targetInput) targetInput.value = e.target.value;
                      }}
                      className="ox-select"
                      style={{ fontSize: "0.78rem", padding: "0.2rem 0.5rem" }}
                      defaultValue=""
                    >
                      <option value="" disabled>Choisir un client...</option>
                      {customers.filter((c) => c.email).map((c) => (
                        <option key={c.id} value={c.email || ""}>
                          {c.contactName} ({c.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <input
                  id="mailToInput"
                  name="to"
                  type="email"
                  required
                  defaultValue={replyTo ? replyTo.from : ""}
                  placeholder="client@domaine.bj"
                  className="ox-input"
                  style={{ width: "100%" }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  Objet <span style={{ color: "var(--bad)" }}>*</span>
                </label>
                <input
                  name="subject"
                  required
                  defaultValue={replyTo ? `Re: ${replyTo.subject}` : ""}
                  placeholder="Ex: Devis CARZONE SARL / Confirmation de votre commande"
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  Message <span style={{ color: "var(--bad)" }}>*</span>
                </label>
                <textarea
                  name="body"
                  required
                  rows={6}
                  defaultValue={
                    replyTo
                      ? `\n\n--- Message original de ${replyTo.from} ---\n${replyTo.body}`
                      : "Bonjour,\n\nNous vous remercions de votre confiance.\n\nBien cordialement,\nL'équipe CARZONE SARL"
                  }
                  className="ox-textarea"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="ox-btn ox-btn-ghost"
                >
                  Annuler
                </button>
                <button type="submit" className="ox-btn">
                  <Send size={15} style={{ marginRight: 6 }} />
                  Envoyer l&apos;email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
