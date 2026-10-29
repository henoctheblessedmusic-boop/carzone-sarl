"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Users,
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  UserCheck,
  Phone,
  Mail,
  Shield,
  Trash2,
  Edit,
  Sparkles,
  Eye,
  Wallet,
} from "lucide-react";
import { PayrollTab, type SalaryPaymentData } from "./components/PayrollTab";
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  createLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  seedStandardHrBase,
} from "./actions";

export type EmployeeData = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  emergencyContact: string | null;
  jobTitle: string;
  departmentId: string | null;
  department?: { id: string; name: string; code: string; color: string | null } | null;
  contractType: string;
  hireDate: string;
  contractEnd: string | null;
  baseSalaryXof: number | null;
  cnssNumber: string | null;
  ifuNumber: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  status: string;
  notes: string | null;
  user?: { id: string; email: string; fullName: string; role: string } | null;
  leaveBalances: Array<{
    id: string;
    year: number;
    allocatedDays: number;
    usedDays: number;
    remainingDays: number;
    leaveTypeCode: string;
  }>;
};

export type DepartmentData = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  _count?: { employees: number };
};

export type LeaveTypeData = {
  id: string;
  name: string;
  code: string;
  daysAllowedPerYear: number;
  isPaid: boolean;
  color: string | null;
};

export type LeaveRequestData = {
  id: string;
  employeeId: string;
  employee: { id: string; firstName: string; lastName: string; employeeNumber: string; jobTitle: string };
  leaveTypeId: string;
  leaveType: { id: string; name: string; code: string; isPaid: boolean };
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string | null;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  attachmentUrl: string | null;
  createdAt: string;
};

export function HRView({
  initialEmployees,
  initialDepartments,
  initialLeaveTypes,
  initialLeaveRequests,
  initialSalaryPayments = [],
  availableUsers,
  currentYear,
}: {
  currentUserRole?: string;
  currentUserId?: string;
  initialEmployees: EmployeeData[];
  initialDepartments: DepartmentData[];
  initialLeaveTypes: LeaveTypeData[];
  initialLeaveRequests: LeaveRequestData[];
  initialSalaryPayments?: SalaryPaymentData[];
  availableUsers: Array<{ id: string; email: string; fullName: string; role: string }>;
  currentYear: number;
}) {
  const [activeTab, setActiveTab] = useState<"personnel" | "conges" | "paie" | "config">("personnel");
  const [isPending, startTransition] = useTransition();

  // Local states
  const [employees, setEmployees] = useState<EmployeeData[]>(initialEmployees);
  const [departments, setDepartments] = useState<DepartmentData[]>(initialDepartments);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeData[]>(initialLeaveTypes);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestData[]>(initialLeaveRequests);
  const [salaryPayments] = useState<SalaryPaymentData[]>(initialSalaryPayments);

  // Filters - Personnel
  const [empSearch, setEmpSearch] = useState("");
  const [empDeptFilter, setEmpDeptFilter] = useState("ALL");
  const [empContractFilter, setEmpContractFilter] = useState("ALL");
  const [empStatusFilter, setEmpStatusFilter] = useState("ALL");

  // Modals
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeData | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<EmployeeData | null>(null);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState("");

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentData | null>(null);

  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveTypeData | null>(null);

  // Form states - Employee
  const [empForm, setEmpForm] = useState({
    employeeNumber: "",
    firstName: "",
    lastName: "",
    gender: "M",
    email: "",
    phone: "",
    address: "",
    city: "Cotonou",
    emergencyContact: "",
    jobTitle: "",
    departmentId: "",
    contractType: "CDI",
    hireDate: new Date().toISOString().split("T")[0],
    contractEnd: "",
    baseSalaryXof: "",
    cnssNumber: "",
    ifuNumber: "",
    bankName: "",
    bankAccountNumber: "",
    status: "ACTIF",
    notes: "",
    userId: "",
  });

  // Form states - Leave Request
  const [leaveForm, setLeaveForm] = useState({
    employeeId: "",
    leaveTypeId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    daysCount: 1,
    reason: "",
    attachmentUrl: "",
  });

  // Form states - Department
  const [deptForm, setDeptForm] = useState({
    name: "",
    code: "",
    description: "",
    color: "#0078d4",
  });

  // Form states - Leave Type
  const [ltForm, setLtForm] = useState({
    name: "",
    code: "",
    daysAllowedPerYear: 24,
    isPaid: true,
    color: "#38bdf8",
  });

  // Open Add Employee Modal
  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setEmpForm({
      employeeNumber: "",
      firstName: "",
      lastName: "",
      gender: "M",
      email: "",
      phone: "",
      address: "",
      city: "Cotonou",
      emergencyContact: "",
      jobTitle: "",
      departmentId: departments[0]?.id || "",
      contractType: "CDI",
      hireDate: new Date().toISOString().split("T")[0],
      contractEnd: "",
      baseSalaryXof: "",
      cnssNumber: "",
      ifuNumber: "",
      bankName: "",
      bankAccountNumber: "",
      status: "ACTIF",
      notes: "",
      userId: "",
    });
    setShowEmployeeModal(true);
  };

  // Open Edit Employee Modal
  const handleOpenEditEmployee = (emp: EmployeeData) => {
    setEditingEmployee(emp);
    setEmpForm({
      employeeNumber: emp.employeeNumber,
      firstName: emp.firstName,
      lastName: emp.lastName,
      gender: emp.gender || "M",
      email: emp.email || "",
      phone: emp.phone || "",
      address: emp.address || "",
      city: emp.city || "Cotonou",
      emergencyContact: emp.emergencyContact || "",
      jobTitle: emp.jobTitle,
      departmentId: emp.departmentId || "",
      contractType: emp.contractType,
      hireDate: emp.hireDate ? emp.hireDate.split("T")[0] : "",
      contractEnd: emp.contractEnd ? emp.contractEnd.split("T")[0] : "",
      baseSalaryXof: emp.baseSalaryXof ? String(emp.baseSalaryXof) : "",
      cnssNumber: emp.cnssNumber || "",
      ifuNumber: emp.ifuNumber || "",
      bankName: emp.bankName || "",
      bankAccountNumber: emp.bankAccountNumber || "",
      status: emp.status,
      notes: emp.notes || "",
      userId: emp.user?.id || "",
    });
    setShowEmployeeModal(true);
  };

  // Submit Employee
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (editingEmployee) {
          const updated = await updateEmployee(editingEmployee.id, {
            ...empForm,
            baseSalaryXof: empForm.baseSalaryXof ? Number(empForm.baseSalaryXof) : null,
            contractEnd: empForm.contractEnd || null,
            departmentId: empForm.departmentId || null,
            userId: empForm.userId || null,
          });
          setEmployees((prev) =>
            prev.map((item) =>
              item.id === editingEmployee.id
                ? {
                    ...item,
                    ...updated,
                    hireDate: updated.hireDate.toISOString(),
                    contractEnd: updated.contractEnd ? updated.contractEnd.toISOString() : null,
                    department: departments.find((d) => d.id === updated.departmentId) || null,
                  }
                : item
            )
          );
        } else {
          const created = await createEmployee({
            ...empForm,
            baseSalaryXof: empForm.baseSalaryXof ? Number(empForm.baseSalaryXof) : undefined,
            contractEnd: empForm.contractEnd || undefined,
            departmentId: empForm.departmentId || undefined,
            userId: empForm.userId || undefined,
          });
          setEmployees((prev) => [
            {
              ...created,
              hireDate: created.hireDate.toISOString(),
              contractEnd: created.contractEnd ? created.contractEnd.toISOString() : null,
              department: departments.find((d) => d.id === created.departmentId) || null,
              leaveBalances: [],
            },
            ...prev,
          ]);
        }
        setShowEmployeeModal(false);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erreur lors de l'enregistrement de l'employé.");
      }
    });
  };

  // Delete Employee
  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`Confirmez-vous la suppression du dossier de ${name} ?`)) return;
    startTransition(async () => {
      try {
        await deleteEmployee(id);
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        if (viewingEmployee?.id === id) setViewingEmployee(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erreur lors de la suppression.");
      }
    });
  };

  // Submit Leave Request
  const handleSaveLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.employeeId || !leaveForm.leaveTypeId) {
      alert("Veuillez sélectionner un employé et un type de congé.");
      return;
    }
    startTransition(async () => {
      try {
        const created = await createLeaveRequest({
          employeeId: leaveForm.employeeId,
          leaveTypeId: leaveForm.leaveTypeId,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          daysCount: Number(leaveForm.daysCount),
          reason: leaveForm.reason,
          attachmentUrl: leaveForm.attachmentUrl,
        });

        const emp = employees.find((e) => e.id === leaveForm.employeeId);
        const lt = leaveTypes.find((t) => t.id === leaveForm.leaveTypeId);

        setLeaveRequests((prev) => [
          {
            ...created,
            startDate: created.startDate.toISOString(),
            endDate: created.endDate.toISOString(),
            approvedAt: null,
            createdAt: created.createdAt.toISOString(),
            employee: emp
              ? {
                  id: emp.id,
                  firstName: emp.firstName,
                  lastName: emp.lastName,
                  employeeNumber: emp.employeeNumber,
                  jobTitle: emp.jobTitle,
                }
              : { id: "", firstName: "", lastName: "", employeeNumber: "", jobTitle: "" },
            leaveType: lt || { id: "", name: "", code: "", isPaid: true },
          },
          ...prev,
        ]);
        setShowLeaveModal(false);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erreur lors de la création de la demande.");
      }
    });
  };

  // Approve Leave
  const handleApproveLeave = async (reqId: string) => {
    startTransition(async () => {
      try {
        await approveLeaveRequest(reqId);
        setLeaveRequests((prev) =>
          prev.map((r) =>
            r.id === reqId ? { ...r, status: "APPROUVE", approvedAt: new Date().toISOString() } : r
          )
        );
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erreur lors de la validation du congé.");
      }
    });
  };

  // Reject Leave
  const handleRejectLeave = async () => {
    if (!rejectingRequestId || !rejectionReasonText.trim()) return;
    startTransition(async () => {
      try {
        await rejectLeaveRequest(rejectingRequestId, rejectionReasonText);
        setLeaveRequests((prev) =>
          prev.map((r) =>
            r.id === rejectingRequestId
              ? { ...r, status: "REFUSE", rejectionReason: rejectionReasonText.trim() }
              : r
          )
        );
        setRejectingRequestId(null);
        setRejectionReasonText("");
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erreur lors du refus de la demande.");
      }
    });
  };

  // Seed standard base
  const handleSeedStandardBase = async () => {
    if (
      !confirm(
        "Voulez-vous initialiser le référentiel RH standard (Départements & Types de congés selon le Code du Travail Béninois et les normes OHADA) ?"
      )
    )
      return;
    startTransition(async () => {
      try {
        await seedStandardHrBase();
        alert("Référentiel RH standard initialisé avec succès ! Rechargement...");
        window.location.reload();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erreur lors de l'initialisation.");
      }
    });
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchSearch =
        `${e.firstName} ${e.lastName} ${e.employeeNumber} ${e.jobTitle} ${e.email || ""} ${e.phone || ""}`
          .toLowerCase()
          .includes(empSearch.toLowerCase());
      const matchDept = empDeptFilter === "ALL" || e.departmentId === empDeptFilter;
      const matchContract = empContractFilter === "ALL" || e.contractType === empContractFilter;
      const matchStatus = empStatusFilter === "ALL" || e.status === empStatusFilter;
      return matchSearch && matchDept && matchContract && matchStatus;
    });
  }, [employees, empSearch, empDeptFilter, empContractFilter, empStatusFilter]);

  // Statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "ACTIF").length;
  const onLeaveEmployees = employees.filter((e) => e.status === "CONGE").length;
  const pendingLeaves = leaveRequests.filter((r) => r.status === "EN_ATTENTE").length;

  return (
    <div className="ox-page" style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem" }}>
      {/* Top Banner Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #0078d4, #005a9e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(0, 120, 212, 0.35)",
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                Ressources Humaines (RH)
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: "0.85rem", opacity: 0.75 }}>
                Gestion du personnel, contrats, congés, soldes et référentiel d&apos;entreprise
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Action */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {activeTab === "personnel" && (
            <button
              onClick={handleOpenAddEmployee}
              className="ox-btn ox-btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Plus size={16} /> Nouveau Salarié
            </button>
          )}
          {activeTab === "conges" && (
            <button
              onClick={() => {
                setLeaveForm({
                  employeeId: employees[0]?.id || "",
                  leaveTypeId: leaveTypes[0]?.id || "",
                  startDate: new Date().toISOString().split("T")[0],
                  endDate: new Date().toISOString().split("T")[0],
                  daysCount: 1,
                  reason: "",
                  attachmentUrl: "",
                });
                setShowLeaveModal(true);
              }}
              className="ox-btn ox-btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Plus size={16} /> Demande de Congé
            </button>
          )}
          {activeTab === "config" && (
            <button
              onClick={handleSeedStandardBase}
              className="ox-btn"
              style={{
                background: "linear-gradient(135deg, rgba(196, 163, 90, 0.2), rgba(196, 163, 90, 0.35))",
                borderColor: "rgba(196, 163, 90, 0.6)",
                color: "var(--gold)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Sparkles size={16} /> Initialiser Normes Bénin / OHADA
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          className="ox-card"
          style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.8rem" }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(0, 120, 212, 0.15)",
              color: "var(--brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={18} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Effectif Total</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{totalEmployees} salariés</div>
          </div>
        </div>

        <div
          className="ox-card"
          style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.8rem" }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(61, 186, 138, 0.15)",
              color: "var(--ok)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Salariés Actifs</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{activeEmployees} en poste ({onLeaveEmployees} en congé)</div>
          </div>
        </div>

        <div
          className="ox-card"
          style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.8rem" }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(210, 160, 40, 0.15)",
              color: "var(--warn)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={18} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Congés en Attente</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{pendingLeaves} demande(s)</div>
          </div>
        </div>

        <div
          className="ox-card"
          style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "0.8rem" }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(126, 200, 227, 0.15)",
              color: "var(--ice-highlight)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building size={18} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Départements</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{departments.length} services</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--ice-border)",
          marginBottom: "1.5rem",
          gap: "1.5rem",
        }}
      >
        <button
          onClick={() => setActiveTab("personnel")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "personnel" ? "2px solid var(--brand)" : "2px solid transparent",
            padding: "0.6rem 0.2rem",
            color: activeTab === "personnel" ? "var(--brand)" : "inherit",
            fontWeight: activeTab === "personnel" ? 600 : 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.95rem",
          }}
        >
          <Users size={16} /> Personnel & Salariés ({employees.length})
        </button>

        <button
          onClick={() => setActiveTab("conges")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "conges" ? "2px solid var(--brand)" : "2px solid transparent",
            padding: "0.6rem 0.2rem",
            color: activeTab === "conges" ? "var(--brand)" : "inherit",
            fontWeight: activeTab === "conges" ? 600 : 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.95rem",
            position: "relative",
          }}
        >
          <Calendar size={16} /> Congés & Absences
          {pendingLeaves > 0 && (
            <span
              style={{
                background: "var(--warn)",
                color: "#000",
                fontSize: "0.7rem",
                fontWeight: 700,
                borderRadius: 999,
                padding: "1px 6px",
              }}
            >
              {pendingLeaves}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("paie")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "paie" ? "2px solid var(--brand)" : "2px solid transparent",
            padding: "0.6rem 0.2rem",
            color: activeTab === "paie" ? "var(--brand)" : "inherit",
            fontWeight: activeTab === "paie" ? 600 : 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.95rem",
          }}
        >
          <Wallet size={16} /> Suivi Paie & Salaires (Comptabilité)
        </button>

        <button
          onClick={() => setActiveTab("config")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "config" ? "2px solid var(--brand)" : "2px solid transparent",
            padding: "0.6rem 0.2rem",
            color: activeTab === "config" ? "var(--brand)" : "inherit",
            fontWeight: activeTab === "config" ? 600 : 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.95rem",
          }}
        >
          <Building size={16} /> Configuration & Référentiel RH
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PERSONNEL & SALARIÉS */}
      {/* ========================================================================= */}
      {activeTab === "personnel" && (
        <div>
          {/* Filters Bar */}
          <div
            className="ox-card"
            style={{
              padding: "0.8rem 1rem",
              marginBottom: "1rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.8rem",
              alignItems: "center",
            }}
          >
            <div style={{ flex: "1 1 240px", position: "relative" }}>
              <Search
                size={16}
                style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}
              />
              <input
                type="text"
                placeholder="Rechercher par nom, matricule, poste, téléphone..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="ox-input"
                style={{ width: "100%", paddingLeft: "2rem" }}
              />
            </div>

            <div style={{ minWidth: 160 }}>
              <select
                value={empDeptFilter}
                onChange={(e) => setEmpDeptFilter(e.target.value)}
                className="ox-select"
                style={{ width: "100%" }}
              >
                <option value="ALL">Tous départements</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: 140 }}>
              <select
                value={empContractFilter}
                onChange={(e) => setEmpContractFilter(e.target.value)}
                className="ox-select"
                style={{ width: "100%" }}
              >
                <option value="ALL">Tous contrats</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="STAGE">Stage</option>
                <option value="PRESTATION">Prestation</option>
                <option value="ESSAI">Période d&apos;essai</option>
              </select>
            </div>

            <div style={{ minWidth: 130 }}>
              <select
                value={empStatusFilter}
                onChange={(e) => setEmpStatusFilter(e.target.value)}
                className="ox-select"
                style={{ width: "100%" }}
              >
                <option value="ALL">Tous statuts</option>
                <option value="ACTIF">Actif</option>
                <option value="CONGE">En Congé</option>
                <option value="SUSPENDU">Suspendu</option>
                <option value="QUITTE">Départ / Quitté</option>
              </select>
            </div>
          </div>

          {/* Employees Table */}
          <div className="ox-card" style={{ overflowX: "auto" }}>
            <table className="ox-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: "0.8rem", opacity: 0.7 }}>
                  <th style={{ padding: "0.8rem 1rem" }}>Matricule</th>
                  <th style={{ padding: "0.8rem 1rem" }}>Salarié</th>
                  <th style={{ padding: "0.8rem 1rem" }}>Poste</th>
                  <th style={{ padding: "0.8rem 1rem" }}>Département</th>
                  <th style={{ padding: "0.8rem 1rem" }}>Contrat</th>
                  <th style={{ padding: "0.8rem 1rem" }}>Contact</th>
                  <th style={{ padding: "0.8rem 1rem" }}>Statut</th>
                  <th style={{ padding: "0.8rem 1rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "3rem", textAlign: "center", opacity: 0.6 }}>
                      Aucun salarié trouvé avec ces critères de recherche.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      style={{
                        borderTop: "1px solid var(--ice-border)",
                        transition: "background 0.2s",
                      }}
                    >
                      <td style={{ padding: "0.8rem 1rem", fontWeight: 600, fontSize: "0.85rem" }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            background: "rgba(255,255,255,0.06)",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {emp.employeeNumber}
                        </span>
                      </td>
                      <td style={{ padding: "0.8rem 1rem" }}>
                        <div style={{ fontWeight: 600 }}>
                          {emp.firstName} {emp.lastName}
                        </div>
                        {emp.user && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--brand)",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Shield size={12} /> Compte: {emp.user.email} ({emp.user.role})
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.8rem 1rem" }}>{emp.jobTitle}</td>
                      <td style={{ padding: "0.8rem 1rem" }}>
                        <span
                          style={{
                            background: "rgba(126, 200, 227, 0.12)",
                            color: "var(--ice-highlight)",
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: "0.8rem",
                          }}
                        >
                          {emp.department?.name || "Non assigné"}
                        </span>
                      </td>
                      <td style={{ padding: "0.8rem 1rem" }}>
                        <span
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          {emp.contractType}
                        </span>
                      </td>
                      <td style={{ padding: "0.8rem 1rem", fontSize: "0.85rem" }}>
                        {emp.phone && (
                          <div>
                            <Phone size={12} style={{ display: "inline", marginRight: 4, opacity: 0.6 }} />
                            {emp.phone}
                          </div>
                        )}
                        {emp.email && (
                          <div style={{ opacity: 0.8 }}>
                            <Mail size={12} style={{ display: "inline", marginRight: 4, opacity: 0.6 }} />
                            {emp.email}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.8rem 1rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: 999,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background:
                              emp.status === "ACTIF"
                                ? "rgba(61, 186, 138, 0.15)"
                                : emp.status === "CONGE"
                                ? "rgba(210, 160, 40, 0.15)"
                                : "rgba(212, 90, 90, 0.15)",
                            color:
                              emp.status === "ACTIF"
                                ? "var(--ok)"
                                : emp.status === "CONGE"
                                ? "var(--warn)"
                                : "var(--bad)",
                          }}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.8rem 1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => setViewingEmployee(emp)}
                            title="Consulter le dossier"
                            className="ox-btn ox-btn-ghost"
                            style={{ padding: "4px 8px" }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenEditEmployee(emp)}
                            title="Modifier"
                            className="ox-btn ox-btn-ghost"
                            style={{ padding: "4px 8px" }}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteEmployee(emp.id, `${emp.firstName} ${emp.lastName}`)
                            }
                            title="Supprimer"
                            className="ox-btn ox-btn-ghost"
                            style={{ padding: "4px 8px", color: "var(--bad)" }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONGÉS & ABSENCES */}
      {/* ========================================================================= */}
      {activeTab === "conges" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Requests Section */}
          <div className="ox-card" style={{ padding: "1.2rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem" }}>
              Demandes de congés &amp; autorisations d&apos;absence
            </h2>

            <div style={{ overflowX: "auto" }}>
              <table className="ox-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: "0.8rem", opacity: 0.7 }}>
                    <th style={{ padding: "0.8rem 1rem" }}>Salarié</th>
                    <th style={{ padding: "0.8rem 1rem" }}>Type de Congé</th>
                    <th style={{ padding: "0.8rem 1rem" }}>Période</th>
                    <th style={{ padding: "0.8rem 1rem" }}>Durée</th>
                    <th style={{ padding: "0.8rem 1rem" }}>Motif</th>
                    <th style={{ padding: "0.8rem 1rem" }}>Statut</th>
                    <th style={{ padding: "0.8rem 1rem", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "2.5rem", textAlign: "center", opacity: 0.6 }}>
                        Aucune demande de congé enregistrée pour le moment.
                      </td>
                    </tr>
                  ) : (
                    leaveRequests.map((req) => (
                      <tr key={req.id} style={{ borderTop: "1px solid var(--ice-border)" }}>
                        <td style={{ padding: "0.8rem 1rem" }}>
                          <div style={{ fontWeight: 600 }}>
                            {req.employee.firstName} {req.employee.lastName}
                          </div>
                          <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{req.employee.employeeNumber}</div>
                        </td>
                        <td style={{ padding: "0.8rem 1rem" }}>
                          <span
                            style={{
                              background: "rgba(0, 120, 212, 0.12)",
                              color: "var(--brand)",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            {req.leaveType.name}
                          </span>
                        </td>
                        <td style={{ padding: "0.8rem 1rem", fontSize: "0.85rem" }}>
                          Du {new Date(req.startDate).toLocaleDateString("fr-FR")} au{" "}
                          {new Date(req.endDate).toLocaleDateString("fr-FR")}
                        </td>
                        <td style={{ padding: "0.8rem 1rem", fontWeight: 600 }}>{req.daysCount} jour(s)</td>
                        <td style={{ padding: "0.8rem 1rem", fontSize: "0.85rem", maxWidth: 200 }}>
                          {req.reason || "-"}
                          {req.rejectionReason && (
                            <div style={{ color: "var(--bad)", fontSize: "0.75rem", marginTop: 2 }}>
                              Motif refus: {req.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "0.8rem 1rem" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 8px",
                              borderRadius: 999,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              background:
                                req.status === "APPROUVE"
                                  ? "rgba(61, 186, 138, 0.15)"
                                  : req.status === "EN_ATTENTE"
                                  ? "rgba(210, 160, 40, 0.15)"
                                  : req.status === "REFUSE"
                                  ? "rgba(212, 90, 90, 0.15)"
                                  : "rgba(255,255,255,0.08)",
                              color:
                                req.status === "APPROUVE"
                                  ? "var(--ok)"
                                  : req.status === "EN_ATTENTE"
                                  ? "var(--warn)"
                                  : req.status === "REFUSE"
                                  ? "var(--bad)"
                                  : "inherit",
                            }}
                          >
                            {req.status === "EN_ATTENTE"
                              ? "En attente"
                              : req.status === "APPROUVE"
                              ? "Approuvé"
                              : req.status === "REFUSE"
                              ? "Refusé"
                              : "Annulé"}
                          </span>
                        </td>
                        <td style={{ padding: "0.8rem 1rem", textAlign: "right" }}>
                          {req.status === "EN_ATTENTE" && (
                            <div style={{ display: "flex", gap: "0.3rem", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => handleApproveLeave(req.id)}
                                title="Approuver"
                                className="ox-btn"
                                style={{
                                  padding: "4px 8px",
                                  background: "rgba(61, 186, 138, 0.2)",
                                  color: "var(--ok)",
                                  borderColor: "var(--ok)",
                                }}
                              >
                                <CheckCircle2 size={15} /> Approuver
                              </button>
                              <button
                                onClick={() => setRejectingRequestId(req.id)}
                                title="Refuser"
                                className="ox-btn"
                                style={{
                                  padding: "4px 8px",
                                  background: "rgba(212, 90, 90, 0.2)",
                                  color: "var(--bad)",
                                  borderColor: "var(--bad)",
                                }}
                              >
                                <XCircle size={15} /> Refuser
                              </button>
                            </div>
                          )}
                          {req.status === "APPROUVE" && (
                            <button
                              onClick={() => {
                                if (confirm("Voulez-vous annuler ce congé validé ? Les jours seront réattribués au solde.")) {
                                  cancelLeaveRequest(req.id).then(() => {
                                    setLeaveRequests((prev) =>
                                      prev.map((r) => (r.id === req.id ? { ...r, status: "ANNULE" } : r))
                                    );
                                  });
                                }
                              }}
                              className="ox-btn ox-btn-ghost"
                              style={{ fontSize: "0.75rem", padding: "2px 6px" }}
                            >
                              Annuler congé
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leave Balances Overview */}
          <div className="ox-card" style={{ padding: "1.2rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem" }}>
              Soldes de congés annuels ({currentYear}) · Norme Bénin (24 jours ouvrables / an)
            </h2>

            <div style={{ overflowX: "auto" }}>
              <table className="ox-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: "0.8rem", opacity: 0.7 }}>
                    <th style={{ padding: "0.8rem 1rem" }}>Matricule</th>
                    <th style={{ padding: "0.8rem 1rem" }}>Salarié</th>
                    <th style={{ padding: "0.8rem 1rem" }}>Département</th>
                    <th style={{ padding: "0.8rem 1rem" }}>Quota Annuel</th>
                    <th style={{ padding: "0.8rem 1rem" }}>Jours Pris</th>
                    <th style={{ padding: "0.8rem 1rem" }}>Solde Restant</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const annualBalance = emp.leaveBalances?.find(
                      (b) => b.leaveTypeCode === "ANNUEL" && b.year === currentYear
                    );
                    const allocated = annualBalance?.allocatedDays ?? 24;
                    const used = annualBalance?.usedDays ?? 0;
                    const remaining = annualBalance?.remainingDays ?? allocated - used;

                    return (
                      <tr key={emp.id} style={{ borderTop: "1px solid var(--ice-border)" }}>
                        <td style={{ padding: "0.8rem 1rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
                          {emp.employeeNumber}
                        </td>
                        <td style={{ padding: "0.8rem 1rem", fontWeight: 600 }}>
                          {emp.firstName} {emp.lastName}
                        </td>
                        <td style={{ padding: "0.8rem 1rem" }}>{emp.department?.name || "-"}</td>
                        <td style={{ padding: "0.8rem 1rem" }}>{allocated} jours</td>
                        <td style={{ padding: "0.8rem 1rem", color: "var(--warn)" }}>{used} jours</td>
                        <td style={{ padding: "0.8rem 1rem" }}>
                          <span
                            style={{
                              fontWeight: 700,
                              color: remaining > 5 ? "var(--ok)" : "var(--bad)",
                            }}
                          >
                            {remaining} jours
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONFIGURATION & RÉFÉRENTIEL RH */}
      {/* ========================================================================= */}
      {activeTab === "config" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
          {/* Departments */}
          <div className="ox-card" style={{ padding: "1.2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Départements & Services</h2>
              <button
                onClick={() => {
                  setEditingDept(null);
                  setDeptForm({ name: "", code: "", description: "", color: "#0078d4" });
                  setShowDeptModal(true);
                }}
                className="ox-btn ox-btn-ghost"
                style={{ fontSize: "0.8rem" }}
              >
                <Plus size={14} /> Ajouter département
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.8rem",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--ice-border)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      {dept.name}
                      {dept.code && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            background: "rgba(0, 120, 212, 0.15)",
                            color: "var(--brand)",
                            padding: "1px 5px",
                            borderRadius: 4,
                          }}
                        >
                          {dept.code}
                        </span>
                      )}
                    </div>
                    {dept.description && (
                      <div style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: 2 }}>{dept.description}</div>
                    )}
                    <div style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: 4 }}>
                      {dept._count?.employees ?? 0} employé(s) rattaché(s)
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button
                      onClick={() => {
                        setEditingDept(dept);
                        setDeptForm({
                          name: dept.name,
                          code: dept.code,
                          description: dept.description || "",
                          color: dept.color || "#0078d4",
                        });
                        setShowDeptModal(true);
                      }}
                      className="ox-btn ox-btn-ghost"
                      style={{ padding: "4px" }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer le département ${dept.name} ?`)) {
                          deleteDepartment(dept.id).then(() => {
                            setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
                          });
                        }
                      }}
                      className="ox-btn ox-btn-ghost"
                      style={{ padding: "4px", color: "var(--bad)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Types */}
          <div className="ox-card" style={{ padding: "1.2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Types de Congés & Rémunérations</h2>
              <button
                onClick={() => {
                  setEditingLeaveType(null);
                  setLtForm({ name: "", code: "", daysAllowedPerYear: 24, isPaid: true, color: "#38bdf8" });
                  setShowLeaveTypeModal(true);
                }}
                className="ox-btn ox-btn-ghost"
                style={{ fontSize: "0.8rem" }}
              >
                <Plus size={14} /> Ajouter type
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {leaveTypes.map((lt) => (
                <div
                  key={lt.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.8rem",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--ice-border)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      {lt.name}
                      <span
                        style={{
                          fontSize: "0.75rem",
                          background: lt.isPaid ? "rgba(61, 186, 138, 0.15)" : "rgba(255,255,255,0.08)",
                          color: lt.isPaid ? "var(--ok)" : "inherit",
                          padding: "1px 5px",
                          borderRadius: 4,
                        }}
                      >
                        {lt.isPaid ? "Rémunéré" : "Non payé"}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: 2 }}>
                      Quota: <strong>{lt.daysAllowedPerYear} jour(s)/an</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button
                      onClick={() => {
                        setEditingLeaveType(lt);
                        setLtForm({
                          name: lt.name,
                          code: lt.code,
                          daysAllowedPerYear: lt.daysAllowedPerYear,
                          isPaid: lt.isPaid,
                          color: lt.color || "#38bdf8",
                        });
                        setShowLeaveTypeModal(true);
                      }}
                      className="ox-btn ox-btn-ghost"
                      style={{ padding: "4px" }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer le type de congé ${lt.name} ?`)) {
                          deleteLeaveType(lt.id).then(() => {
                            setLeaveTypes((prev) => prev.filter((t) => t.id !== lt.id));
                          });
                        }
                      }}
                      className="ox-btn ox-btn-ghost"
                      style={{ padding: "4px", color: "var(--bad)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SUIVI PAIE & SALAIRES (COMPTABILITÉ & DIRECTION) */}
      {/* ========================================================================= */}
      {activeTab === "paie" && (
        <PayrollTab
          employees={employees}
          initialSalaryPayments={salaryPayments}
          currentYear={currentYear}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT EMPLOYEE */}
      {/* ========================================================================= */}
      {showEmployeeModal && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEmployeeModal(false);
          }}
        >
          <div
            className="ox-modal"
            style={{
              position: "relative",
              background: "var(--ice-bg-mid, #0c1a24)",
              border: "1px solid var(--ice-border, rgba(160, 210, 230, 0.25))",
              borderRadius: 14,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 120, 212, 0.2)",
              color: "var(--ice-text, #e8f2f8)",
              maxWidth: 720,
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                {editingEmployee ? `Modifier la fiche : ${editingEmployee.employeeNumber}` : "Nouveau Salarié"}
              </h2>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="ox-btn ox-btn-ghost"
                style={{ padding: 4 }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Identity & Matricule */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="ox-label">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={empForm.firstName}
                    onChange={(e) => setEmpForm({ ...empForm, firstName: e.target.value })}
                    className="ox-input"
                  />
                </div>
                <div>
                  <label className="ox-label">Nom de famille *</label>
                  <input
                    type="text"
                    required
                    value={empForm.lastName}
                    onChange={(e) => setEmpForm({ ...empForm, lastName: e.target.value })}
                    className="ox-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="ox-label">Matricule (optionnel, auto si vide)</label>
                  <input
                    type="text"
                    placeholder="ex: EMP-2026-001"
                    value={empForm.employeeNumber}
                    onChange={(e) => setEmpForm({ ...empForm, employeeNumber: e.target.value })}
                    className="ox-input"
                  />
                </div>
                <div>
                  <label className="ox-label">Poste / Intitulé de fonction *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Conseiller Commercial Senior"
                    value={empForm.jobTitle}
                    onChange={(e) => setEmpForm({ ...empForm, jobTitle: e.target.value })}
                    className="ox-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="ox-label">Département</label>
                  <select
                    value={empForm.departmentId}
                    onChange={(e) => setEmpForm({ ...empForm, departmentId: e.target.value })}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="">Sélectionner un département</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="ox-label">Type de Contrat</label>
                  <select
                    value={empForm.contractType}
                    onChange={(e) => setEmpForm({ ...empForm, contractType: e.target.value })}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="CDI">CDI (Contrat Durée Indéterminée)</option>
                    <option value="CDD">CDD (Contrat Durée Déterminée)</option>
                    <option value="STAGE">Stage Professionnel</option>
                    <option value="PRESTATION">Prestation / Consultant</option>
                    <option value="ESSAI">Période d&apos;essai</option>
                  </select>
                </div>
              </div>

              {/* Dates & Salaire */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="ox-label">Date d&apos;embauche *</label>
                  <input
                    type="date"
                    required
                    value={empForm.hireDate}
                    onChange={(e) => setEmpForm({ ...empForm, hireDate: e.target.value })}
                    className="ox-input"
                  />
                </div>
                <div>
                  <label className="ox-label">Date de fin (si CDD / Stage)</label>
                  <input
                    type="date"
                    value={empForm.contractEnd}
                    onChange={(e) => setEmpForm({ ...empForm, contractEnd: e.target.value })}
                    className="ox-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="ox-label">Salaire de Base Mensuel (XOF)</label>
                  <input
                    type="number"
                    placeholder="ex: 250000"
                    value={empForm.baseSalaryXof}
                    onChange={(e) => setEmpForm({ ...empForm, baseSalaryXof: e.target.value })}
                    className="ox-input"
                  />
                </div>
                <div>
                  <label className="ox-label">Statut</label>
                  <select
                    value={empForm.status}
                    onChange={(e) => setEmpForm({ ...empForm, status: e.target.value })}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="ACTIF">Actif</option>
                    <option value="CONGE">En Congé</option>
                    <option value="SUSPENDU">Suspendu</option>
                    <option value="QUITTE">Départ / Quitté</option>
                  </select>
                </div>
              </div>

              {/* Contact & Social */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="ox-label">Téléphone</label>
                  <input
                    type="text"
                    placeholder="ex: +229 97 00 00 00"
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    className="ox-input"
                  />
                </div>
                <div>
                  <label className="ox-label">Email professionnel / personnel</label>
                  <input
                    type="email"
                    placeholder="ex: prenom.nom@topcarzone.com"
                    value={empForm.email}
                    onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                    className="ox-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="ox-label">Numéro CNSS (Bénin)</label>
                  <input
                    type="text"
                    placeholder="ex: 123456789"
                    value={empForm.cnssNumber}
                    onChange={(e) => setEmpForm({ ...empForm, cnssNumber: e.target.value })}
                    className="ox-input"
                  />
                </div>
                <div>
                  <label className="ox-label">Numéro IFU</label>
                  <input
                    type="text"
                    placeholder="ex: 3202300000000"
                    value={empForm.ifuNumber}
                    onChange={(e) => setEmpForm({ ...empForm, ifuNumber: e.target.value })}
                    className="ox-input"
                  />
                </div>
              </div>

              {/* Banking & Emergency */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="ox-label">Banque</label>
                  <input
                    type="text"
                    placeholder="ex: BOA, Ecobank, UBA..."
                    value={empForm.bankName}
                    onChange={(e) => setEmpForm({ ...empForm, bankName: e.target.value })}
                    className="ox-input"
                  />
                </div>
                <div>
                  <label className="ox-label">N° Compte Bancaire / RIB</label>
                  <input
                    type="text"
                    placeholder="ex: 01001 00000000000 00"
                    value={empForm.bankAccountNumber}
                    onChange={(e) => setEmpForm({ ...empForm, bankAccountNumber: e.target.value })}
                    className="ox-input"
                  />
                </div>
              </div>

              <div>
                <label className="ox-label">Contact d&apos;urgence (Nom + Téléphone)</label>
                <input
                  type="text"
                  placeholder="ex: Conjoint(e) - +229 95 00 00 00"
                  value={empForm.emergencyContact}
                  onChange={(e) => setEmpForm({ ...empForm, emergencyContact: e.target.value })}
                  className="ox-input"
                />
              </div>

              {/* Link with user account */}
              <div>
                <label className="ox-label">Compte Utilisateur Système (Accès logiciel)</label>
                <select
                  value={empForm.userId}
                  onChange={(e) => setEmpForm({ ...empForm, userId: e.target.value })}
                  className="ox-select"
                  style={{ width: "100%" }}
                >
                  <option value="">Aucun compte lié</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} · {u.email} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="ox-btn ox-btn-ghost"
                >
                  Annuler
                </button>
                <button type="submit" disabled={isPending} className="ox-btn ox-btn-primary">
                  {isPending ? "Enregistrement..." : editingEmployee ? "Mettre à jour" : "Créer le salarié"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW EMPLOYEE DETAIL DOSSIER */}
      {/* ========================================================================= */}
      {viewingEmployee && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingEmployee(null);
          }}
        >
          <div
            className="ox-modal"
            style={{
              position: "relative",
              background: "var(--ice-bg-mid, #0c1a24)",
              border: "1px solid var(--ice-border, rgba(160, 210, 230, 0.25))",
              borderRadius: 14,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 120, 212, 0.2)",
              color: "var(--ice-text, #e8f2f8)",
              maxWidth: 680,
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <span
                  style={{
                    fontFamily: "monospace",
                    background: "rgba(0, 120, 212, 0.15)",
                    color: "var(--brand)",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontSize: "0.8rem",
                  }}
                >
                  {viewingEmployee.employeeNumber}
                </span>
                <h2 style={{ margin: "4px 0 0", fontSize: "1.3rem", fontWeight: 700 }}>
                  {viewingEmployee.firstName} {viewingEmployee.lastName}
                </h2>
                <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                  {viewingEmployee.jobTitle} · {viewingEmployee.department?.name || "Non affecté"}
                </div>
              </div>
              <button onClick={() => setViewingEmployee(null)} className="ox-btn ox-btn-ghost" style={{ padding: 4 }}>
                <XCircle size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem" }}>
              {/* Contract Card */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--ice-border)",
                  borderRadius: 8,
                  padding: "0.8rem 1rem",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--ice-highlight)" }}>
                  Informations Contractuelles & Salaire
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div>Type de contrat : <strong>{viewingEmployee.contractType}</strong></div>
                  <div>Statut : <strong>{viewingEmployee.status}</strong></div>
                  <div>
                    Embauche : <strong>{new Date(viewingEmployee.hireDate).toLocaleDateString("fr-FR")}</strong>
                  </div>
                  {viewingEmployee.contractEnd && (
                    <div>
                      Fin de contrat : <strong>{new Date(viewingEmployee.contractEnd).toLocaleDateString("fr-FR")}</strong>
                    </div>
                  )}
                  {viewingEmployee.baseSalaryXof && (
                    <div>
                      Salaire mensuel :{" "}
                      <strong>
                        {Number(viewingEmployee.baseSalaryXof).toLocaleString("fr-FR")} XOF
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Compliance Card */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--ice-border)",
                  borderRadius: 8,
                  padding: "0.8rem 1rem",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--ice-highlight)" }}>
                  Conformité Sociale & Coordonnées Bancaires
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div>N° CNSS : <strong>{viewingEmployee.cnssNumber || "Non renseigné"}</strong></div>
                  <div>N° IFU : <strong>{viewingEmployee.ifuNumber || "Non renseigné"}</strong></div>
                  <div>Banque : <strong>{viewingEmployee.bankName || "Non renseignée"}</strong></div>
                  <div>N° Compte : <strong>{viewingEmployee.bankAccountNumber || "Non renseigné"}</strong></div>
                </div>
              </div>

              {/* Contact Card */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--ice-border)",
                  borderRadius: 8,
                  padding: "0.8rem 1rem",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--ice-highlight)" }}>
                  Coordonnées & Urgence
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div>Téléphone : <strong>{viewingEmployee.phone || "-"}</strong></div>
                  <div>Email : <strong>{viewingEmployee.email || "-"}</strong></div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    Urgence : <strong>{viewingEmployee.emergencyContact || "-"}</strong>
                  </div>
                </div>
              </div>

              {/* Leave balances */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--ice-border)",
                  borderRadius: 8,
                  padding: "0.8rem 1rem",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--gold)" }}>
                  Soldes de Congés ({currentYear})
                </div>
                {viewingEmployee.leaveBalances && viewingEmployee.leaveBalances.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {viewingEmployee.leaveBalances.map((b) => (
                      <div
                        key={b.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 0",
                          borderBottom: "1px dashed rgba(255,255,255,0.06)",
                        }}
                      >
                        <span>Congé {b.leaveTypeCode}</span>
                        <span>
                          Pris: <strong>{b.usedDays}j</strong> / Alloué: <strong>{b.allocatedDays}j</strong> (Restant:{" "}
                          <strong style={{ color: "var(--ok)" }}>{b.remainingDays}j</strong>)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ opacity: 0.6 }}>Aucun solde initialisé. Initialiser via l&apos;onglet Configuration.</div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.2rem" }}>
              <button
                onClick={() => {
                  const emp = viewingEmployee;
                  setViewingEmployee(null);
                  handleOpenEditEmployee(emp);
                }}
                className="ox-btn ox-btn-primary"
              >
                Modifier le dossier
              </button>
              <button onClick={() => setViewingEmployee(null)} className="ox-btn ox-btn-ghost">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE LEAVE REQUEST */}
      {/* ========================================================================= */}
      {showLeaveModal && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLeaveModal(false);
          }}
        >
          <div
            className="ox-modal"
            style={{
              position: "relative",
              background: "var(--ice-bg-mid, #0c1a24)",
              border: "1px solid var(--ice-border, rgba(160, 210, 230, 0.25))",
              borderRadius: 14,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 120, 212, 0.2)",
              color: "var(--ice-text, #e8f2f8)",
              maxWidth: 540,
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>Demande de Congé</h2>
              <button onClick={() => setShowLeaveModal(false)} className="ox-btn ox-btn-ghost" style={{ padding: 4 }}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveLeaveRequest} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="ox-label">Salarié concerné *</label>
                {employees.length === 0 ? (
                  <div
                    style={{
                      padding: "0.8rem",
                      background: "rgba(210, 160, 40, 0.12)",
                      border: "1px solid rgba(210, 160, 40, 0.3)",
                      borderRadius: 8,
                      fontSize: "0.85rem",
                      color: "var(--warn)",
                    }}
                  >
                    ⚠️ Aucun salarié enregistré. Veuillez d&apos;abord enregistrer au moins un salarié dans l&apos;onglet Personnel.
                  </div>
                ) : (
                  <select
                    required
                    value={leaveForm.employeeId}
                    onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="">Sélectionner un employé</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} ({e.employeeNumber}) · {e.jobTitle}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="ox-label">Type de congé *</label>
                {leaveTypes.length === 0 ? (
                  <div
                    style={{
                      padding: "0.8rem",
                      background: "rgba(210, 160, 40, 0.12)",
                      border: "1px solid rgba(210, 160, 40, 0.3)",
                      borderRadius: 8,
                      fontSize: "0.85rem",
                      color: "var(--warn)",
                    }}
                  >
                    <p style={{ margin: "0 0 0.5rem" }}>
                      ⚠️ Aucun type de congé n&apos;est configuré dans le référentiel.
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        await handleSeedStandardBase();
                      }}
                      className="ox-btn"
                      style={{
                        fontSize: "0.8rem",
                        padding: "5px 12px",
                        background: "var(--brand)",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Sparkles size={14} />
                      Charger les types légaux (Bénin 24j, Maladie, Maternité...)
                    </button>
                  </div>
                ) : (
                  <select
                    required
                    value={leaveForm.leaveTypeId}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveTypeId: e.target.value })}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="">Sélectionner le type</option>
                    {leaveTypes.map((lt) => (
                      <option key={lt.id} value={lt.id}>
                        {lt.name} ({lt.isPaid ? "Rémunéré" : "Non payé"}) · {lt.daysAllowedPerYear}j max
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="ox-label">Date de début *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="ox-input"
                  />
                </div>
                <div>
                  <label className="ox-label">Date de fin *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="ox-input"
                  />
                </div>
              </div>

              <div>
                <label className="ox-label">Nombre de jours ouvrables *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={leaveForm.daysCount}
                  onChange={(e) => setLeaveForm({ ...leaveForm, daysCount: Number(e.target.value) })}
                  className="ox-input"
                />
              </div>

              <div>
                <label className="ox-label">Motif ou justification</label>
                <textarea
                  rows={2}
                  placeholder="ex: Vacances annuelles, événement familial, consultation..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="ox-input"
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setShowLeaveModal(false)} className="ox-btn ox-btn-ghost">
                  Annuler
                </button>
                <button type="submit" disabled={isPending} className="ox-btn ox-btn-primary">
                  {isPending ? "Soumission..." : "Soumettre la demande"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT REASON */}
      {/* ========================================================================= */}
      {rejectingRequestId && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setRejectingRequestId(null);
              setRejectionReasonText("");
            }
          }}
        >
          <div
            className="ox-modal"
            style={{
              position: "relative",
              background: "var(--ice-bg-mid, #0c1a24)",
              border: "1px solid var(--ice-border, rgba(160, 210, 230, 0.25))",
              borderRadius: 14,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 120, 212, 0.2)",
              color: "var(--ice-text, #e8f2f8)",
              maxWidth: 480,
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            <h2 style={{ margin: "0 0 0.8rem", fontSize: "1.1rem", fontWeight: 700, color: "var(--bad)" }}>
              Refus de la demande de congé
            </h2>
            <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "1rem" }}>
              Veuillez indiquer le motif du refus qui sera notifié et archivé.
            </p>

            <textarea
              rows={3}
              required
              placeholder="ex: Période de forte affluence en atelier, justificatif médical manquant..."
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              className="ox-input"
              style={{ width: "100%", marginBottom: "1rem" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => {
                  setRejectingRequestId(null);
                  setRejectionReasonText("");
                }}
                className="ox-btn ox-btn-ghost"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!rejectionReasonText.trim() || isPending}
                onClick={handleRejectLeave}
                className="ox-btn"
                style={{ background: "var(--bad)", color: "#fff", borderColor: "var(--bad)" }}
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DEPARTMENT */}
      {/* ========================================================================= */}
      {showDeptModal && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeptModal(false);
          }}
        >
          <div
            className="ox-modal"
            style={{
              position: "relative",
              background: "var(--ice-bg-mid, #0c1a24)",
              border: "1px solid var(--ice-border, rgba(160, 210, 230, 0.25))",
              borderRadius: 14,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 120, 212, 0.2)",
              color: "var(--ice-text, #e8f2f8)",
              maxWidth: 480,
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                {editingDept ? "Modifier le département" : "Nouveau département"}
              </h2>
              <button onClick={() => setShowDeptModal(false)} className="ox-btn ox-btn-ghost" style={{ padding: 4 }}>
                <XCircle size={20} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                startTransition(async () => {
                  try {
                    if (editingDept) {
                      const updated = await updateDepartment(editingDept.id, deptForm);
                      setDepartments((prev) => prev.map((d) => (d.id === editingDept.id ? { ...d, ...updated } : d)));
                    } else {
                      const created = await createDepartment(deptForm);
                      setDepartments((prev) => [...prev, created]);
                    }
                    setShowDeptModal(false);
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Erreur enregistrement.");
                  }
                });
              }}
              style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
            >
              <div>
                <label className="ox-label">Nom du département *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Logistique & Magasin"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="ox-input"
                />
              </div>

              <div>
                <label className="ox-label">Code trigramme *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: LOG"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="ox-input"
                />
              </div>

              <div>
                <label className="ox-label">Description / Rôle</label>
                <textarea
                  rows={2}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="ox-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setShowDeptModal(false)} className="ox-btn ox-btn-ghost">
                  Annuler
                </button>
                <button type="submit" disabled={isPending} className="ox-btn ox-btn-primary">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LEAVE TYPE */}
      {/* ========================================================================= */}
      {showLeaveTypeModal && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLeaveTypeModal(false);
          }}
        >
          <div
            className="ox-modal"
            style={{
              position: "relative",
              background: "var(--ice-bg-mid, #0c1a24)",
              border: "1px solid var(--ice-border, rgba(160, 210, 230, 0.25))",
              borderRadius: 14,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 120, 212, 0.2)",
              color: "var(--ice-text, #e8f2f8)",
              maxWidth: 480,
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                {editingLeaveType ? "Modifier type de congé" : "Nouveau type de congé"}
              </h2>
              <button onClick={() => setShowLeaveTypeModal(false)} className="ox-btn ox-btn-ghost" style={{ padding: 4 }}>
                <XCircle size={20} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                startTransition(async () => {
                  try {
                    if (editingLeaveType) {
                      const updated = await updateLeaveType(editingLeaveType.id, ltForm);
                      setLeaveTypes((prev) => prev.map((t) => (t.id === editingLeaveType.id ? { ...t, ...updated } : t)));
                    } else {
                      const created = await createLeaveType(ltForm);
                      setLeaveTypes((prev) => [...prev, created]);
                    }
                    setShowLeaveTypeModal(false);
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Erreur enregistrement.");
                  }
                });
              }}
              style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
            >
              <div>
                <label className="ox-label">Nom du congé *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Congé Annuel Payé"
                  value={ltForm.name}
                  onChange={(e) => setLtForm({ ...ltForm, name: e.target.value })}
                  className="ox-input"
                />
              </div>

              <div>
                <label className="ox-label">Code identifiant unique *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: ANNUEL"
                  value={ltForm.code}
                  onChange={(e) => setLtForm({ ...ltForm, code: e.target.value })}
                  className="ox-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div>
                  <label className="ox-label">Jours autorisés/an *</label>
                  <input
                    type="number"
                    required
                    value={ltForm.daysAllowedPerYear}
                    onChange={(e) => setLtForm({ ...ltForm, daysAllowedPerYear: Number(e.target.value) })}
                    className="ox-input"
                  />
                </div>
                <div>
                  <label className="ox-label">Maintien de salaire</label>
                  <select
                    value={ltForm.isPaid ? "true" : "false"}
                    onChange={(e) => setLtForm({ ...ltForm, isPaid: e.target.value === "true" })}
                    className="ox-select"
                    style={{ width: "100%" }}
                  >
                    <option value="true">Oui (Rémunéré)</option>
                    <option value="false">Non (Sans solde)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setShowLeaveTypeModal(false)} className="ox-btn ox-btn-ghost">
                  Annuler
                </button>
                <button type="submit" disabled={isPending} className="ox-btn ox-btn-primary">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
