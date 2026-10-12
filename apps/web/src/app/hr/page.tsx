import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { HRView } from "./HRView";

export default async function HRPage() {
  const user = await requireUser([
    "PDG",
    "SG",
    "DG",
    "RH",
    "ADMIN",
    "COMPTA",
    "RF",
    "ASSISTANTE_COMPTABLE",
  ]);

  const currentYear = new Date().getFullYear();

  // Auto-seed if empty
  const [deptCount, ltCount] = await Promise.all([
    prisma.department.count(),
    prisma.leaveType.count(),
  ]);

  if (deptCount === 0 || ltCount === 0) {
    // Seed standard base
    const standardDepartments = [
      { name: "Direction Générale", code: "DIR", description: "Gouvernance, stratégie et management général", color: "#c4a35a" },
      { name: "Ressources Humaines & Administration", code: "RH", description: "Gestion du personnel, contrats, paie et social", color: "#0078d4" },
      { name: "Commercial & Showroom", code: "COM", description: "Vente de véhicules neufs et occasions, prospection et clientèle", color: "#38bdf8" },
      { name: "Atelier Garage & SAV", code: "SAV", description: "Maintenance mécanique, diagnostic, carrosserie et réparations", color: "#d97706" },
      { name: "Comptabilité & Finances", code: "COMPTA", description: "Gestion financière, facturation normalisée, trésorerie et fiscalité", color: "#10b981" },
      { name: "Bornes & Énergie Électrique", code: "ENERGIE", description: "Installation, maintenance et supervision des bornes de recharge", color: "#8b5cf6" },
      { name: "Logistique & Magasin Pièces", code: "LOG", description: "Gestion du stock pièces détachées, approvisionnements et outillages", color: "#64748b" },
    ];
    for (const d of standardDepartments) {
      await prisma.department.upsert({ where: { code: d.code }, update: {}, create: d });
    }

    const standardLeaveTypes = [
      { name: "Congé Annuel Payé (24j légaux)", code: "ANNUEL", daysAllowedPerYear: 24, isPaid: true, color: "#10b981" },
      { name: "Congé Maladie Ordinaire", code: "MALADIE", daysAllowedPerYear: 15, isPaid: true, color: "#ef4444" },
      { name: "Maternité / Grossesse (14 sem.)", code: "MATERNITE", daysAllowedPerYear: 98, isPaid: true, color: "#ec4899" },
      { name: "Paternité & Naissance", code: "PATERNITE", daysAllowedPerYear: 3, isPaid: true, color: "#3b82f6" },
      { name: "Permissions Familiales (Mariage/Décès)", code: "PERMISSION", daysAllowedPerYear: 10, isPaid: true, color: "#f59e0b" },
      { name: "Congé Sans Solde", code: "SANS_SOLDE", daysAllowedPerYear: 0, isPaid: false, color: "#6b7280" },
    ];
    for (const lt of standardLeaveTypes) {
      await prisma.leaveType.upsert({ where: { code: lt.code }, update: {}, create: lt });
    }
  }

  // Fetch all HR & Payroll data
  const [employees, departments, leaveTypes, leaveRequests, users, salaryPayments] = await Promise.all([
    prisma.employee.findMany({
      include: {
        department: true,
        user: { select: { id: true, email: true, fullName: true, role: true } },
        leaveBalances: {
          where: { year: currentYear },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.department.findMany({
      include: {
        _count: { select: { employees: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.leaveType.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.leaveRequest.findMany({
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true, jobTitle: true } },
        leaveType: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { active: true },
      select: { id: true, email: true, fullName: true, role: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.salaryPayment.findMany({
      where: { year: currentYear },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true, jobTitle: true } },
      },
      orderBy: { paymentDate: "desc" },
    }),
  ]);

  // Serialize dates for client component
  const serializedEmployees = employees.map((e) => ({
    ...e,
    hireDate: e.hireDate.toISOString(),
    contractStart: e.contractStart ? e.contractStart.toISOString() : null,
    contractEnd: e.contractEnd ? e.contractEnd.toISOString() : null,
    birthDate: e.birthDate ? e.birthDate.toISOString() : null,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  const serializedDepartments = departments.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));

  const serializedLeaveTypes = leaveTypes.map((lt) => ({
    ...lt,
    createdAt: lt.createdAt.toISOString(),
    updatedAt: lt.updatedAt.toISOString(),
  }));

  const serializedLeaveRequests = leaveRequests.map((lr) => ({
    ...lr,
    startDate: lr.startDate.toISOString(),
    endDate: lr.endDate.toISOString(),
    approvedAt: lr.approvedAt ? lr.approvedAt.toISOString() : null,
    createdAt: lr.createdAt.toISOString(),
    updatedAt: lr.updatedAt.toISOString(),
  }));

  const serializedSalaryPayments = salaryPayments.map((sp) => ({
    ...sp,
    paymentDate: sp.paymentDate.toISOString(),
    createdAt: sp.createdAt.toISOString(),
    updatedAt: sp.updatedAt.toISOString(),
  }));

  return (
    <AppShell user={user} titleKey="hr">
      <HRView
        currentUserRole={user.role}
        currentUserId={user.id}
        initialEmployees={serializedEmployees}
        initialDepartments={serializedDepartments}
        initialLeaveTypes={serializedLeaveTypes}
        initialLeaveRequests={serializedLeaveRequests}
        initialSalaryPayments={serializedSalaryPayments}
        availableUsers={users}
        currentYear={currentYear}
      />
    </AppShell>
  );
}
