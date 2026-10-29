"use client";

import { useState, useTransition, useMemo } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  Users,
  Wallet,
  XCircle,
  FileText,
  Printer,
} from "lucide-react";
import { formatXof } from "@/lib/format";
import { usePrefs } from "@/components/PrefsProvider";
import { adminCopy, paymentMethodLabel } from "@/lib/i18n/messages/admin";
import {
  recordSalaryPayment,
  deleteSalaryPayment,
  markAllMonthlySalariesPaid,
} from "../actions";

export type SalaryPaymentData = {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  amountXof: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string | null;
  status: string;
  notes: string | null;
  paidByUserId: string | null;
};

const PAYMENT_METHOD_VALUES = [
  "VIREMENT_ECOBANK",
  "VIREMENT_BOA",
  "VIREMENT",
  "CHEQUE",
  "ESPECES",
  "MOBILE_MONEY",
] as const;

export function PayrollTab({
  employees,
  initialSalaryPayments = [],
  currentYear,
}: {
  employees: Array<{
    id: string;
    employeeNumber: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    departmentId: string | null;
    department?: { id: string; name: string } | null;
    status: string;
    baseSalaryXof: number | null;
    bankName: string | null;
    bankAccountNumber: string | null;
  }>;
  initialSalaryPayments: SalaryPaymentData[];
  currentYear: number;
}) {
  const [payments, setPayments] = useState<SalaryPaymentData[]>(initialSalaryPayments);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");

  const { locale } = usePrefs();
  const copy = adminCopy[locale];
  const payrollCopy = copy.payroll;
  const months = payrollCopy.months.map((label, index) => ({ value: index + 1, label }));

  const [isPending, startTransition] = useTransition();

  // Modals
  const [payingEmployee, setPayingEmployee] = useState<(typeof employees)[0] | null>(null);
  const [payForm, setPayForm] = useState({
    amountXof: 0,
    paymentMethod: "VIREMENT_ECOBANK",
    reference: "",
    notes: "",
  });

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    paymentMethod: "VIREMENT_ECOBANK",
    reference: `VIR-SAL-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
  });

  // Receipt modal
  const [viewingReceipt, setViewingReceipt] = useState<{
    employee: (typeof employees)[0];
    payment: SalaryPaymentData;
  } | null>(null);

  // Active employees with salaries
  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status === "ACTIF"),
    [employees]
  );

  // Total monthly gross payroll (sum of active employees base salaries)
  const totalMonthlyPayroll = useMemo(() => {
    return activeEmployees.reduce((acc, e) => acc + (e.baseSalaryXof || 0), 0);
  }, [activeEmployees]);

  // Payments for selected month & year
  const currentMonthPayments = useMemo(() => {
    return payments.filter(
      (p) => p.month === selectedMonth && p.year === selectedYear
    );
  }, [payments, selectedMonth, selectedYear]);

  // Total paid for selected month & year
  const totalPaidThisMonth = useMemo(() => {
    return currentMonthPayments.reduce((acc, p) => acc + (p.amountXof || 0), 0);
  }, [currentMonthPayments]);

  const remainingToPay = Math.max(0, totalMonthlyPayroll - totalPaidThisMonth);
  const payPercentage = totalMonthlyPayroll > 0 ? Math.round((totalPaidThisMonth / totalMonthlyPayroll) * 100) : 0;

  // Filtered employees
  const filteredList = useMemo(() => {
    return activeEmployees.filter((emp) => {
      const matchSearch =
        `${emp.firstName} ${emp.lastName} ${emp.employeeNumber} ${emp.jobTitle}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const payment = currentMonthPayments.find((p) => p.employeeId === emp.id);
      const isPaid = Boolean(payment && payment.status === "PAYE");

      if (statusFilter === "PAID" && !isPaid) return false;
      if (statusFilter === "PENDING" && isPaid) return false;

      return matchSearch;
    });
  }, [activeEmployees, search, statusFilter, currentMonthPayments]);

  // Open individual pay modal
  const handleOpenPay = (emp: (typeof employees)[0]) => {
    setPayingEmployee(emp);
    setPayForm({
      amountXof: emp.baseSalaryXof || 0,
      paymentMethod: emp.bankName ? "VIREMENT_ECOBANK" : "ESPECES",
      reference: "",
      notes: "",
    });
  };

  // Submit individual salary payment
  const handleSubmitPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingEmployee) return;

    startTransition(async () => {
      try {
        const saved = await recordSalaryPayment({
          employeeId: payingEmployee.id,
          month: selectedMonth,
          year: selectedYear,
          amountXof: Number(payForm.amountXof),
          paymentMethod: payForm.paymentMethod,
          reference: payForm.reference,
          notes: payForm.notes,
        });

        setPayments((prev) => {
          const filtered = prev.filter(
            (p) =>
              !(
                p.employeeId === payingEmployee.id &&
                p.month === selectedMonth &&
                p.year === selectedYear
              )
          );
          return [
            ...filtered,
            {
              ...saved,
              paymentDate: saved.paymentDate.toISOString(),
            },
          ];
        });

        setPayingEmployee(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : payrollCopy.alerts.errSave);
      }
    });
  };

  // Delete payment
  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm(payrollCopy.cancelPaymentTitle)) return;
    startTransition(async () => {
      try {
        await deleteSalaryPayment(paymentId);
        setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      } catch (err) {
        alert(err instanceof Error ? err.message : payrollCopy.alerts.errCancel);
      }
    });
  };

  // Bulk pay all pending
  const handleBulkPay = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await markAllMonthlySalariesPaid({
          month: selectedMonth,
          year: selectedYear,
          paymentMethod: bulkForm.paymentMethod,
          reference: bulkForm.reference,
        });

        // Optimistically update
        setPayments((prev) => {
          const updated = [...prev];
          activeEmployees.forEach((emp) => {
            if (!emp.baseSalaryXof) return;
            const existingIdx = updated.findIndex(
              (p) =>
                p.employeeId === emp.id &&
                p.month === selectedMonth &&
                p.year === selectedYear
            );
            const item: SalaryPaymentData = {
              id: existingIdx >= 0 ? updated[existingIdx].id : `temp-${emp.id}`,
              employeeId: emp.id,
              month: selectedMonth,
              year: selectedYear,
              amountXof: emp.baseSalaryXof,
              paymentDate: new Date().toISOString(),
              paymentMethod: bulkForm.paymentMethod,
              reference: bulkForm.reference || null,
              status: "PAYE",
              notes: "Paiement groupé",
              paidByUserId: null,
            };
            if (existingIdx >= 0) {
              updated[existingIdx] = item;
            } else {
              updated.push(item);
            }
          });
          return updated;
        });

        setShowBulkModal(false);
      } catch (err) {
        alert(err instanceof Error ? err.message : payrollCopy.alerts.errBulk);
      }
    });
  };

  const selectedMonthName =
    months.find((m) => m.value === selectedMonth)?.label || payrollCopy.periodLabel;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Controls: Month & Year Selector */}
      <div
        className="ox-card"
        style={{
          padding: "1.2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.75, fontWeight: 600 }}>{payrollCopy.periodLabel} :</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="ox-select"
              style={{ fontWeight: 600 }}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="ox-select"
              style={{ fontWeight: 600 }}
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>

        {/* Bulk Action */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setShowBulkModal(true)}
            className="ox-btn"
            style={{
              background: "linear-gradient(135deg, rgba(61, 186, 138, 0.2), rgba(61, 186, 138, 0.35))",
              borderColor: "rgba(61, 186, 138, 0.6)",
              color: "var(--ok)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontWeight: 600,
            }}
          >
            <Wallet size={16} /> {payrollCopy.bulkButton(selectedMonthName, String(selectedYear))}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        <div className="ox-card" style={{ padding: "1.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(0, 120, 212, 0.15)",
                color: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={16} />
            </div>
            <span style={{ fontSize: "0.78rem", opacity: 0.7 }}>{payrollCopy.kpi.payrollLabel}</span>
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--ice-text)" }}>
            {formatXof(totalMonthlyPayroll)}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: 4 }}>
            {payrollCopy.kpi.payrollHint(activeEmployees.length)}
          </div>
        </div>

        <div className="ox-card" style={{ padding: "1.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(61, 186, 138, 0.15)",
                color: "var(--ok)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={16} />
            </div>
            <span style={{ fontSize: "0.78rem", opacity: 0.7 }}>{payrollCopy.kpi.paidLabel}</span>
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--ok)" }}>
            {formatXof(totalPaidThisMonth)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--ok)", marginTop: 4 }}>
            {payrollCopy.kpi.paidHint(currentMonthPayments.length, activeEmployees.length, payPercentage)}
          </div>
        </div>

        <div className="ox-card" style={{ padding: "1.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(210, 160, 40, 0.15)",
                color: "var(--warn)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={16} />
            </div>
            <span style={{ fontSize: "0.78rem", opacity: 0.7 }}>{payrollCopy.kpi.remainingLabel(selectedMonthName)}</span>
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: remainingToPay > 0 ? "var(--warn)" : "var(--ok)" }}>
            {formatXof(remainingToPay)}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: 4 }}>
            {remainingToPay === 0 ? payrollCopy.kpi.allClear : payrollCopy.kpi.awaitingTransfer}
          </div>
        </div>
      </div>

      {/* Register Table Section */}
      <div className="ox-card" style={{ padding: "1.2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
              {payrollCopy.registerTitle(selectedMonthName, String(selectedYear))}
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "0.8rem", opacity: 0.7 }}>
              {payrollCopy.registerHint}
            </p>
          </div>

          {/* Search & filter */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", minWidth: 220 }}>
              <Search size={15} style={{ position: "absolute", left: 10, top: 11, opacity: 0.5 }} />
              <input
                type="text"
                placeholder={payrollCopy.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ox-input"
                style={{ paddingLeft: 32, width: "100%" }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | "PAID" | "PENDING")}
              className="ox-select"
            >
              <option value="ALL">{payrollCopy.filterAll}</option>
              <option value="PAID">{payrollCopy.filterPaid}</option>
              <option value="PENDING">{payrollCopy.filterPending}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="ox-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: "0.78rem", opacity: 0.7 }}>
                <th style={{ padding: "0.8rem 1rem" }}>{payrollCopy.table.employee}</th>
                <th style={{ padding: "0.8rem 1rem" }}>{payrollCopy.table.jobAndDepartment}</th>
                <th style={{ padding: "0.8rem 1rem" }}>{payrollCopy.table.bankAccount}</th>
                <th style={{ padding: "0.8rem 1rem", textAlign: "right" }}>{payrollCopy.table.baseSalary}</th>
                <th style={{ padding: "0.8rem 1rem", textAlign: "center" }}>{payrollCopy.table.payStatus}</th>
                <th style={{ padding: "0.8rem 1rem" }}>{payrollCopy.table.settlement}</th>
                <th style={{ padding: "0.8rem 1rem", textAlign: "right" }}>{copy.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>
                    {payrollCopy.empty}
                  </td>
                </tr>
              ) : (
                filteredList.map((emp) => {
                  const payment = currentMonthPayments.find((p) => p.employeeId === emp.id);
                  const isPaid = Boolean(payment && payment.status === "PAYE");

                  return (
                    <tr
                      key={emp.id}
                      style={{
                        borderTop: "1px solid var(--ice-border)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {/* Name & matricule */}
                      <td style={{ padding: "0.8rem 1rem" }}>
                        <div style={{ fontWeight: 600 }}>
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.65 }}>{emp.employeeNumber}</div>
                      </td>

                      {/* Job & department */}
                      <td style={{ padding: "0.8rem 1rem" }}>
                        <div>{emp.jobTitle}</div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.65 }}>
                          {emp.department?.name || payrollCopy.noDepartment}
                        </div>
                      </td>

                      {/* Bank account */}
                      <td style={{ padding: "0.8rem 1rem" }}>
                        {emp.bankName ? (
                          <div>
                            <div style={{ fontWeight: 500 }}>{emp.bankName}</div>
                            <div style={{ fontSize: "0.72rem", opacity: 0.65, fontFamily: "monospace" }}>
                              {emp.bankAccountNumber || payrollCopy.noAccount}
                            </div>
                          </div>
                        ) : (
                          <span style={{ opacity: 0.5, fontSize: "0.75rem" }}>{payrollCopy.cashDesk}</span>
                        )}
                      </td>

                      {/* Base salary */}
                      <td style={{ padding: "0.8rem 1rem", textAlign: "right", fontWeight: 700 }}>
                        {formatXof(emp.baseSalaryXof || 0)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "0.8rem 1rem", textAlign: "center" }}>
                        {isPaid ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              background: "rgba(61, 186, 138, 0.15)",
                              color: "var(--ok)",
                              padding: "3px 8px",
                              borderRadius: 999,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            <CheckCircle2 size={13} /> {payrollCopy.paidBadge}
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              background: "rgba(210, 160, 40, 0.15)",
                              color: "var(--warn)",
                              padding: "3px 8px",
                              borderRadius: 999,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            <Clock size={13} /> {payrollCopy.pendingBadge}
                          </span>
                        )}
                      </td>

                      {/* Payment details */}
                      <td style={{ padding: "0.8rem 1rem", fontSize: "0.78rem" }}>
                        {isPaid && payment ? (
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              {paymentMethodLabel(copy, payment.paymentMethod)}
                            </div>
                            {payment.reference && (
                              <div style={{ opacity: 0.65, fontFamily: "monospace" }}>
                                {payrollCopy.referencePrefix} {payment.reference}
                              </div>
                            )}
                            <div style={{ opacity: 0.5, fontSize: "0.72rem" }}>
                              {payment.paymentDate.slice(0, 10)}
                            </div>
                          </div>
                        ) : (
                          <span style={{ opacity: 0.4 }}>-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "0.8rem 1rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                          {isPaid && payment ? (
                            <>
                              <button
                                onClick={() => setViewingReceipt({ employee: emp, payment })}
                                className="ox-btn ox-btn-ghost"
                                style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                                title={payrollCopy.viewPayslipTitle}
                              >
                                <FileText size={14} /> {payrollCopy.receiptButton}
                              </button>
                              <button
                                onClick={() => handleDeletePayment(payment.id)}
                                className="ox-btn ox-btn-ghost"
                                style={{ padding: "4px 8px", fontSize: "0.75rem", color: "var(--bad)" }}
                                title={payrollCopy.cancelPaymentTitle}
                              >
                                {payrollCopy.cancelPayment}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenPay(emp)}
                              className="ox-btn ox-btn-primary"
                              style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                            >
                              <CreditCard size={14} /> {payrollCopy.payButton}
                            </button>
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
      </div>

      {/* ========================================================================= */}
      {/* MODAL: PAY INDIVIDUAL SALARY */}
      {/* ========================================================================= */}
      {payingEmployee && (
        <div
          className="ox-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <div
            className="ox-modal"
            style={{
              position: "relative",
              maxWidth: 480,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "var(--ice-bg-mid, #0c1a24)",
              border: "1px solid var(--ice-border, rgba(160, 210, 230, 0.25))",
              borderRadius: 14,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 120, 212, 0.15)",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>{payrollCopy.payModal.title}</h2>
                <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                  {payingEmployee.firstName} {payingEmployee.lastName} ({payingEmployee.employeeNumber})
                </div>
              </div>
              <button onClick={() => setPayingEmployee(null)} className="ox-btn ox-btn-ghost" style={{ padding: 4 }}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPay} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div
                style={{
                  background: "rgba(0, 120, 212, 0.08)",
                  border: "1px solid rgba(0, 120, 212, 0.25)",
                  padding: "0.8rem",
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: "0.78rem", opacity: 0.8 }}>{payrollCopy.payModal.periodLabel} :</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--brand)" }}>
                  {selectedMonthName} {selectedYear}
                </div>
                {payingEmployee.bankName && (
                  <div style={{ fontSize: "0.75rem", opacity: 0.75, marginTop: 4 }}>
                    {payrollCopy.payModal.accountLine(
                      payingEmployee.bankName,
                      payingEmployee.bankAccountNumber || payrollCopy.noAccount
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="ox-label">{payrollCopy.payModal.amountLabel}</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={payForm.amountXof}
                  onChange={(e) => setPayForm({ ...payForm, amountXof: Number(e.target.value) })}
                  className="ox-input"
                  style={{ fontWeight: 700, fontSize: "1.1rem" }}
                />
              </div>

              <div>
                <label className="ox-label">{payrollCopy.payModal.methodLabel}</label>
                <select
                  required
                  value={payForm.paymentMethod}
                  onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                  className="ox-select"
                  style={{ width: "100%" }}
                >
                  {PAYMENT_METHOD_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {payrollCopy.methods[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="ox-label">{payrollCopy.payModal.referenceLabel}</label>
                <input
                  type="text"
                  placeholder={payrollCopy.payModal.referencePlaceholder}
                  value={payForm.reference}
                  onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })}
                  className="ox-input"
                />
              </div>

              <div>
                <label className="ox-label">{payrollCopy.payModal.notesLabel}</label>
                <textarea
                  rows={2}
                  placeholder={payrollCopy.payModal.notesPlaceholder}
                  value={payForm.notes}
                  onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                  className="ox-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setPayingEmployee(null)} className="ox-btn ox-btn-ghost">
                  {copy.common.cancel}
                </button>
                <button type="submit" disabled={isPending} className="ox-btn ox-btn-primary">
                  {isPending ? payrollCopy.payModal.validating : payrollCopy.payModal.validate}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BULK PAY ALL PENDING */}
      {/* ========================================================================= */}
      {showBulkModal && (
        <div
          className="ox-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <div
            className="ox-modal"
            style={{
              position: "relative",
              maxWidth: 480,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "var(--ice-bg-mid, #0c1a24)",
              border: "1px solid var(--ice-border, rgba(160, 210, 230, 0.25))",
              borderRadius: 14,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 120, 212, 0.15)",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
                {payrollCopy.bulkModal.title}
              </h2>
              <button onClick={() => setShowBulkModal(false)} className="ox-btn ox-btn-ghost" style={{ padding: 4 }}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleBulkPay} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.85, lineHeight: 1.5 }}>
                {payrollCopy.bulkModal.intro}{" "}
                <strong>{selectedMonthName} {selectedYear}</strong>{" "}
                {payrollCopy.bulkModal.total(formatXof(remainingToPay))}
              </p>

              <div>
                <label className="ox-label">{payrollCopy.bulkModal.methodLabel}</label>
                <select
                  required
                  value={bulkForm.paymentMethod}
                  onChange={(e) => setBulkForm({ ...bulkForm, paymentMethod: e.target.value })}
                  className="ox-select"
                  style={{ width: "100%" }}
                >
                  {PAYMENT_METHOD_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {payrollCopy.methods[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="ox-label">{payrollCopy.bulkModal.referenceLabel}</label>
                <input
                  type="text"
                  required
                  value={bulkForm.reference}
                  onChange={(e) => setBulkForm({ ...bulkForm, reference: e.target.value })}
                  className="ox-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setShowBulkModal(false)} className="ox-btn ox-btn-ghost">
                  {copy.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending || remainingToPay === 0}
                  className="ox-btn ox-btn-primary"
                  style={{ background: "var(--ok)", borderColor: "var(--ok)" }}
                >
                  {isPending ? payrollCopy.bulkModal.running : payrollCopy.bulkModal.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PAYSLIP / RECEIPT VIEW */}
      {/* ========================================================================= */}
      {viewingReceipt && (
        <div
          className="ox-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <div
            className="ox-modal"
            style={{
              position: "relative",
              maxWidth: 550,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              color: "#111827",
              borderRadius: 14,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85)",
              padding: "2rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1.2rem" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0078d4" }}>
                  CARZONE SARL BÉNIN
                </h2>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {payrollCopy.receipt.title}
                </div>
              </div>
              <button onClick={() => setViewingReceipt(null)} className="ox-btn ox-btn-ghost" style={{ padding: 4, color: "#64748b" }}>
                <XCircle size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.2rem", fontSize: "0.85rem" }}>
              <div>
                <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{payrollCopy.receipt.employeeLabel} :</div>
                <div style={{ fontWeight: 700 }}>{viewingReceipt.employee.firstName} {viewingReceipt.employee.lastName}</div>
                <div>{payrollCopy.receipt.staffIdLabel} : <strong>{viewingReceipt.employee.employeeNumber}</strong></div>
                <div>{payrollCopy.receipt.jobLabel} : {viewingReceipt.employee.jobTitle}</div>
              </div>
              <div>
                <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{payrollCopy.receipt.periodLabel} :</div>
                <div style={{ fontWeight: 700 }}>{selectedMonthName} {selectedYear}</div>
                <div>{payrollCopy.receipt.paymentDateLabel} : {viewingReceipt.payment.paymentDate.slice(0, 10)}</div>
                <div>{payrollCopy.receipt.methodLabel} : <strong>{paymentMethodLabel(copy, viewingReceipt.payment.paymentMethod)}</strong></div>
              </div>
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "1rem", marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span>{payrollCopy.receipt.gross}</span>
                <strong>{formatXof(viewingReceipt.payment.amountXof)}</strong>
              </div>
              {viewingReceipt.payment.reference && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748b" }}>
                  <span>{payrollCopy.receipt.referenceLabel} :</span>
                  <span>{viewingReceipt.payment.reference}</span>
                </div>
              )}
              <div style={{ borderTop: "2px solid #cbd5e1", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800, color: "#10b981" }}>
                <span>{payrollCopy.receipt.net}</span>
                <span>{formatXof(viewingReceipt.payment.amountXof)}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => window.print()} className="ox-btn" style={{ background: "#0078d4", color: "#fff", display: "flex", alignItems: "center", gap: 4 }}>
                <Printer size={15} /> {payrollCopy.receipt.print}
              </button>
              <button onClick={() => setViewingReceipt(null)} className="ox-btn ox-btn-ghost" style={{ color: "#64748b" }}>
                {copy.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
