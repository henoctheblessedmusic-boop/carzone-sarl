import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RentalContractActions } from "@/components/RentalContractActions";
import { RentalContractDocument } from "@/components/RentalContractDocument";
import { prisma } from "@/lib/prisma";
import { SITE_WEBSITE } from "@/lib/site-constants";

export const metadata: Metadata = {
  title: "Contrat de location | CARZONE SARL",
  robots: { index: false, follow: false },
};

export default async function PublicRentalContractPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const rental = await prisma.rental.findUnique({
    where: { contractToken: token },
    include: {
      customer: true,
      // Même chargement que la vue interne : les deux exemplaires doivent être identiques.
      vehicle: { include: { version: { select: { trim: true, seats: true } } } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });
  if (!rental) notFound();

  const vehicleLabel = [rental.vehicle.brand, rental.vehicle.model, rental.vehicle.variant].filter(Boolean).join(" ");
  const publicUrl = `${SITE_WEBSITE.replace(/\/$/, "")}/contrat/${token}`;

  return (
    <main style={{ minHeight: "100vh", background: "#e5e7eb", padding: "18px 12px" }}>
      <div style={{ maxWidth: "210mm", margin: "0 auto 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ color: "#334155", fontSize: "0.82rem" }}>
          Contrat de location CARZONE SARL · Réf. LOC-{rental.id.slice(-8).toUpperCase()}
        </div>
        <RentalContractActions
          publicUrl={publicUrl}
          customerEmail={rental.customer.email}
          customerPhone={rental.customer.phone}
          reference={`LOC-${rental.id.slice(-8).toUpperCase()}`}
          vehicleLabel={vehicleLabel}
          publicView
        />
      </div>
      <RentalContractDocument rental={rental} />
    </main>
  );
}
