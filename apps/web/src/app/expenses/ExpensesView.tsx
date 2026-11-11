"use client";

import { useState, useTransition, useMemo } from "react";
import {
  DollarSign,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  Printer,
  Trash2,
  Building2,
  Zap,
  Droplets,
  Wifi,
  Wrench,
  Truck,
  FileCheck,
  XCircle,
} from "lucide-react";
import { formatXof } from "@/lib/format";
import { usePrefs } from "@/components/PrefsProvider";
import {
  adminCopy,
  EXPENSE_CATEGORY_KEYS,
  type ExpenseCategoryKey,
  isExpenseCategory,
  paymentMethodLabel,
} from "@/lib/i18n/messages/admin";
import {
  createExpense,
  markExpensePaid,
  deleteExpense,
  generatePurchaseOrderNumber,
} from "./actions";
import { PurchaseOrderDocument } from "./PurchaseOrderDocument";

export type ExpenseData = {
  id: string;
  expenseNumber: string;
  category: string;
  title: string;
  description: string | null;
  supplierName: string;
  supplierPhone: string | null;
  supplierEmail: string | null;
  proformaRef: string | null;
  purchaseOrderNo: string | null;
  amountHtXof: number;
  taxXof: number;
  amountTtcXof: number;
  status: string; // "A_PAYER" | "PAYE"
  paymentMethod: string | null;
  paymentDate: string | null;
  paymentReference: string | null;
  invoiceFileUrl: string | null;
  serviceDate: string;
  dueDate: string | null;
  deliveryAddress: string | null;
  deliveryDate: string | null;
  paymentTerms: string | null;
  budgetLine: string | null;
  fundingSource: string | null;
  taxRatePct: number;
  authorizedByName: string | null;
  authorizedTitle: string | null;
  authorizedAt: string | null;
  supplierAcceptedByName: string | null;
  supplierAcceptedAt: string | null;
  lines: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string | null;
    unitPriceXof: number;
    totalXof: number;
  }>;
  registeredBy: string | null;
  createdAt: string;
};

export type SalaryPaymentRow = {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  amountXof: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string | null;
  status: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
};

/** Icône et couleur de chaque catégorie ; le libellé vient du dictionnaire. */
const CATEGORY_STYLE: Record<
  ExpenseCategoryKey,
  { icon: React.ComponentType<{ size?: number }>; color: string }
> = {
  PRESTATAIRE_SERVICE: { icon: Wrench, color: "var(--info-fg)" },
  ELECTRICITE_SBEE: { icon: Zap, color: "var(--warning-fg)" },
  EAU_SONEB: { icon: Droplets, color: "var(--info-fg)" },
  INTERNET_TELECOM: { icon: Wifi, color: "var(--purple-fg)" },
  LOYER: { icon: Building2, color: "var(--success-fg)" },
  CARBURANT: { icon: Truck, color: "var(--purple-fg)" },
  FOURNITURES_BUREAU: { icon: FileText, color: "var(--text-subtle)" },
  OUTILLAGE_ATELIER: { icon: Wrench, color: "var(--warning-fg)" },
  AUTRE_CHARGE: { icon: DollarSign, color: "var(--text-muted)" },
};

const EXPENSE_PAYMENT_METHODS = ["VIREMENT", "CHEQUE", "MOBILE_MONEY", "ESPECES"] as const;

type PurchaseOrderLineDraft = {
  description: string;
  quantity: string;
  unit: string;
  unitPriceXof: string;
};

const emptyPurchaseOrderLine = (): PurchaseOrderLineDraft => ({
  description: "",
  quantity: "1",
  unit: "U",
  unitPriceXof: "",
});

export function ExpensesView({
  initialExpenses,
  initialSalaryPayments,
  canViewPayroll = false,
  currentUserRole,
  currentUserName,
  currentYear,
}: {
  currentUserRole?: string;
  currentUserName?: string;
  initialExpenses: ExpenseData[];
  initialSalaryPayments: SalaryPaymentRow[];
  canViewPayroll?: boolean;
  currentYear: number;
}) {
  const [expenses, setExpenses] = useState<ExpenseData[]>(initialExpenses);
  const [isPending, startTransition] = useTransition();

  const { locale } = usePrefs();
  const copy = adminCopy[locale];
  const expensesCopy = copy.expenses;

  /** Même rendu que formatLocalDate côté lib, mais dans la langue choisie. */
  const formatLocalDate = (value: Date | string | null | undefined) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat(copy.dateLocale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(typeof value === "string" ? new Date(value) : value);
  };

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState<"PO" | "EXPENSE">("PO");
  const [payingExpense, setPayingExpense] = useState<ExpenseData | null>(null);
  const [viewingPO, setViewingPO] = useState<ExpenseData | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    category: "PRESTATAIRE_SERVICE",
    title: "",
    description: "",
    supplierName: "",
    supplierPhone: "",
    supplierEmail: "",
    proformaRef: "",
    withPurchaseOrder: true,
    amountHtXof: "",
    taxXof: "0",
    amountTtcXof: "",
    status: "A_PAYER",
    serviceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
    taxRatePct: "0",
    paymentTerms: "Paiement à 30 jours après réception de la facture",
    deliveryAddress: "CARZONE SARL, Zone Maro-Militaire, Gbèdomidji, Cotonou, Bénin",
    deliveryDate: "",
    budgetLine: "",
    fundingSource: "",
    authorizedTitle: "",
  });
  const [poLines, setPoLines] = useState<PurchaseOrderLineDraft[]>([emptyPurchaseOrderLine()]);

  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "VIREMENT",
    paymentReference: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  // KPI Calculations
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (selectedCategory !== "ALL" && e.category !== selectedCategory) return false;
      if (selectedStatus !== "ALL" && e.status !== selectedStatus) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchSupplier = e.supplierName.toLowerCase().includes(q);
        const matchNum = e.expenseNumber.toLowerCase().includes(q);
        const matchPo = e.purchaseOrderNo?.toLowerCase().includes(q) ?? false;
        const matchPf = e.proformaRef?.toLowerCase().includes(q) ?? false;
        if (!matchTitle && !matchSupplier && !matchNum && !matchPo && !matchPf) return false;
      }
      return true;
    });
  }, [expenses, selectedCategory, selectedStatus, searchTerm]);

  const totalTtcFiltered = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amountTtcXof, 0);
  }, [filteredExpenses]);

  const totalPaid = useMemo(() => {
    return expenses.filter((e) => e.status === "PAYE").reduce((sum, e) => sum + e.amountTtcXof, 0);
  }, [expenses]);

  const totalPending = useMemo(() => {
    return expenses.filter((e) => e.status === "A_PAYER").reduce((sum, e) => sum + e.amountTtcXof, 0);
  }, [expenses]);

  const totalProviders = useMemo(() => {
    return expenses
      .filter((e) => e.category === "PRESTATAIRE_SERVICE")
      .reduce((sum, e) => sum + e.amountTtcXof, 0);
  }, [expenses]);

  const totalSalariesPaidYear = useMemo(() => {
    return initialSalaryPayments.reduce((sum, s) => sum + s.amountXof, 0);
  }, [initialSalaryPayments]);

  const poSubtotal = useMemo(
    () =>
      poLines.reduce(
        (sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unitPriceXof) || 0),
        0
      ),
    [poLines]
  );
  const poTax = useMemo(
    () => Math.round((poSubtotal * (Number(formData.taxRatePct) || 0)) / 100),
    [poSubtotal, formData.taxRatePct]
  );
  const poTotal = poSubtotal + poTax;

  const handleOpenCreateModal = async (mode: "PO" | "EXPENSE" = "PO") => {
    setCreateMode(mode);
    setPoLines([emptyPurchaseOrderLine()]);
    setFormData({
      category: mode === "PO" ? "PRESTATAIRE_SERVICE" : "AUTRE_CHARGE",
      title: "",
      description: "",
      supplierName: "",
      supplierPhone: "",
      supplierEmail: "",
      proformaRef: "",
      withPurchaseOrder: mode === "PO",
      amountHtXof: "",
      taxXof: "0",
      amountTtcXof: "",
      status: "A_PAYER",
      serviceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      taxRatePct: "0",
      paymentTerms: "Paiement à 30 jours après réception de la facture",
      deliveryAddress: "CARZONE SARL, Zone Maro-Militaire, Gbèdomidji, Cotonou, Bénin",
      deliveryDate: "",
      budgetLine: "",
      fundingSource: "",
      authorizedTitle: "",
    });
    setShowCreateModal(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const isPurchaseOrder = formData.withPurchaseOrder;
        let poNo: string | undefined = undefined;
        if (isPurchaseOrder) {
          poNo = await generatePurchaseOrderNumber();
        }

        const created = await createExpense({
          category: formData.category,
          title: formData.title,
          description: formData.description,
          supplierName: formData.supplierName,
          supplierPhone: formData.supplierPhone,
          supplierEmail: formData.supplierEmail,
          proformaRef: formData.proformaRef,
          purchaseOrderNo: poNo,
          amountHtXof: isPurchaseOrder ? poSubtotal : Number(formData.amountHtXof) || Number(formData.amountTtcXof),
          taxXof: isPurchaseOrder ? poTax : Number(formData.taxXof) || 0,
          amountTtcXof: isPurchaseOrder ? poTotal : Number(formData.amountTtcXof),
          status: formData.status,
          serviceDate: formData.serviceDate,
          dueDate: formData.dueDate,
          taxRatePct: Number(formData.taxRatePct) || 0,
          deliveryAddress: formData.deliveryAddress,
          deliveryDate: formData.deliveryDate,
          paymentTerms: formData.paymentTerms,
          budgetLine: formData.budgetLine,
          fundingSource: formData.fundingSource,
          authorizedByName: currentUserName,
          authorizedTitle: formData.authorizedTitle,
          lines: isPurchaseOrder
            ? poLines
                .filter((line) => line.description.trim() && Number(line.quantity) > 0)
                .map((line) => ({
                  description: line.description,
                  quantity: Number(line.quantity) || 0,
                  unit: line.unit,
                  unitPriceXof: Number(line.unitPriceXof) || 0,
                }))
            : undefined,
        });

        setExpenses((prev) => [
          {
            ...created,
            serviceDate: created.serviceDate.toISOString(),
            dueDate: created.dueDate ? created.dueDate.toISOString() : null,
            paymentDate: created.paymentDate ? created.paymentDate.toISOString() : null,
            deliveryDate: created.deliveryDate ? created.deliveryDate.toISOString() : null,
            authorizedAt: created.authorizedAt ? created.authorizedAt.toISOString() : null,
            supplierAcceptedAt: created.supplierAcceptedAt ? created.supplierAcceptedAt.toISOString() : null,
            lines: created.lines.map((line) => ({
              id: line.id,
              description: line.description,
              quantity: line.quantity,
              unit: line.unit,
              unitPriceXof: line.unitPriceXof,
              totalXof: line.totalXof,
            })),
            createdAt: created.createdAt.toISOString(),
          },
          ...prev,
        ]);
        setShowCreateModal(false);
      } catch (err) {
        alert(err instanceof Error ? err.message : expensesCopy.alerts.errCreate);
      }
    });
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingExpense) return;
    startTransition(async () => {
      try {
        const updated = await markExpensePaid(payingExpense.id, paymentForm);
        setExpenses((prev) =>
          prev.map((item) =>
            item.id === updated.id
              ? {
                  ...item,
                  status: "PAYE",
                  paymentMethod: updated.paymentMethod,
                  paymentReference: updated.paymentReference,
                  paymentDate: updated.paymentDate ? updated.paymentDate.toISOString() : null,
                }
              : item
          )
        );
        setPayingExpense(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : expensesCopy.alerts.errPayment);
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(expensesCopy.alerts.confirmDelete(name))) return;
    startTransition(async () => {
      try {
        await deleteExpense(id);
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      } catch (err) {
        alert(err instanceof Error ? err.message : expensesCopy.alerts.errDelete);
      }
    });
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1400, margin: "0 auto" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, var(--info-soft), var(--success-soft))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-fg)",
                border: "1px solid var(--ice-border)",
              }}
            >
              <DollarSign size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                {expensesCopy.title}
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: "0.85rem", opacity: 0.75 }}>
                {expensesCopy.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button
            onClick={() => window.print()}
            className="ox-btn ox-btn-ghost"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Printer size={16} /> {expensesCopy.printRegister}
          </button>
          <button
            onClick={() => handleOpenCreateModal("PO")}
            className="ox-btn ox-btn-ghost"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <FileText size={16} /> {expensesCopy.newPurchaseOrder}
          </button>
          <button
            onClick={() => handleOpenCreateModal("EXPENSE")}
            className="ox-btn ox-btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> {expensesCopy.newExpense}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="ox-card" style={{ padding: "1.2rem", borderLeft: "4px solid var(--brand)" }}>
          <div style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.4rem" }}>
            {expensesCopy.kpi.total(expenses.length)}
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent-fg)" }}>
            {formatXof(expenses.reduce((s, e) => s + e.amountTtcXof, 0))}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: "0.2rem" }}>
            {expensesCopy.kpi.totalHint}
          </div>
        </div>

        <div className="ox-card" style={{ padding: "1.2rem", borderLeft: "4px solid var(--success)" }}>
          <div style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.4rem" }}>
            {expensesCopy.kpi.paid}
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--success-fg)" }}>
            {formatXof(totalPaid)}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: "0.2rem" }}>
            {expensesCopy.kpi.paidHint}
          </div>
        </div>

        <div className="ox-card" style={{ padding: "1.2rem", borderLeft: "4px solid var(--warn)" }}>
          <div style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.4rem" }}>
            {expensesCopy.kpi.pending}
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--warn)" }}>
            {formatXof(totalPending)}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: "0.2rem" }}>
            {expensesCopy.kpi.pendingHint}
          </div>
        </div>

        <div className="ox-card" style={{ padding: "1.2rem", borderLeft: "4px solid var(--purple)" }}>
          <div style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.4rem" }}>
            {expensesCopy.kpi.providers}
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--purple-fg)" }}>
            {formatXof(totalProviders)}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: "0.2rem" }}>
            {expensesCopy.kpi.providersHint}
          </div>
        </div>

        {canViewPayroll && (
          <div className="ox-card" style={{ padding: "1.2rem", borderLeft: "4px solid var(--info)" }}>
            <div style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.4rem" }}>
              {expensesCopy.kpi.payroll(currentYear)}
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent-fg)" }}>
              {formatXof(totalSalariesPaidYear)}
            </div>
            <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: "0.2rem" }}>
              {expensesCopy.kpi.payrollHint}
            </div>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div
        className="ox-card"
        style={{
          padding: "1rem",
          marginBottom: "1.5rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", flex: 1, minWidth: 280 }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search
              size={16}
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}
            />
            <input
              type="text"
              placeholder={expensesCopy.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ox-input"
              style={{ width: "100%", paddingLeft: 32 }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="ox-select"
            style={{ minWidth: 180 }}
          >
            <option value="ALL">{expensesCopy.allCategories}</option>
            {EXPENSE_CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {expensesCopy.categories[key]}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="ox-select"
            style={{ minWidth: 140 }}
          >
            <option value="ALL">{expensesCopy.allStatuses}</option>
            <option value="A_PAYER">{expensesCopy.statusPendingOption}</option>
            <option value="PAYE">{expensesCopy.statusPaidOption}</option>
          </select>
        </div>

        <div style={{ fontSize: "0.85rem", opacity: 0.75 }}>
          {expensesCopy.totalShown} : <strong style={{ color: "var(--accent-fg)" }}>{formatXof(totalTtcFiltered)}</strong>{" "}
          {expensesCopy.lines(filteredExpenses.length)}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="ox-card" style={{ padding: "1.2rem", overflowX: "auto" }}>
        <table className="ox-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: "0.8rem", opacity: 0.7 }}>
              <th style={{ padding: "0.8rem 1rem" }}>{expensesCopy.table.reference}</th>
              <th style={{ padding: "0.8rem 1rem" }}>{expensesCopy.table.dateAndCategory}</th>
              <th style={{ padding: "0.8rem 1rem" }}>{expensesCopy.table.designation}</th>
              <th style={{ padding: "0.8rem 1rem" }}>{expensesCopy.table.supplier}</th>
              <th style={{ padding: "0.8rem 1rem", textAlign: "right" }}>{expensesCopy.table.amountTtc}</th>
              <th style={{ padding: "0.8rem 1rem" }}>{expensesCopy.table.paymentStatus}</th>
              <th style={{ padding: "0.8rem 1rem", textAlign: "right" }}>{copy.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "2.5rem", textAlign: "center", opacity: 0.6 }}>
                  {expensesCopy.empty}
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => {
                const cat = isExpenseCategory(exp.category)
                  ? {
                      ...CATEGORY_STYLE[exp.category],
                      label: expensesCopy.categories[exp.category],
                    }
                  : {
                      ...CATEGORY_STYLE.AUTRE_CHARGE,
                      label: expensesCopy.categories.AUTRE_CHARGE,
                    };
                const IconComponent = cat.icon;

                return (
                  <tr key={exp.id} style={{ borderTop: "1px solid var(--ice-border)" }}>
                    <td style={{ padding: "0.8rem 1rem" }}>
                      <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.85rem" }}>
                        {exp.expenseNumber}
                      </div>
                      {exp.purchaseOrderNo && (
                        <div
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                            color: "var(--accent-fg)",
                            marginTop: 2,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <FileCheck size={12} />
                          {exp.purchaseOrderNo}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "0.8rem 1rem" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                        {formatLocalDate(exp.serviceDate)}
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.75rem",
                          color: cat.color,
                          background: `${cat.color}15`,
                          padding: "1px 6px",
                          borderRadius: 4,
                          marginTop: 3,
                        }}
                      >
                        <IconComponent size={11} />
                        {cat.label}
                      </div>
                    </td>

                    <td style={{ padding: "0.8rem 1rem", maxWidth: 260 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{exp.title}</div>
                      {exp.description && (
                        <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: 2 }}>
                          {exp.description}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "0.8rem 1rem" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{exp.supplierName}</div>
                      {exp.proformaRef && (
                        <div style={{ fontSize: "0.75rem", opacity: 0.7, color: "var(--accent-fg)" }}>
                          {expensesCopy.proforma(exp.proformaRef)}
                        </div>
                      )}
                      {exp.supplierPhone && (
                        <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>{expensesCopy.phone(exp.supplierPhone)}</div>
                      )}
                    </td>

                    <td style={{ padding: "0.8rem 1rem", textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                        {formatXof(exp.amountTtcXof)}
                      </div>
                      {exp.taxXof > 0 && (
                        <div style={{ fontSize: "0.72rem", opacity: 0.6 }}>
                          {expensesCopy.ht(formatXof(exp.amountHtXof))}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "0.8rem 1rem" }}>
                      {exp.status === "PAYE" ? (
                        <div>
                          <span
                            style={{
                              background: "var(--success-soft)",
                              color: "var(--success-fg)",
                              border: "1px solid var(--success)",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <CheckCircle2 size={12} /> {expensesCopy.paidBadge}
                          </span>
                          {exp.paymentDate && (
                            <div style={{ fontSize: "0.7rem", opacity: 0.65, marginTop: 2 }}>
                              {expensesCopy.paidOn(
                                formatLocalDate(exp.paymentDate),
                                paymentMethodLabel(copy, exp.paymentMethod) || expensesCopy.defaultMethod
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span
                            style={{
                              background: "var(--warning-soft)",
                              color: "var(--warn)",
                              border: "1px solid var(--warning)",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Clock size={12} /> {expensesCopy.pendingBadge}
                          </span>
                          {exp.dueDate && (
                            <div style={{ fontSize: "0.7rem", opacity: 0.65, marginTop: 2 }}>
                              {expensesCopy.dueDate(formatLocalDate(exp.dueDate))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "0.8rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                        {exp.purchaseOrderNo && (
                          <button
                            onClick={() => setViewingPO(exp)}
                            title={expensesCopy.viewPurchaseOrderTitle}
                            className="ox-btn ox-btn-ghost"
                            style={{ padding: "4px 8px", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: 3 }}
                          >
                            <FileText size={13} /> {expensesCopy.purchaseOrderShort}
                          </button>
                        )}

                        {exp.status === "A_PAYER" && (
                          <button
                            onClick={() => {
                              setPayingExpense(exp);
                              setPaymentForm({
                                paymentMethod: "VIREMENT",
                                paymentReference: "",
                                paymentDate: new Date().toISOString().split("T")[0],
                              });
                            }}
                            className="ox-btn"
                            style={{
                              padding: "4px 8px",
                              fontSize: "0.78rem",
                              background: "var(--success-soft)",
                              color: "var(--success-fg)",
                              borderColor: "var(--success)",
                            }}
                          >
                            {expensesCopy.payButton}
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(exp.id, exp.title)}
                          title={expensesCopy.deleteTitle}
                          className="ox-btn ox-btn-ghost"
                          style={{ padding: "4px", color: "var(--bad)" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE EXPENSE & PURCHASE ORDER */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div
          className="ox-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--surface-sunken)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1rem",
            overflowY: "auto",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div
            className="ox-modal"
            style={{
              position: "relative",
              background: "var(--ice-bg-mid)",
              border: "1px solid var(--ice-border)",
              borderRadius: 14,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 120, 212, 0.2)",
              color: "var(--ice-text)",
              maxWidth: 680,
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                  {createMode === "PO" ? expensesCopy.newPurchaseOrder : expensesCopy.newExpense}
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "0.8rem", opacity: 0.7 }}>
                  {expensesCopy.createModal.subtitle}
                </p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="ox-btn ox-btn-ghost" style={{ padding: 4 }}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="ox-label">{expensesCopy.createModal.category}</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    {EXPENSE_CATEGORY_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {expensesCopy.categories[key]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="ox-label">{expensesCopy.createModal.serviceDate}</label>
                  <input
                    type="date"
                    required
                    value={formData.serviceDate}
                    onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                    className="ox-input"
                  />
                </div>
              </div>

              {/* Fournisseur & Proforma */}
              <div
                style={{
                  background: "var(--info-soft)",
                  border: "1px solid var(--info)",
                  borderRadius: 10,
                  padding: "0.9rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--accent-fg)" }}>
                  {expensesCopy.createModal.supplierSection}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "0.8rem" }}>
                  <div>
                    <label className="ox-label">{expensesCopy.createModal.supplierName}</label>
                    <input
                      type="text"
                      required
                      placeholder={expensesCopy.createModal.supplierNamePlaceholder}
                      value={formData.supplierName}
                      onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                      className="ox-input"
                    />
                  </div>

                  <div>
                    <label className="ox-label">{expensesCopy.createModal.proforma}</label>
                    <input
                      type="text"
                      placeholder={expensesCopy.createModal.proformaPlaceholder}
                      value={formData.proformaRef}
                      onChange={(e) => setFormData({ ...formData, proformaRef: e.target.value })}
                      className="ox-input"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                  <div>
                    <label className="ox-label">{expensesCopy.createModal.supplierPhone}</label>
                    <input
                      type="tel"
                      placeholder="+229 01 97 00 00 00"
                      value={formData.supplierPhone}
                      onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
                      className="ox-input"
                    />
                  </div>
                  <div>
                    <label className="ox-label">{expensesCopy.createModal.supplierEmail}</label>
                    <input
                      type="email"
                      placeholder="contact@prestataire.bj"
                      value={formData.supplierEmail}
                      onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
                      className="ox-input"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="poCheck"
                    checked={formData.withPurchaseOrder}
                    onChange={(e) => setFormData({ ...formData, withPurchaseOrder: e.target.checked })}
                    style={{ cursor: "pointer", width: 16, height: 16 }}
                  />
                  <label htmlFor="poCheck" style={{ fontSize: "0.82rem", cursor: "pointer", fontWeight: 600 }}>
                    {expensesCopy.createModal.withPurchaseOrder}
                  </label>
                </div>
              </div>

              {/* Prestation Details */}
              <div>
                <label className="ox-label">{expensesCopy.createModal.designation}</label>
                <input
                  type="text"
                  required
                  placeholder={expensesCopy.createModal.designationPlaceholder}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="ox-input"
                />
              </div>

              <div>
                <label className="ox-label">{expensesCopy.createModal.description}</label>
                <textarea
                  rows={2}
                  placeholder={expensesCopy.createModal.descriptionPlaceholder}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="ox-input"
                  style={{ resize: "vertical" }}
                />
              </div>

              {formData.withPurchaseOrder ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--accent-fg)" }}>
                    Détail des biens et services commandés
                  </div>

                  <div style={{ border: "1px solid var(--ice-border)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2.4fr 0.7fr 0.7fr 1fr 1fr 32px", gap: 0, background: "var(--surface-soft)", padding: "0.5rem 0.6rem", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>
                      <span>Désignation</span>
                      <span>Qté</span>
                      <span>Unité</span>
                      <span>P.U. FCFA</span>
                      <span style={{ textAlign: "right" }}>Total</span>
                      <span />
                    </div>
                    {poLines.map((line, index) => {
                      const lineTotal = (Number(line.quantity) || 0) * (Number(line.unitPriceXof) || 0);
                      return (
                        <div key={index} style={{ display: "grid", gridTemplateColumns: "2.4fr 0.7fr 0.7fr 1fr 1fr 32px", gap: 6, alignItems: "center", padding: "0.45rem 0.6rem", borderTop: "1px solid var(--ice-border)" }}>
                          <input
                            className="ox-input"
                            value={line.description}
                            onChange={(e) => setPoLines((prev) => prev.map((item, i) => i === index ? { ...item, description: e.target.value } : item))}
                            placeholder="Description de l'article ou du service"
                            required
                          />
                          <input
                            className="ox-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.quantity}
                            onChange={(e) => setPoLines((prev) => prev.map((item, i) => i === index ? { ...item, quantity: e.target.value } : item))}
                          />
                          <input
                            className="ox-input"
                            value={line.unit}
                            onChange={(e) => setPoLines((prev) => prev.map((item, i) => i === index ? { ...item, unit: e.target.value } : item))}
                          />
                          <input
                            className="ox-input"
                            type="number"
                            min="0"
                            value={line.unitPriceXof}
                            onChange={(e) => setPoLines((prev) => prev.map((item, i) => i === index ? { ...item, unitPriceXof: e.target.value } : item))}
                            placeholder="0"
                          />
                          <span style={{ textAlign: "right", fontWeight: 700, fontSize: "0.82rem" }}>{formatXof(lineTotal)}</span>
                          <button
                            type="button"
                            className="ox-btn ox-btn-ghost"
                            style={{ padding: 2, color: "var(--danger-fg)" }}
                            onClick={() => setPoLines((prev) => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)}
                            aria-label="Supprimer la ligne"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="ox-btn ox-btn-ghost"
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}
                      onClick={() => setPoLines((prev) => [...prev, emptyPurchaseOrderLine()])}
                    >
                      <Plus size={14} /> Ajouter une ligne
                    </button>

                    <div style={{ minWidth: 250, display: "flex", flexDirection: "column", gap: 4, fontSize: "0.85rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Sous-total HT</span>
                        <strong>{formatXof(poSubtotal)}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span>TVA (%)</span>
                        <input
                          className="ox-input"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.taxRatePct}
                          onChange={(e) => setFormData({ ...formData, taxRatePct: e.target.value })}
                          style={{ width: 80, height: 30, textAlign: "right" }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>TVA</span>
                        <strong>{formatXof(poTax)}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--ice-border)", paddingTop: 6, color: "var(--accent-fg)", fontSize: "1rem" }}>
                        <strong>Total TTC</strong>
                        <strong>{formatXof(poTotal)}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                    <div>
                      <label className="ox-label">Conditions de paiement</label>
                      <input className="ox-input" value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} placeholder="Ex. Paiement à 30 jours après réception de la facture" />
                    </div>
                    <div>
                      <label className="ox-label">Date de livraison prévue</label>
                      <input className="ox-input" type="date" value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="ox-label">Adresse de livraison</label>
                      <input className="ox-input" value={formData.deliveryAddress} onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })} />
                    </div>
                    <div>
                      <label className="ox-label">Ligne budgétaire</label>
                      <input className="ox-input" value={formData.budgetLine} onChange={(e) => setFormData({ ...formData, budgetLine: e.target.value })} placeholder="Ex. 1.1.10 - Petits achats" />
                    </div>
                    <div>
                      <label className="ox-label">Source de financement</label>
                      <input className="ox-input" value={formData.fundingSource} onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })} placeholder="Ex. Projet PAMVERC" />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", background: "var(--info-soft)", border: "1px solid var(--info-soft)", borderRadius: 10, padding: "0.8rem" }}>
                    <div>
                      <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>Autorisé par</div>
                      <div style={{ fontWeight: 700, marginTop: 2 }}>{currentUserName || "-"}</div>
                    </div>
                    <div>
                      <label className="ox-label" style={{ marginTop: 0 }}>Fonction du signataire</label>
                      <input className="ox-input" value={formData.authorizedTitle} onChange={(e) => setFormData({ ...formData, authorizedTitle: e.target.value })} placeholder="Ex. Comptable principale" />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.8rem" }}>
                  <div>
                    <label className="ox-label">{expensesCopy.createModal.amountHt}</label>
                    <input
                      type="number"
                      min="0"
                      placeholder={expensesCopy.createModal.amountHtPlaceholder}
                      value={formData.amountHtXof}
                      onChange={(e) => {
                        const ht = e.target.value;
                        const tax = formData.taxXof || "0";
                        const ttc = ht ? String(Number(ht) + Number(tax)) : "";
                        setFormData({ ...formData, amountHtXof: ht, amountTtcXof: ttc });
                      }}
                      className="ox-input"
                    />
                  </div>

                  <div>
                    <label className="ox-label">{expensesCopy.createModal.tax}</label>
                    <input
                      type="number"
                      min="0"
                      placeholder={expensesCopy.createModal.taxPlaceholder}
                      value={formData.taxXof}
                      onChange={(e) => {
                        const tax = e.target.value;
                        const ht = formData.amountHtXof || "0";
                        const ttc = String(Number(ht) + Number(tax));
                        setFormData({ ...formData, taxXof: tax, amountTtcXof: ttc });
                      }}
                      className="ox-input"
                    />
                  </div>

                  <div>
                    <label className="ox-label">{expensesCopy.createModal.amountTtc}</label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder={expensesCopy.createModal.amountTtcPlaceholder}
                      value={formData.amountTtcXof}
                      onChange={(e) => setFormData({ ...formData, amountTtcXof: e.target.value })}
                      className="ox-input"
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="ox-label">{expensesCopy.createModal.initialStatus}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="A_PAYER">{expensesCopy.createModal.statusPendingOption}</option>
                    <option value="PAYE">{expensesCopy.createModal.statusPaidOption}</option>
                  </select>
                </div>

                <div>
                  <label className="ox-label">{expensesCopy.createModal.dueDate}</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="ox-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="ox-btn ox-btn-ghost">
                  {copy.common.cancel}
                </button>
                <button type="submit" disabled={isPending} className="ox-btn ox-btn-primary">
                  {isPending ? expensesCopy.createModal.creating : expensesCopy.createModal.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIRM PAYMENT OF EXPENSE */}
      {/* ========================================================================= */}
      {payingExpense && (
        <div
          className="ox-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--surface-sunken)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1rem",
            overflowY: "auto",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPayingExpense(null);
          }}
        >
          <div
            className="ox-modal"
            style={{
              position: "relative",
              background: "var(--ice-bg-mid)",
              border: "1px solid var(--ice-border)",
              borderRadius: 14,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 120, 212, 0.2)",
              color: "var(--ice-text)",
              maxWidth: 480,
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", fontWeight: 700 }}>
              {expensesCopy.payModal.title}
            </h2>
            <div style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "1rem" }}>
              {expensesCopy.payModal.expenseLabel} : <strong>{payingExpense.expenseNumber}</strong> · {payingExpense.title}
              <div style={{ color: "var(--success-fg)", fontWeight: 700, fontSize: "1.1rem", marginTop: 4 }}>
                {expensesCopy.payModal.amountLabel} : {formatXof(payingExpense.amountTtcXof)}
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="ox-label">{expensesCopy.payModal.methodLabel}</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="ox-select"
                  style={{ width: "100%" }}
                >
                  {EXPENSE_PAYMENT_METHODS.map((value) => (
                    <option key={value} value={value}>
                      {copy.payroll.methods[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="ox-label">{expensesCopy.payModal.dateLabel}</label>
                <input
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="ox-input"
                />
              </div>

              <div>
                <label className="ox-label">{expensesCopy.payModal.referenceLabel}</label>
                <input
                  type="text"
                  placeholder={expensesCopy.payModal.referencePlaceholder}
                  value={paymentForm.paymentReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                  className="ox-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setPayingExpense(null)} className="ox-btn ox-btn-ghost">
                  {copy.common.cancel}
                </button>
                <button type="submit" disabled={isPending} className="ox-btn ox-btn-primary">
                  {isPending ? expensesCopy.payModal.validating : expensesCopy.payModal.validate}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW & PRINT PURCHASE ORDER (BON DE COMMANDE) */}
      {/* ========================================================================= */}
      {viewingPO && (
        <div
          className="ox-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--surface-sunken)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1rem",
            overflowY: "auto",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingPO(null);
          }}
        >
          <div
            className="ox-modal"
            style={{
              position: "relative",
              background: "var(--surface-sunken)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85)",
              maxWidth: 920,
              width: "96%",
              maxHeight: "94vh",
              overflowY: "auto",
              padding: 12,
            }}
          >
            <div
              className="no-print"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                padding: "6px 4px 12px",
              }}
            >
              <div style={{ fontSize: "0.85rem", color: "var(--text-strong)", fontWeight: 600 }}>
                {expensesCopy.purchaseOrder.preview}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <a
                  href={`/expenses/${viewingPO.id}/purchase-order/print`}
                  target="_blank"
                  rel="noreferrer"
                  className="ox-btn ox-btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.82rem", textDecoration: "none" }}
                >
                  <Printer size={15} /> Imprimer / PDF
                </a>
                <button
                  type="button"
                  onClick={() => setViewingPO(null)}
                  className="ox-btn ox-btn-ghost"
                  style={{ color: "var(--text-strong)" }}
                >
                  {copy.common.close}
                </button>
              </div>
            </div>
            <PurchaseOrderDocument expense={viewingPO} />
          </div>
        </div>
      )}
    </div>
  );
}
