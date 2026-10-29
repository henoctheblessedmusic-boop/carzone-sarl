"use client";

import { useState, useTransition } from "react";
import {
  Search,
  Plus,
  Wrench,
  Car,
  Package,
  Sparkles,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import { formatXof } from "@/lib/format";
import { usePrefs } from "@/components/PrefsProvider";
import {
  ARTICLE_CATEGORY_KEYS,
  articleCategoryLabel,
  articleCategoryOptionLabel,
  energyCopy,
} from "@/lib/i18n/messages/energy";
import {
  createArticle,
  updateArticle,
  toggleArticleActive,
  deleteArticle,
} from "./actions";

export type ArticleItem = {
  id: string;
  name: string;
  description: string | null;
  unitPriceXof: number;
  taxRatePct: number;
  unit: string | null;
  category: string | null;
  active: boolean;
};

export function ServicesView({
  initialArticles,
  canManage,
}: {
  initialArticles: ArticleItem[];
  canManage: boolean;
}) {
  const { locale } = usePrefs();
  const copy = energyCopy[locale];
  const t = copy.services;
  const [articles, setArticles] = useState(initialArticles);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalCount = articles.length;
  const serviceCount = articles.filter((a) => a.category === "SERVICE").length;
  const accessoryCount = articles.filter((a) => a.category === "ACCESSOIRE").length;
  const vehicleCount = articles.filter((a) => a.category === "VEHICULE").length;

  const filteredArticles = articles.filter((a) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      a.name.toLowerCase().includes(term) ||
      (a.description && a.description.toLowerCase().includes(term)) ||
      (a.category && a.category.toLowerCase().includes(term));

    const matchesCategory =
      categoryFilter === "ALL" || a.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  function handleToggle(item: ArticleItem) {
    const newStatus = !item.active;
    startTransition(async () => {
      await toggleArticleActive(item.id, newStatus);
      setArticles((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, active: newStatus } : a))
      );
    });
  }

  function handleDelete(item: ArticleItem) {
    if (!window.confirm(t.deleteConfirm(item.name))) return;
    startTransition(async () => {
      await deleteArticle(item.id);
      setArticles((prev) => prev.filter((a) => a.id !== item.id));
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
        }}
      >
        <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.7, fontWeight: 550 }}>
              {t.kpi.total.label}
            </span>
            <Package size={18} style={{ color: "var(--brand)" }} />
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 750, marginTop: 4 }}>
            {totalCount}
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.65, marginTop: 2 }}>
            {t.kpi.total.hint}
          </div>
        </div>

        <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.7, fontWeight: 550 }}>
              {t.kpi.vehicles.label}
            </span>
            <Car size={18} style={{ color: "var(--gold)" }} />
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 750, marginTop: 4, color: "var(--gold)" }}>
            {vehicleCount}
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.65, marginTop: 2 }}>
            {t.kpi.vehicles.hint}
          </div>
        </div>

        <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.7, fontWeight: 550 }}>
              {t.kpi.accessories.label}
            </span>
            <Sparkles size={18} style={{ color: "var(--ok)" }} />
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 750, marginTop: 4, color: "var(--ok)" }}>
            {accessoryCount}
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.65, marginTop: 2 }}>
            {t.kpi.accessories.hint}
          </div>
        </div>

        <div className="ox-glass" style={{ padding: "1.1rem 1.25rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.7, fontWeight: 550 }}>
              {t.kpi.workshop.label}
            </span>
            <Wrench size={18} style={{ color: "var(--ice-highlight)" }} />
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 750, marginTop: 4 }}>
            {serviceCount}
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.65, marginTop: 2 }}>
            {t.kpi.workshop.hint}
          </div>
        </div>
      </div>

      {/* Action Bar */}
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
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
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
              placeholder={t.searchPlaceholder}
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

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="ox-select"
            style={{ height: 38, fontSize: "0.88rem" }}
          >
            <option value="ALL">{t.categories.all}</option>
            <option value="VEHICULE">{t.categories.VEHICULE}</option>
            <option value="ACCESSOIRE">{t.categories.ACCESSOIRE}</option>
            <option value="SERVICE">{t.categories.SERVICE}</option>
            <option value="PIECE">{t.categories.PIECE}</option>
          </select>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="ox-btn"
            style={{ height: 38, padding: "0 1.1rem", fontSize: "0.88rem" }}
          >
            <Plus size={16} style={{ marginRight: 6 }} />
            {t.addButton}
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="ox-table-wrap">
        <table className="ox-table">
          <thead>
            <tr>
              <th style={{ width: 45 }}>{t.table.index}</th>
              <th>{t.table.name}</th>
              <th>{t.table.details}</th>
              <th>{t.table.price}</th>
              <th>{t.table.tax}</th>
              <th>{t.table.unit}</th>
              <th>{t.table.category}</th>
              <th>{t.table.status}</th>
              <th style={{ textAlign: "right", paddingRight: "1.2rem" }}>{t.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "2.5rem 1rem", opacity: 0.6 }}>
                  {t.empty}
                </td>
              </tr>
            ) : (
              filteredArticles.map((art, idx) => (
                <tr key={art.id}>
                  <td style={{ opacity: 0.5, fontSize: "0.82rem" }}>{idx + 1}</td>
                  <td>
                    <strong style={{ fontSize: "0.95rem" }}>{art.name}</strong>
                  </td>
                  <td style={{ opacity: 0.75, fontSize: "0.85rem", maxWidth: 280 }}>
                    {art.description || "-"}
                  </td>
                  <td>
                    <strong style={{ color: "var(--gold)", fontSize: "0.95rem" }}>
                      {formatXof(art.unitPriceXof)}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                      {art.taxRatePct > 0 ? t.taxRated(art.taxRatePct) : t.taxFree}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                      {art.unit || "1"}
                    </span>
                  </td>
                  <td>
                    <span
                      className="ox-badge"
                      style={{
                        background:
                          art.category === "VEHICULE"
                            ? "rgba(196, 163, 90, 0.15)"
                            : art.category === "ACCESSOIRE"
                            ? "rgba(61, 186, 138, 0.15)"
                            : "rgba(126, 200, 227, 0.12)",
                        color:
                          art.category === "VEHICULE"
                            ? "var(--gold)"
                            : art.category === "ACCESSOIRE"
                            ? "var(--ok)"
                            : "var(--ice-highlight)",
                      }}
                    >
                      {art.category ? articleCategoryLabel(copy, art.category) : copy.common.notProvided}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggle(art)}
                      disabled={isPending || !canManage}
                      className={`ox-badge ox-badge--${art.active ? "ok" : "bad"}`}
                      style={{ cursor: canManage ? "pointer" : "default", border: 0 }}
                      title={canManage ? t.toggleTitle : undefined}
                    >
                      {art.active ? copy.common.active : copy.common.inactive}
                    </button>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {canManage && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setEditingArticle(art)}
                          className="ox-btn ox-btn-ghost ox-btn-sm"
                          title={t.editTitle}
                          style={{ padding: "0.3rem 0.5rem" }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(art)}
                          className="ox-btn ox-btn-ghost ox-btn-sm"
                          title={t.deleteTitle}
                          style={{ padding: "0.3rem 0.5rem", color: "var(--bad)" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Création */}
      {isCreateOpen && (
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
            if (e.target === e.currentTarget) setIsCreateOpen(false);
          }}
        >
          <div
            className="ox-glass"
            style={{
              width: "100%",
              maxWidth: 500,
              borderRadius: 20,
              padding: "1.75rem",
              background: "rgba(10, 24, 34, 0.95)",
              border: "1px solid var(--ice-border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{t.create.title}</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", opacity: 0.65 }}>
                  {t.create.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="ox-btn ox-btn-ghost ox-btn-sm"
                style={{ padding: 6, borderRadius: "50%" }}
              >
                <X size={16} />
              </button>
            </div>

            <form
              action={async (formData) => {
                await createArticle(formData);
                setIsCreateOpen(false);
              }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  {t.form.nameLabel} <span style={{ color: "var(--bad)" }}>*</span>
                </label>
                <input
                  name="name"
                  required
                  placeholder={t.form.namePlaceholder}
                  className="ox-input"
                  style={{ width: "100%" }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  {t.form.detailsLabel}
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder={t.form.detailsPlaceholder}
                  className="ox-textarea"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    {t.form.priceLabel} <span style={{ color: "var(--bad)" }}>*</span>
                  </label>
                  <input
                    name="unitPriceXof"
                    type="number"
                    required
                    placeholder={t.form.pricePlaceholder}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    {t.form.categoryLabel}
                  </label>
                  <select name="category" className="ox-select" style={{ width: "100%" }}>
                    {ARTICLE_CATEGORY_KEYS.map((key) => (
                      <option key={key} value={key}>{articleCategoryOptionLabel(copy, key)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    {t.form.taxLabel}
                  </label>
                  <select name="taxRatePct" className="ox-select" style={{ width: "100%" }}>
                    <option value="0">{t.form.taxOption.zero}</option>
                    <option value="18">{t.form.taxOption.eighteen}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    {t.form.unitLabel}
                  </label>
                  <input
                    name="unit"
                    defaultValue="1"
                    placeholder={t.form.unitPlaceholder}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="ox-btn ox-btn-ghost"
                >
                  {t.form.cancel}
                </button>
                <button type="submit" className="ox-btn">
                  {t.form.createSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modification */}
      {editingArticle && (
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
            if (e.target === e.currentTarget) setEditingArticle(null);
          }}
        >
          <div
            className="ox-glass"
            style={{
              width: "100%",
              maxWidth: 500,
              borderRadius: 20,
              padding: "1.75rem",
              background: "rgba(10, 24, 34, 0.95)",
              border: "1px solid var(--ice-border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{t.edit.title}</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", opacity: 0.65 }}>
                  {t.edit.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="ox-btn ox-btn-ghost ox-btn-sm"
                style={{ padding: 6, borderRadius: "50%" }}
              >
                <X size={16} />
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateArticle(formData);
                setEditingArticle(null);
              }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <input type="hidden" name="id" value={editingArticle.id} />

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  {t.form.nameLabel} <span style={{ color: "var(--bad)" }}>*</span>
                </label>
                <input
                  name="name"
                  required
                  defaultValue={editingArticle.name}
                  className="ox-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                  {t.form.detailsLabel}
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingArticle.description || ""}
                  className="ox-textarea"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    {t.form.priceLabel} <span style={{ color: "var(--bad)" }}>*</span>
                  </label>
                  <input
                    name="unitPriceXof"
                    type="number"
                    required
                    defaultValue={editingArticle.unitPriceXof}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    {t.form.categoryLabel}
                  </label>
                  <select
                    name="category"
                    defaultValue={editingArticle.category || "SERVICE"}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    {ARTICLE_CATEGORY_KEYS.map((key) => (
                      <option key={key} value={key}>{articleCategoryOptionLabel(copy, key)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    {t.form.taxLabel}
                  </label>
                  <select
                    name="taxRatePct"
                    defaultValue={editingArticle.taxRatePct}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="0">{t.form.taxOption.zero}</option>
                    <option value="18">{t.form.taxOption.eighteen}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 5 }}>
                    {t.form.unitLabel}
                  </label>
                  <input
                    name="unit"
                    defaultValue={editingArticle.unit || "1"}
                    className="ox-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="activeArt"
                  name="active"
                  defaultChecked={editingArticle.active}
                  value="true"
                  style={{ width: 16, height: 16, accentColor: "var(--brand)" }}
                />
                <label htmlFor="activeArt" style={{ fontSize: "0.85rem", cursor: "pointer" }}>
                  {t.form.activeLabel}
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="ox-btn ox-btn-ghost"
                >
                  {t.form.cancel}
                </button>
                <button type="submit" className="ox-btn">
                  {t.form.editSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
