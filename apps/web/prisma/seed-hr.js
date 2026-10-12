const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deptsCount = await prisma.department.count();
  const ltCount = await prisma.leaveType.count();
  console.log(`Current: ${deptsCount} departments, ${ltCount} leave types`);

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
      await prisma.department.create({ data: dept });
      console.log(`+ Created Department: ${dept.name}`);
    }
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
    const existing = await prisma.leaveType.findUnique({ where: { code: lt.code } });
    if (!existing) {
      await prisma.leaveType.create({ data: lt });
      console.log(`+ Created Leave Type: ${lt.name}`);
    }
  }

  const finalDepts = await prisma.department.count();
  const finalLts = await prisma.leaveType.count();
  console.log(`Done! Now: ${finalDepts} departments, ${finalLts} leave types`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
