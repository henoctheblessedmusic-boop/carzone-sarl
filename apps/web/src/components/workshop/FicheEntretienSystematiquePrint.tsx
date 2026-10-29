"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Printer, ArrowLeft, ShieldCheck } from "lucide-react";
import { WORKSHOP_CHECKLIST_TEMPLATE } from "@/lib/workshop-checklist-data";
import { usePrefs } from "@/components/PrefsProvider";
import { workshopCopy } from "@/lib/i18n/messages/workshop";

export type ChecklistTaskExecution = {
  taskLabel: string;
  category?: string;
  mileageTier: number;
  status: "EFFECTUE" | "NON_EFFECTUE" | "NON_APPLICABLE";
  observation?: string;
};

export type SystematicMaintenanceData = {
  id: string;
  orNumber: string;
  entryDate: string;
  brand: string;
  model: string;
  immatriculation: string;
  chassis: string;
  mileage: number;
  oilType?: string; // Type de vidange (ex: 5W30 Synthèse)
  pv?: string; // Procès-Verbal / PV
  clientName: string;
  phone: string;
  startTime?: string;
  endTime?: string;
  selectedTier: number; // 5000, 10000, 30000, 50000, 100000
  tasks: ChecklistTaskExecution[];
  observations?: string;
  technicianName?: string;
  workshopManagerName?: string;
  signatures?: {
    client?: string;
    technician?: string;
    workshopManager?: string;
  };
};

export function FicheEntretienSystematiquePrint({ data }: { data: SystematicMaintenanceData }) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const { locale } = usePrefs();
  const copy = workshopCopy[locale].print.maintenance;

  const handlePrint = () => {
    window.print();
  };

  // Mapper les 22 tâches avec les données d'exécution réelles
  const tasksList = WORKSHOP_CHECKLIST_TEMPLATE.map((tpl, index) => {
    const executed = data.tasks.find(
      (t) => t.taskLabel.toLowerCase().trim() === tpl.taskLabel.toLowerCase().trim()
    );
    return {
      index: index + 1,
      template: tpl,
      status: executed ? executed.status : (data.selectedTier >= tpl.mileageTier ? "EFFECTUE" : "NON_EFFECTUE"),
      observation: executed?.observation || "",
    };
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b121e", padding: "24px 16px" }}>
      {/* STYLE CSS STRICT POUR L'AFFICHAGE & L'IMPRESSION A4 */}
      <style>{`
        @media screen {
          .cz-a4-sheet-entretien {
            width: 210mm;
            min-height: 297mm;
            max-width: 210mm;
            margin: 0 auto;
            background-color: #ffffff !important;
            color: #0f172a !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
            border-radius: 4px;
            padding: 8mm 11mm;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
        }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 5mm 7mm;
          }
          .cz-no-print {
            display: none !important;
          }
          .cz-a4-sheet-entretien {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 3mm 5mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* BARRE D'ACTION SUPÉRIEURE (ÉCRAN SEULEMENT) */}
      <div
        className="cz-no-print"
        style={{
          maxWidth: "210mm",
          margin: "0 auto 16px auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          background: "linear-gradient(135deg, #162032, #0f172a)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 12,
          padding: "12px 18px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
        }}
      >
        <Link
          href="/workshop"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#94a3b8",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: 650,
          }}
        >
          <ArrowLeft size={16} />
          {copy.back}
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(168, 85, 247, 0.15)",
              color: "#d8b4fe",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={14} /> {copy.badge}
          </span>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, #a855f7, #9333ea)",
              color: "#ffffff",
              border: 0,
              padding: "8px 18px",
              borderRadius: 8,
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(168, 85, 247, 0.4)",
            }}
          >
            <Printer size={16} />
            {copy.print}
          </button>
        </div>
      </div>

      {/* FEUILLE OFFICIELLE A4 */}
      <div ref={printAreaRef} className="cz-a4-sheet-entretien">
        {/* 1. EN-TÊTE OFFICIEL AVEC LOGO CARZONE (EXACT PHOTO 2) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "2px solid #0f172a",
            padding: "6px 12px",
            marginBottom: "6px",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Logo et Informations légales */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
              <Image
                src="/brand/carzone-logo.png"
                alt="CARZONE SARL"
                width={56}
                height={56}
                priority
                style={{ objectFit: "contain", borderRadius: "50%" }}
              />
            </div>
            <div>
              <div style={{ fontSize: "10.5px", fontWeight: 800, letterSpacing: "1px", color: "#0f172a", textTransform: "uppercase" }}>
                {copy.companyActivity}
              </div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#e11d48", lineHeight: 1.1, margin: "1px 0" }}>
                CARZONE SARL
              </div>
              <div style={{ fontSize: "8.5px", fontWeight: 700, color: "#334155" }}>
                {copy.afterSales} · {copy.telLabel} +229 01 92 61 61 61
              </div>
            </div>
          </div>

          {/* Titre et N° d'Ordre */}
          <div
            style={{
              textAlign: "right",
              borderLeft: "2px solid #0f172a",
              paddingLeft: "12px",
            }}
          >
            <div
              style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "3px 8px",
                fontWeight: 900,
                fontSize: "11px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                borderRadius: "2px",
              }}
            >
              {copy.docTitle}
            </div>
            <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#e11d48", marginTop: "3px" }}>
              {copy.sheetNumber}
              {data.orNumber}
            </div>
            <div style={{ fontSize: "9px", fontWeight: 650, color: "#334155" }}>
              {copy.dateLabel} <strong>{data.entryDate}</strong>
            </div>
          </div>
        </div>

        {/* 2. TABLEAU TECHNIQUE DES CARACTÉRISTIQUES (EXACT PHOTO 2) */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px" }}>
          <tbody>
            <tr>
              <td style={{ ...tdHeader, width: "13%" }}>{copy.brand}</td>
              <td style={{ ...tdData, width: "20%" }}><strong>{data.brand || "-"}</strong></td>
              <td style={{ ...tdHeader, width: "12%" }}>{copy.model}</td>
              <td style={{ ...tdData, width: "20%" }}><strong>{data.model || "-"}</strong></td>
              <td style={{ ...tdHeader, width: "16%" }}>{copy.immat}</td>
              <td style={{ ...tdData, width: "19%" }}>
                <span style={{ fontSize: "10.5px", fontWeight: 900, color: "#0f172a" }}>
                  {data.immatriculation}
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ ...tdHeader }}>{copy.date}</td>
              <td style={{ ...tdData }}>{data.entryDate}</td>
              <td style={{ ...tdHeader }}>{copy.chassis}</td>
              <td style={{ ...tdData, fontFamily: "monospace", fontSize: "9px" }}>{data.chassis || "-"}</td>
              <td style={{ ...tdHeader }}>{copy.oilLabel}</td>
              <td style={{ ...tdData, fontSize: "9px" }}>
                <strong>{data.oilType || copy.oilDefault}</strong>
              </td>
            </tr>
            <tr>
              <td style={{ ...tdHeader }}>{copy.clientName}</td>
              <td colSpan={3} style={{ ...tdData }}>
                <strong>{data.clientName}</strong> {data.phone ? `(${data.phone})` : ""}
              </td>
              <td style={{ ...tdHeader }}>{copy.mileageLabel}</td>
              <td style={{ ...tdData }}>
                <strong style={{ fontSize: "10.5px" }}>
                  {data.mileage ? `${data.mileage.toLocaleString()} KM` : "-"}
                </strong>
              </td>
            </tr>
            <tr>
              <td style={{ ...tdHeader }}>{copy.hoursLabel}</td>
              <td colSpan={3} style={{ ...tdData, fontSize: "9px" }}>
                {copy.start} <strong>{data.startTime || "-"}</strong> · {copy.end} <strong>{data.endTime || "-"}</strong>
              </td>
              <td style={{ ...tdHeader }}>{copy.pvLabel}</td>
              <td style={{ ...tdData, fontWeight: 750, color: "#166534" }}>
                {data.pv || copy.pvDefault}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 3. MATRICE DYNAMIQUE DES 22 OPÉRATIONS D'ENTRETIEN (EXACT PHOTO 2) */}
        <div style={{ border: "1.5px solid #0f172a", marginBottom: "6px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5px" }}>
            <thead>
              <tr style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                <th style={{ ...thMatrix, width: "14%" }}>{copy.colTier}</th>
                <th style={{ ...thMatrix, width: "5%" }}>{copy.colNumber}</th>
                <th style={{ ...thMatrix, width: "47%", textAlign: "left", paddingLeft: "8px" }}>{copy.colTask}</th>
                <th style={{ ...thMatrix, width: "9%" }}>{copy.colDone}</th>
                <th style={{ ...thMatrix, width: "9%" }}>{copy.colNotDone}</th>
                <th style={{ ...thMatrix, width: "16%" }}>{copy.colObservation}</th>
              </tr>
            </thead>
            <tbody>
              {tasksList.map((item, idx) => {
                const isDone = item.status === "EFFECTUE";
                const isSelectedTierTask = data.selectedTier >= item.template.mileageTier;
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={`task-${item.template.id}`}
                    style={{
                      backgroundColor: isEven ? "#ffffff" : "#f8fafc",
                      borderBottom: "1px solid #cbd5e1",
                    }}
                  >
                    {/* Palier Kilométrique */}
                    <td
                      style={{
                        borderRight: "1px solid #0f172a",
                        padding: "2px 4px",
                        textAlign: "center",
                        fontSize: "8px",
                        fontWeight: isSelectedTierTask ? 800 : 600,
                        color: isSelectedTierTask ? "#0f172a" : "#64748b",
                        backgroundColor: isSelectedTierTask ? "rgba(245, 158, 11, 0.08)" : "transparent",
                      }}
                    >
                      {item.template.mileageTier.toLocaleString()} KM
                    </td>

                    {/* Numéro */}
                    <td
                      style={{
                        borderRight: "1px solid #0f172a",
                        padding: "2px 4px",
                        textAlign: "center",
                        fontWeight: 700,
                        color: "#64748b",
                      }}
                    >
                      {item.index}
                    </td>

                    {/* Tâche */}
                    <td
                      style={{
                        borderRight: "1px solid #0f172a",
                        padding: "2px 8px",
                        fontWeight: isSelectedTierTask ? 700 : 500,
                        color: "#0f172a",
                      }}
                    >
                      <span>{item.template.taskLabel}</span>
                      {item.template.category && (
                        <span style={{ fontSize: "7px", color: "#64748b", marginLeft: "6px", textTransform: "uppercase" }}>
                          [{item.template.category}]
                        </span>
                      )}
                    </td>

                    {/* Effectué */}
                    <td
                      style={{
                        borderRight: "1px solid #0f172a",
                        padding: "2px 4px",
                        textAlign: "center",
                        fontWeight: 900,
                        fontSize: "10px",
                        color: isDone ? "#16a34a" : "#cbd5e1",
                        backgroundColor: isDone ? "rgba(22, 163, 74, 0.08)" : "transparent",
                      }}
                    >
                      {isDone ? "✓" : ""}
                    </td>

                    {/* Non effectué */}
                    <td
                      style={{
                        borderRight: "1px solid #0f172a",
                        padding: "2px 4px",
                        textAlign: "center",
                        fontWeight: 900,
                        fontSize: "9px",
                        color: !isDone ? "#dc2626" : "#cbd5e1",
                      }}
                    >
                      {!isDone ? "✗" : ""}
                    </td>

                    {/* Observation */}
                    <td
                      style={{
                        padding: "2px 6px",
                        fontSize: "8px",
                        color: "#334155",
                      }}
                    >
                      {item.observation || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. OBSERVATIONS GÉNÉRALES & RAPPORT SCANNER OBD (EXACT PHOTO 2) */}
        <div style={{ border: "1.5px solid #0f172a", marginBottom: "6px" }}>
          <div style={sectionBanner}>
            <span>{copy.observationsTitle}</span>
          </div>
          <div
            style={{
              padding: "5px 8px",
              minHeight: "36px",
              fontSize: "9.5px",
              lineHeight: 1.35,
              color: "#0f172a",
              backgroundImage: "repeating-linear-gradient(transparent, transparent 13px, #e2e8f0 14px)",
            }}
          >
            {data.observations || copy.observationsDefault}
          </div>
        </div>

        {/* 5. VALIDATIONS & SIGNATURES (EXACT PHOTO 2) */}
        <div style={{ border: "1.5px solid #0f172a", marginBottom: "4px" }}>
          <div style={{ ...sectionBanner, textAlign: "center" }}>
            <span>{copy.signaturesTitle}</span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9" }}>
                <th style={{ ...signatureHeader, width: "33.3%" }}>{copy.colClient}</th>
                <th style={{ ...signatureHeader, width: "33.3%" }}>{copy.colTechnicians}</th>
                <th style={{ ...signatureHeader, width: "33.4%" }}>{copy.colManager}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* 1. CLIENT */}
                <td style={signatureCell}>
                  <div style={{ fontSize: "8px", color: "#64748b", marginBottom: "3px" }}>
                    {copy.clientAgreement}
                  </div>
                  <div style={{ fontSize: "9px", fontWeight: 700, color: "#0f172a", minHeight: "13px" }}>
                    {data.clientName}
                  </div>
                  <div style={{ height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {data.signatures?.client ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.signatures.client}
                        alt={copy.clientSignatureAlt}
                        style={{ maxHeight: "40px", maxWidth: "90%", objectFit: "contain" }}
                      />
                    ) : (
                      <span style={{ fontSize: "8px", color: "#94a3b8", fontStyle: "italic" }}>
                        {copy.clientSignature}
                      </span>
                    )}
                  </div>
                </td>

                {/* 2. TECHNICIENS */}
                <td style={signatureCell}>
                  <div style={{ fontSize: "8px", color: "#64748b", marginBottom: "3px" }}>
                    {copy.technicianVisa}
                  </div>
                  <div style={{ fontSize: "9px", fontWeight: 700, color: "#0f172a", minHeight: "13px" }}>
                    {data.technicianName || copy.technicianDefault}
                  </div>
                  <div style={{ height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {data.signatures?.technician ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.signatures.technician}
                        alt={copy.technicianSignatureAlt}
                        style={{ maxHeight: "40px", maxWidth: "90%", objectFit: "contain" }}
                      />
                    ) : (
                      <span style={{ fontSize: "8px", color: "#94a3b8", fontStyle: "italic" }}>
                        {copy.technicianSignature}
                      </span>
                    )}
                  </div>
                </td>

                {/* 3. RESPONSABLE ATELIER */}
                <td style={signatureCell}>
                  <div style={{ fontSize: "8px", color: "#64748b", marginBottom: "3px" }}>
                    {copy.managerVisa}
                  </div>
                  <div style={{ fontSize: "9px", fontWeight: 700, color: "#0f172a", minHeight: "13px" }}>
                    {data.workshopManagerName || copy.managerDefault}
                  </div>
                  <div style={{ height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {data.signatures?.workshopManager ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.signatures.workshopManager}
                        alt={copy.managerSignatureAlt}
                        style={{ maxHeight: "40px", maxWidth: "90%", objectFit: "contain" }}
                      />
                    ) : (
                      <span style={{ fontSize: "8px", color: "#94a3b8", fontStyle: "italic" }}>
                        {copy.managerSignature}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 6. PIED DE PAGE LÉGAL */}
        <div
          style={{
            textAlign: "center",
            fontSize: "7.5px",
            color: "#64748b",
            marginTop: "3px",
            borderTop: "1px solid #cbd5e1",
            paddingTop: "2px",
          }}
        >
          {copy.footer}
        </div>
      </div>
    </div>
  );
}

// STYLES INLINE TYPOGRAPHIQUES POUR IMPRESSION RIGOUREUSE
const tdHeader: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #0f172a",
  padding: "3px 6px",
  fontSize: "8.5px",
  fontWeight: 700,
  color: "#1e293b",
  textTransform: "uppercase",
};

const tdData: React.CSSProperties = {
  border: "1px solid #0f172a",
  padding: "3px 6px",
  fontSize: "9px",
  color: "#0f172a",
};

const sectionBanner: React.CSSProperties = {
  backgroundColor: "#0f172a",
  color: "#ffffff",
  padding: "3px 8px",
  fontSize: "9px",
  fontWeight: 800,
  letterSpacing: "0.4px",
};

const thMatrix: React.CSSProperties = {
  border: "1px solid #0f172a",
  padding: "3px 4px",
  fontSize: "8px",
  fontWeight: 800,
  textAlign: "center",
  textTransform: "uppercase",
};

const signatureHeader: React.CSSProperties = {
  border: "1px solid #0f172a",
  padding: "3px 6px",
  fontSize: "8.5px",
  fontWeight: 800,
  color: "#0f172a",
  textAlign: "center",
};

const signatureCell: React.CSSProperties = {
  border: "1px solid #0f172a",
  padding: "4px 8px",
  textAlign: "center",
  verticalAlign: "top",
};
