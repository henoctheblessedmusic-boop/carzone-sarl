import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { formatXof } from "@/lib/format";
import { GarageSupervisionView, type SupervisionEntry } from "./GarageSupervisionView";
import { transcribeQuote } from "@/app/quotes/actions";

const SUPERVISION_ROLES = [
  "COMPTA_GARAGE",
  "COMPTA",
  "ASSISTANTE_COMPTABLE",
  "CHEF_ATELIER",
  "DG",
  "PDG",
  "SG",
] as const;

const INVOICE_ROLES = ["COMPTA", "ASSISTANTE_COMPTABLE", "DG", "PDG", "SG"];

const COST_APPROVER_ROLES = ["COMPTA_GARAGE", "COMPTA", "DG", "PDG", "SG"];

async function transcribeConfirmedGarageQuote(formData: FormData) {
  "use server";
  await transcribeQuote(formData);
}

export default async function GarageSupervisionPage() {
  const user = await requireUser([...SUPERVISION_ROLES]);

  const entries = await prisma.workshopEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true,
      orNumber: true,
      entryDate: true,
      clientName: true,
      phone: true,
      immatriculation: true,
      chassis: true,
      brand: true,
      model: true,
      mileage: true,
      statusCode: true,
      worksDone: true,
      technicianName: true,
      workshopManagerName: true,
      interventionType: true,
      laborCostXof: true,
      partsCostXof: true,
      otherCostXof: true,
      costNotes: true,
      costStatus: true,
      costApprovedBy: true,
      costApprovedAt: true,
      createdAt: true,
    },
  });

  const confirmedQuotes = await prisma.quote.findMany({
    where: { activity: "GARAGE", status: "CONFIRMEE" },
    include: {
      customer: { select: { contactName: true, companyName: true } },
      lines: { select: { id: true, description: true, quantity: true, unitPriceXof: true } },
    },
    orderBy: { approvedAt: "asc" },
  });
  const canInvoice = INVOICE_ROLES.includes(user.role);

  const items: SupervisionEntry[] = entries.map((entry) => ({
    id: entry.id,
    orNumber: entry.orNumber,
    entryDate: entry.entryDate,
    clientName: entry.clientName,
    phone: entry.phone,
    immatriculation: entry.immatriculation,
    chassis: entry.chassis,
    brand: entry.brand,
    model: entry.model,
    mileage: entry.mileage,
    statusCode: entry.statusCode,
    worksDone: entry.worksDone,
    technicianName: entry.technicianName,
    workshopManagerName: entry.workshopManagerName,
    interventionType: entry.interventionType,
    laborCostXof: entry.laborCostXof,
    partsCostXof: entry.partsCostXof,
    otherCostXof: entry.otherCostXof,
    costNotes: entry.costNotes,
    costStatus: entry.costStatus,
    costApprovedBy: entry.costApprovedBy,
    costApprovedAt: entry.costApprovedAt ? entry.costApprovedAt.toISOString() : null,
    createdAt: entry.createdAt.toISOString(),
  }));

  return (
    <AppShell user={user} title="Supervision garage">
      {confirmedQuotes.length > 0 && (
        <div className="ox-glass" style={{ padding: "1rem 1.2rem", display: "grid", gap: 10, marginBottom: "1rem" }}>
          <div>
            <strong>Proformas garage confirmées à facturer</strong>
            <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: "0.84rem" }}>
              La comptable garage a confirmé ces proformas. La comptabilité principale ou l&apos;assistante comptable peut les transcrire en facture normalisée.
            </p>
          </div>
          <div className="ox-table-wrap">
            <table className="ox-table" style={{ fontSize: "0.82rem" }}>
              <thead>
                <tr>
                  <th>Proforma</th>
                  <th>Client</th>
                  <th>Lignes</th>
                  <th>Total TTC</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {confirmedQuotes.map((quote) => (
                  <tr key={quote.id}>
                    <td>{quote.number}</td>
                    <td>{quote.customer.companyName || quote.customer.contactName}</td>
                    <td>{quote.lines.length}</td>
                    <td>{formatXof(quote.totalXof)}</td>
                    <td>
                      {canInvoice ? (
                        <form action={transcribeConfirmedGarageQuote} style={{ display: "inline" }}>
                          <input type="hidden" name="id" value={quote.id} />
                          <input type="hidden" name="mode" value="FACTURE_NORMALISEE" />
                          <button type="submit" className="ox-btn ox-btn-primary ox-btn-sm">
                            Transcrire en facture normalisée
                          </button>
                        </form>
                      ) : (
                        <span style={{ opacity: 0.7, fontSize: "0.78rem" }}>En attente de la comptabilité</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <GarageSupervisionView
        entries={items}
        canApprove={COST_APPROVER_ROLES.includes(user.role)}
        isGarageAccountant={user.role === "COMPTA_GARAGE"}
      />
    </AppShell>
  );
}
