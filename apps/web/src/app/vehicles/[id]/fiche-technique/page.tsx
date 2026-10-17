import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { VehicleTechSheetPrint } from "@/components/VehicleTechSheetPrint";
import { TechSheetActionBar } from "@/components/TechSheetActionBar";
import { resolveVehicleTechSheet } from "@/lib/tech-sheet-generator";

export default async function VehicleTechSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!vehicle) notFound();

  const sheet = resolveVehicleTechSheet(vehicle);

  return (
    <div className="ox-tech-sheet-page-root" style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <TechSheetActionBar
        vehicleId={vehicle.id}
        brand={vehicle.brand}
        model={vehicle.model}
        variant={vehicle.variant}
        sheetTitle={sheet.title}
        isConfirmed={vehicle.techSheetConfirmed}
        confirmedAt={vehicle.techSheetConfirmedAt}
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
