import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/PrintButton";
import { VehicleTechSheetPrint } from "@/components/VehicleTechSheetPrint";
import { buildStandardTechnicalSheet, type TechnicalSheet } from "@/lib/tech-sheet-generator";

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

  let sheet: TechnicalSheet;

  if (vehicle.technicalSheetJson) {
    try {
      sheet = JSON.parse(vehicle.technicalSheetJson);
      // Auto-heal si la fiche a une photo obsolète ou manque la photo de sellerie 4:3
      const hasObsoletePhoto =
        !sheet.mainPhotoUrl ||
        !sheet.interiorSeatsPhotoUrl ||
        sheet.mainPhotoUrl.includes("Toyota_Corolla_Cross") ||
        sheet.mainPhotoUrl.includes("Corolla_Cross") ||
        sheet.mainPhotoUrl.includes("photo-1617814076367");

      if (hasObsoletePhoto) {
        sheet = buildStandardTechnicalSheet(vehicle);
        prisma.vehicle
          .update({
            where: { id: vehicle.id },
            data: {
              technicalSheetJson: JSON.stringify(sheet),
              hasTechSheet: true,
              mainPhotoUrl: sheet.mainPhotoUrl,
              interiorPhotoUrl: sheet.interiorPhotoUrl,
              exteriorPhotoUrl: sheet.exteriorPhotoUrl,
              rearPhotoUrl: sheet.rearPhotoUrl,
            },
          })
          .catch(console.error);
      }
    } catch {
      sheet = buildStandardTechnicalSheet(vehicle);
    }
  } else {
    sheet = buildStandardTechnicalSheet(vehicle);
    // Save in DB asynchronously
    prisma.vehicle
      .update({
        where: { id: vehicle.id },
        data: {
          technicalSheetJson: JSON.stringify(sheet),
          hasTechSheet: true,
          mainPhotoUrl: sheet.mainPhotoUrl,
          interiorPhotoUrl: sheet.interiorPhotoUrl,
          exteriorPhotoUrl: sheet.exteriorPhotoUrl,
          rearPhotoUrl: sheet.rearPhotoUrl,
        },
      })
      .catch(console.error);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      {/* Top action bar (hidden on print) */}
      <div
        className="no-print"
        style={{
          padding: "0.8rem 1.5rem",
          background: "#0f172a",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <Link
            href="/vehicles"
            className="ox-btn ox-btn-ghost"
            style={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.2)" }}
          >
            ← Retour Stock
          </Link>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
            Fiche Technique Officielle : {sheet.title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <PrintButton />
        </div>
      </div>

      <div style={{ padding: "2rem 1rem" }}>
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
