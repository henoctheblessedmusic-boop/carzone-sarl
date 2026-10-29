"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { getLocale } from "@/lib/i18n/server";
import { adminCopy } from "@/lib/i18n/messages/admin";

const CAN_MANAGE_HR = [
  "PDG",
  "SG",
  "DG",
  "RH",
  "ADMIN",
  "COMPTA",
  "RF",
  "ASSISTANTE_COMPTABLE",
] as const;

// Helper to generate a unique employee number
async function generateEmployeeNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.employee.count();
  const sequence = String(count + 1).padStart(3, "0");
  return `EMP-${currentYear}-${sequence}`;
}

/**
 * -------------------------------------------------------------
 * SALARIÉS / PERSONNEL
 * -------------------------------------------------------------
 */

export async function createEmployee(data: {
  employeeNumber?: string;
  firstName: string;
  lastName: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  emergencyContact?: string;
  jobTitle: string;
  departmentId?: string;
  contractType: string;
  hireDate: string; // ISO string or YYYY-MM-DD
  contractEnd?: string;
  baseSalaryXof?: number;
  cnssNumber?: string;
  ifuNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  status?: string;
  notes?: string;
  userId?: string;
}) {
  await requireUser([...CAN_MANAGE_HR]);
  const t = adminCopy[await getLocale()].server.hr;

  if (!data.firstName.trim() || !data.lastName.trim() || !data.jobTitle.trim()) {
    throw new Error(t.requiredEmployeeFields);
  }

  const employeeNumber = data.employeeNumber?.trim() || (await generateEmployeeNumber());

  // Check if employeeNumber already exists
  const existingNumber = await prisma.employee.findUnique({ where: { employeeNumber } });
  if (existingNumber) {
    throw new Error(t.employeeNumberTaken(employeeNumber));
  }

  const employee = await prisma.employee.create({
    data: {
      employeeNumber,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      gender: data.gender || "M",
      email: data.email?.trim() ? data.email.trim().toLowerCase() : null,
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      city: data.city || "Cotonou",
      emergencyContact: data.emergencyContact?.trim() || null,
      jobTitle: data.jobTitle.trim(),
      departmentId: data.departmentId || null,
      contractType: data.contractType || "CDI",
      hireDate: new Date(data.hireDate),
      contractEnd: data.contractEnd ? new Date(data.contractEnd) : null,
      baseSalaryXof: data.baseSalaryXof ? Math.round(Number(data.baseSalaryXof)) : null,
      cnssNumber: data.cnssNumber?.trim() || null,
      ifuNumber: data.ifuNumber?.trim() || null,
      bankName: data.bankName?.trim() || null,
      bankAccountNumber: data.bankAccountNumber?.trim() || null,
      status: data.status || "ACTIF",
      notes: data.notes?.trim() || null,
    },
  });

  // Link to user account if provided
  if (data.userId) {
    await prisma.user.update({
      where: { id: data.userId },
      data: { employeeId: employee.id },
    });
  }

  // Initialiser les soldes de congés de l'année en cours
  const currentYear = new Date().getFullYear();
  const leaveTypes = await prisma.leaveType.findMany();
  for (const lt of leaveTypes) {
    await prisma.leaveBalance.upsert({
      where: {
        employeeId_year_leaveTypeCode: {
          employeeId: employee.id,
          year: currentYear,
          leaveTypeCode: lt.code,
        },
      },
      update: {},
      create: {
        employeeId: employee.id,
        year: currentYear,
        leaveTypeCode: lt.code,
        allocatedDays: lt.daysAllowedPerYear,
        usedDays: 0,
        remainingDays: lt.daysAllowedPerYear,
      },
    });
  }

  revalidatePath("/hr");
  return employee;
}

export async function updateEmployee(
  id: string,
  data: {
    employeeNumber?: string;
    firstName: string;
    lastName: string;
    gender?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    emergencyContact?: string;
    jobTitle: string;
    departmentId?: string | null;
    contractType: string;
    hireDate: string;
    contractEnd?: string | null;
    baseSalaryXof?: number | null;
    cnssNumber?: string;
    ifuNumber?: string;
    bankName?: string;
    bankAccountNumber?: string;
    status?: string;
    notes?: string;
    userId?: string | null;
  }
) {
  await requireUser([...CAN_MANAGE_HR]);
  const t = adminCopy[await getLocale()].server.hr;

  if (!data.firstName.trim() || !data.lastName.trim() || !data.jobTitle.trim()) {
    throw new Error(t.requiredEmployeeFields);
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: {
      employeeNumber: data.employeeNumber?.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      gender: data.gender || "M",
      email: data.email?.trim() ? data.email.trim().toLowerCase() : null,
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      city: data.city || "Cotonou",
      emergencyContact: data.emergencyContact?.trim() || null,
      jobTitle: data.jobTitle.trim(),
      departmentId: data.departmentId || null,
      contractType: data.contractType || "CDI",
      hireDate: new Date(data.hireDate),
      contractEnd: data.contractEnd ? new Date(data.contractEnd) : null,
      baseSalaryXof: data.baseSalaryXof ? Math.round(Number(data.baseSalaryXof)) : null,
      cnssNumber: data.cnssNumber?.trim() || null,
      ifuNumber: data.ifuNumber?.trim() || null,
      bankName: data.bankName?.trim() || null,
      bankAccountNumber: data.bankAccountNumber?.trim() || null,
      status: data.status || "ACTIF",
      notes: data.notes?.trim() || null,
    },
  });

  // Update user link
  if (data.userId) {
    // Unlink old
    await prisma.user.updateMany({
      where: { employeeId: id, NOT: { id: data.userId } },
      data: { employeeId: null },
    });
    // Link new
    await prisma.user.update({
      where: { id: data.userId },
      data: { employeeId: id },
    });
  } else {
    // Unlink any user currently attached
    await prisma.user.updateMany({
      where: { employeeId: id },
      data: { employeeId: null },
    });
  }

  revalidatePath("/hr");
  return updated;
}

export async function deleteEmployee(id: string) {
  await requireUser([...CAN_MANAGE_HR]);

  // Unlink user if attached
  await prisma.user.updateMany({
    where: { employeeId: id },
    data: { employeeId: null },
  });

  // Delete employee (relations cascade: leaveRequests, leaveBalances, documents)
  await prisma.employee.delete({ where: { id } });

  revalidatePath("/hr");
  return { success: true };
}

/**
 * -------------------------------------------------------------
 * GESTION DES CONGÉS & ABSENCES
 * -------------------------------------------------------------
 */

export async function createLeaveRequest(data: {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason?: string;
  attachmentUrl?: string;
}) {
  await requireUser([...CAN_MANAGE_HR]);
  const t = adminCopy[await getLocale()].server.hr;

  if (!data.employeeId || !data.leaveTypeId || !data.startDate || !data.endDate) {
    throw new Error(t.requiredLeaveFields);
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (end < start) {
    throw new Error(t.leaveEndBeforeStart);
  }

  const req = await prisma.leaveRequest.create({
    data: {
      employeeId: data.employeeId,
      leaveTypeId: data.leaveTypeId,
      startDate: start,
      endDate: end,
      daysCount: Number(data.daysCount) > 0 ? Number(data.daysCount) : 1,
      reason: data.reason?.trim() || null,
      attachmentUrl: data.attachmentUrl?.trim() || null,
      status: "EN_ATTENTE",
    },
  });

  revalidatePath("/hr");
  return req;
}

export async function approveLeaveRequest(requestId: string) {
  const user = await requireUser([...CAN_MANAGE_HR]);

  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: { leaveType: true, employee: true },
  });

  if (!request) {
    throw new Error(adminCopy[await getLocale()].server.hr.leaveRequestNotFound);
  }

  if (request.status === "APPROUVE") {
    return { success: true };
  }

  const requestYear = request.startDate.getFullYear();

  // Deduct from LeaveBalance
  await prisma.$transaction(async (tx) => {
    // 1. Update status
    await tx.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROUVE",
        approvedBy: user.fullName || user.role,
        approvedAt: new Date(),
        rejectionReason: null,
      },
    });

    // 2. Fetch or create balance
    let balance = await tx.leaveBalance.findUnique({
      where: {
        employeeId_year_leaveTypeCode: {
          employeeId: request.employeeId,
          year: requestYear,
          leaveTypeCode: request.leaveType.code,
        },
      },
    });

    if (!balance) {
      balance = await tx.leaveBalance.create({
        data: {
          employeeId: request.employeeId,
          year: requestYear,
          leaveTypeCode: request.leaveType.code,
          allocatedDays: request.leaveType.daysAllowedPerYear,
          usedDays: 0,
          remainingDays: request.leaveType.daysAllowedPerYear,
        },
      });
    }

    const newUsed = balance.usedDays + request.daysCount;
    const newRemaining = balance.allocatedDays - newUsed;

    await tx.leaveBalance.update({
      where: { id: balance.id },
      data: {
        usedDays: newUsed,
        remainingDays: newRemaining,
      },
    });
  });

  revalidatePath("/hr");
  return { success: true };
}

export async function rejectLeaveRequest(requestId: string, rejectionReason: string) {
  await requireUser([...CAN_MANAGE_HR]);
  const t = adminCopy[await getLocale()].server.hr;

  if (!rejectionReason.trim()) {
    throw new Error(t.rejectionReasonRequired);
  }

  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: { leaveType: true },
  });
  if (!request) {
    throw new Error(t.leaveRequestNotFound);
  }

  // If already approved previously, refund balance
  if (request.status === "APPROUVE") {
    const requestYear = request.startDate.getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_year_leaveTypeCode: {
          employeeId: request.employeeId,
          year: requestYear,
          leaveTypeCode: request.leaveType.code,
        },
      },
    });

    if (balance) {
      const newUsed = Math.max(0, balance.usedDays - request.daysCount);
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          usedDays: newUsed,
          remainingDays: balance.allocatedDays - newUsed,
        },
      });
    }
  }

  await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: "REFUSE",
      rejectionReason: rejectionReason.trim(),
    },
  });

  revalidatePath("/hr");
  return { success: true };
}

export async function cancelLeaveRequest(requestId: string) {
  await requireUser([...CAN_MANAGE_HR]);

  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: { leaveType: true },
  });
  if (!request) throw new Error(adminCopy[await getLocale()].server.hr.leaveRequestNotFound);

  if (request.status === "APPROUVE") {
    const requestYear = request.startDate.getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_year_leaveTypeCode: {
          employeeId: request.employeeId,
          year: requestYear,
          leaveTypeCode: request.leaveType.code,
        },
      },
    });

    if (balance) {
      const newUsed = Math.max(0, balance.usedDays - request.daysCount);
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          usedDays: newUsed,
          remainingDays: balance.allocatedDays - newUsed,
        },
      });
    }
  }

  await prisma.leaveRequest.update({
    where: { id: requestId },
    data: { status: "ANNULE" },
  });

  revalidatePath("/hr");
  return { success: true };
}

/**
 * -------------------------------------------------------------
 * CONFIGURATION RH : DÉPARTEMENTS & TYPES DE CONGÉS
 * -------------------------------------------------------------
 */

export async function createDepartment(data: {
  name: string;
  code: string;
  description?: string;
  color?: string;
}) {
  await requireUser([...CAN_MANAGE_HR]);

  if (!data.name.trim() || !data.code.trim()) {
    throw new Error(adminCopy[await getLocale()].server.hr.requiredDepartmentFields);
  }

  const dept = await prisma.department.create({
    data: {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      description: data.description?.trim() || null,
      color: data.color || "#0078d4",
    },
  });

  revalidatePath("/hr");
  return dept;
}

export async function updateDepartment(
  id: string,
  data: {
    name: string;
    code: string;
    description?: string;
    color?: string;
  }
) {
  await requireUser([...CAN_MANAGE_HR]);

  if (!data.name.trim()) throw new Error(adminCopy[await getLocale()].server.hr.departmentNameRequired);

  const dept = await prisma.department.update({
    where: { id },
    data: {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      description: data.description?.trim() || null,
      color: data.color || "#0078d4",
    },
  });

  revalidatePath("/hr");
  return dept;
}

export async function deleteDepartment(id: string) {
  await requireUser([...CAN_MANAGE_HR]);

  const employeesCount = await prisma.employee.count({ where: { departmentId: id } });
  if (employeesCount > 0) {
    throw new Error(adminCopy[await getLocale()].server.hr.departmentHasEmployees(employeesCount));
  }

  await prisma.department.delete({ where: { id } });
  revalidatePath("/hr");
  return { success: true };
}

export async function createLeaveType(data: {
  name: string;
  code: string;
  daysAllowedPerYear: number;
  isPaid: boolean;
  color?: string;
}) {
  await requireUser([...CAN_MANAGE_HR]);

  if (!data.name.trim() || !data.code.trim()) {
    throw new Error(adminCopy[await getLocale()].server.hr.requiredLeaveTypeFields);
  }

  const lt = await prisma.leaveType.create({
    data: {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      daysAllowedPerYear: Number(data.daysAllowedPerYear) >= 0 ? Number(data.daysAllowedPerYear) : 0,
      isPaid: Boolean(data.isPaid),
      color: data.color || "#38bdf8",
    },
  });

  revalidatePath("/hr");
  return lt;
}

export async function updateLeaveType(
  id: string,
  data: {
    name: string;
    code: string;
    daysAllowedPerYear: number;
    isPaid: boolean;
    color?: string;
  }
) {
  await requireUser([...CAN_MANAGE_HR]);

  const lt = await prisma.leaveType.update({
    where: { id },
    data: {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      daysAllowedPerYear: Number(data.daysAllowedPerYear) >= 0 ? Number(data.daysAllowedPerYear) : 0,
      isPaid: Boolean(data.isPaid),
      color: data.color || "#38bdf8",
    },
  });

  revalidatePath("/hr");
  return lt;
}

export async function deleteLeaveType(id: string) {
  await requireUser([...CAN_MANAGE_HR]);

  const requestsCount = await prisma.leaveRequest.count({ where: { leaveTypeId: id } });
  if (requestsCount > 0) {
    throw new Error(adminCopy[await getLocale()].server.hr.leaveTypeInUse(requestsCount));
  }

  const lt = await prisma.leaveType.findUnique({ where: { id } });
  if (lt) {
    await prisma.leaveBalance.deleteMany({ where: { leaveTypeCode: lt.code } });
  }
  await prisma.leaveType.delete({ where: { id } });

  revalidatePath("/hr");
  return { success: true };
}

/**
 * Initialisation en un clic du référentiel RH standard (Norme Bénin / OHADA)
 */
export async function seedStandardHrBase() {
  await requireUser([...CAN_MANAGE_HR]);

  // Standard Departments
  const standardDepartments = [
    { name: "Direction Générale", code: "DIR", description: "Gouvernance, stratégie et management général", color: "#c4a35a" },
    { name: "Ressources Humaines & Administration", code: "RH", description: "Gestion du personnel, contrats, paie et social", color: "#0078d4" },
    { name: "Commercial & Showroom", code: "COM", description: "Vente de véhicules neufs et occasions, prospection et clientèle", color: "#38bdf8" },
    { name: "Atelier Garage & SAV", code: "SAV", description: "Maintenance mécanique, diagnostic, carrosserie et réparations", color: "#d97706" },
    { name: "Comptabilité & Finances", code: "COMPTA", description: "Gestion financière, facturation normalisée, trésorerie et fiscalité", color: "#10b981" },
    { name: "Bornes & Énergie Électrique", code: "ENERGIE", description: "Installation, maintenance et supervision des bornes de recharge", color: "#8b5cf6" },
    { name: "Logistique & Magasin Pièces", code: "LOG", description: "Gestion du stock pièces détachées, approvisionnements et outillages", color: "#64748b" },
  ];

  for (const dept of standardDepartments) {
    const existing = await prisma.department.findUnique({ where: { code: dept.code } });
    if (!existing) {
      await prisma.department.create({
        data: {
          name: dept.name,
          code: dept.code,
          description: dept.description,
          color: dept.color,
        },
      });
    }
  }

  // Standard Leave Types (Bénin / Code du travail & OHADA)
  const standardLeaveTypes = [
    {
      name: "Congé Annuel Payé",
      code: "ANNUEL",
      daysAllowedPerYear: 24, // 2 jours ouvrables par mois effectif = 24 jours/an
      isPaid: true,
      color: "#10b981",
    },
    {
      name: "Congé Maladie Ordinaire",
      code: "MALADIE",
      daysAllowedPerYear: 15,
      isPaid: true,
      color: "#ef4444",
    },
    {
      name: "Maternité / Grossesse",
      code: "MATERNITE",
      daysAllowedPerYear: 98, // 14 semaines légales
      isPaid: true,
      color: "#ec4899",
    },
    {
      name: "Paternité & Naissance",
      code: "PATERNITE",
      daysAllowedPerYear: 3,
      isPaid: true,
      color: "#3b82f6",
    },
    {
      name: "Permissions Exceptionnelles (Mariage / Famille)",
      code: "PERMISSION",
      daysAllowedPerYear: 10,
      isPaid: true,
      color: "#f59e0b",
    },
    {
      name: "Congé Sans Solde",
      code: "SANS_SOLDE",
      daysAllowedPerYear: 0,
      isPaid: false,
      color: "#6b7280",
    },
  ];

  for (const lt of standardLeaveTypes) {
    const existing = await prisma.leaveType.findUnique({ where: { code: lt.code } });
    if (!existing) {
      await prisma.leaveType.create({
        data: {
          name: lt.name,
          code: lt.code,
          daysAllowedPerYear: lt.daysAllowedPerYear,
          isPaid: lt.isPaid,
          color: lt.color,
        },
      });
    }
  }

  revalidatePath("/hr");
  return { success: true };
}

/**
 * -------------------------------------------------------------
 * SUIVI DE PAIE & PAIEMENTS DES SALAIRES
 * -------------------------------------------------------------
 */

export async function recordSalaryPayment(data: {
  employeeId: string;
  month: number;
  year: number;
  amountXof: number;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}) {
  const user = await requireUser([...CAN_MANAGE_HR]);

  if (!data.employeeId || !data.month || !data.year || data.amountXof <= 0) {
    throw new Error(adminCopy[await getLocale()].server.hr.invalidPaymentInfo);
  }

  const payment = await prisma.salaryPayment.upsert({
    where: {
      employeeId_year_month: {
        employeeId: data.employeeId,
        year: data.year,
        month: data.month,
      },
    },
    update: {
      amountXof: data.amountXof,
      paymentMethod: data.paymentMethod || "VIREMENT",
      reference: data.reference?.trim() || null,
      notes: data.notes?.trim() || null,
      status: "PAYE",
      paidByUserId: user.id,
      paymentDate: new Date(),
    },
    create: {
      employeeId: data.employeeId,
      year: data.year,
      month: data.month,
      amountXof: data.amountXof,
      paymentMethod: data.paymentMethod || "VIREMENT",
      reference: data.reference?.trim() || null,
      notes: data.notes?.trim() || null,
      status: "PAYE",
      paidByUserId: user.id,
      paymentDate: new Date(),
    },
  });

  revalidatePath("/hr");
  revalidatePath("/invoices");
  return payment;
}

export async function deleteSalaryPayment(id: string) {
  await requireUser([...CAN_MANAGE_HR]);

  await prisma.salaryPayment.delete({
    where: { id },
  });

  revalidatePath("/hr");
  revalidatePath("/invoices");
  return { success: true };
}

export async function markAllMonthlySalariesPaid(data: {
  month: number;
  year: number;
  paymentMethod: string;
  reference?: string;
}) {
  const user = await requireUser([...CAN_MANAGE_HR]);

  const activeEmployees = await prisma.employee.findMany({
    where: { status: "ACTIF", baseSalaryXof: { gt: 0 } },
  });

  for (const emp of activeEmployees) {
    if (!emp.baseSalaryXof) continue;
    await prisma.salaryPayment.upsert({
      where: {
        employeeId_year_month: {
          employeeId: emp.id,
          year: data.year,
          month: data.month,
        },
      },
      update: {
        amountXof: emp.baseSalaryXof,
        paymentMethod: data.paymentMethod,
        reference: data.reference || null,
        status: "PAYE",
        paidByUserId: user.id,
        paymentDate: new Date(),
      },
      create: {
        employeeId: emp.id,
        year: data.year,
        month: data.month,
        amountXof: emp.baseSalaryXof,
        paymentMethod: data.paymentMethod,
        reference: data.reference || null,
        status: "PAYE",
        paidByUserId: user.id,
        paymentDate: new Date(),
      },
    });
  }

  revalidatePath("/hr");
  revalidatePath("/invoices");
  return { success: true, count: activeEmployees.length };
}
