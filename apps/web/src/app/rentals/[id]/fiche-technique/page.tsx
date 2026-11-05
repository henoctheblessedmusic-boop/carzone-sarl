import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { VehicleTechSheetPrint } from "@/components/VehicleTechSheetPrint";
import { RentalTechSheetActions } from "@/components/RentalTechSheetActions";
import { resolveVehicleTechSheet } from "@/lib/tech-sheet-generator";

const RENTAL_ROLES = ["GESTIONNAIRE_LOCATION", "COMPTA", "DG", "PDG", "SG"] as const;

export default async function RentalVehicleTechSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser([...RENTAL_ROLES]);
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { techSheetModel: true },
  });

  if (!vehicle || vehicle.fleetType !== "RENTAL") notFound();

  const sheet = resolveVehicleTechSheet(vehicle);

  return (
    <div className="ox-tech-sheet-page-root" style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <RentalTechSheetActions
        vehicleId={vehicle.id}
        vehicleTitle={`${vehicle.brand} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ""}`}
        isApproved={vehicle.techSheetConfirmed || vehicle.techSheetModel?.status === "APPROVED"}
      />

      <div className="ox-tech-sheet-print-container" style={{ padding: "2rem 1rem" }}>
        <VehicleTechSheetPrint
          sheet={sheet}
          vehicleInfo={{
            vin: vehicle.vin,
            color: vehicle.color,
            priceXof: vehicle.priceXof,
          }}
        />
      </div>
    </div>
  );
}
