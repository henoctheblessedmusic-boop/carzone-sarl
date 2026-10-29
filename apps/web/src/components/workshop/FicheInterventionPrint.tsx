"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Printer, ArrowLeft, Check, ShieldCheck } from "lucide-react";

export type InterventionData = {
  id: string;
  orNumber: string;
  entryDate: string;
  brand: string;
  model: string;
  immatriculation: string;
  chassis: string;
  mileage: number;
  clientName: string;
  phone: string;
  reportedFault: string;
  maintenanceTier: number | null; // 5000, 10000, 30000, 50000, 100000
  faultMotorTransmission?: string;
  faultSuspension?: string;
  faultElectricity?: string;
  faultOthers?: string;
  worksDone?: string;
  partsToOrder?: string;
  observations?: string;
  startTime?: string;
  endTime?: string;
  technicianName?: string;
  workshopManagerName?: string;
  signatures?: {
    client?: string; // Base64 data URL
    technician?: string;
    workshopManager?: string;
  };
};

export function FicheInterventionPrint({ data }: { data: InterventionData }) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const TIERS = [5000, 10000, 30000, 50000, 100000];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b121e", padding: "24px 16px" }}>
      {/* STYLE CSS STRICT POUR L'AFFICHAGE & L'IMPRESSION A4 */}
      <style>{`
        @media screen {
          .cz-a4-sheet {
            width: 210mm;
            min-height: 297mm;
            max-width: 210mm;
            margin: 0 auto;
            background-color: #ffffff !important;
            color: #0f172a !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
            border-radius: 4px;
            padding: 10mm 12mm;
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
            margin: 6mm 8mm;
          }
          .cz-no-print {
            display: none !important;
          }
          .cz-a4-sheet {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 4mm 6mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }

        .cz-table-header {
          background-color: #f1f5f9;
          font-weight: 700;
          color: #0f172a;
          border: 1.5px solid #0f172a;
          padding: 4px 6px;
          font-size: 9.5px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .cz-cell {
          border: 1px solid #0f172a;
          padding: 4px 6px;
          font-size: 10px;
          color: #0f172a;
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
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          Retour à l&apos;Atelier
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(245, 158, 11, 0.15)",
              color: "#fbbf24",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={14} /> Fiche Officielle d&apos;Intervention A4
          </span>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#111827",
              border: 0,
              padding: "8px 18px",
              borderRadius: 8,
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(245, 158, 11, 0.4)",
            }}
          >
            <Printer size={16} />
            Imprimer / Exporter PDF
          </button>
        </div>
      </div>

      {/* FEUILLE OFFICIELLE A4 */}
      <div ref={printAreaRef} className="cz-a4-sheet">
        {/* 1. EN-TÊTE OFFICIEL DE LA CONCESSION */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "2px solid #0f172a",
            padding: "8px 12px",
            marginBottom: "8px",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Logo et Informations légales */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
              <Image
                src="/brand/carzone-logo.png"
                alt="CARZONE SARL"
                width={64}
                height={64}
                priority
                style={{ objectFit: "contain", borderRadius: "50%" }}
              />
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1px", color: "#0f172a", textTransform: "uppercase" }}>
                CONCESSION DE VÉHICULES MULTI-MARQUES
              </div>
              <div style={{ fontSize: "20px", fontWeight: 900, color: "#e11d48", lineHeight: 1.1, margin: "2px 0" }}>
                CARZONE SARL
              </div>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#334155" }}>
                Service Après-Vente &amp; Atelier Agréé · Tél : +229 01 92 61 61 61
              </div>
              <div style={{ fontSize: "8.5px", color: "#64748b" }}>
                Maro-Militaire, Gbèdomidji, Cotonou · République du Bénin
              </div>
            </div>
          </div>

          {/* Titre et N° d'Ordre */}
          <div
            style={{
              textAlign: "right",
              borderLeft: "2px solid #0f172a",
              paddingLeft: "14px",
            }}
          >
            <div
              style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "4px 10px",
                fontWeight: 900,
                fontSize: "12px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                borderRadius: "2px",
              }}
            >
              FICHE D&apos;INTERVENTION
            </div>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#e11d48", marginTop: "4px" }}>
              ORDRE DE RÉPARATION : #{data.orNumber}
            </div>
            <div style={{ fontSize: "9.5px", fontWeight: 650, color: "#334155" }}>
              Date d&apos;entrée : <strong>{data.entryDate}</strong>
            </div>
          </div>
        </div>

        {/* 2. TABLEAU D'IDENTIFICATION DU VÉHICULE & CLIENT (CONFORME PHOTO 1) */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
          <tbody>
            <tr>
              <td style={{ ...tdHeader, width: "12%" }}>Marque :</td>
              <td style={{ ...tdData, width: "21%" }}><strong>{data.brand || "-"}</strong></td>
              <td style={{ ...tdHeader, width: "12%" }}>Modèle :</td>
              <td style={{ ...tdData, width: "21%" }}><strong>{data.model || "-"}</strong></td>
              <td style={{ ...tdHeader, width: "16%" }}>Immatriculation :</td>
              <td style={{ ...tdData, width: "18%" }}>
                <span style={{ fontSize: "11px", fontWeight: 900, color: "#0f172a" }}>
                  {data.immatriculation}
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ ...tdHeader }}>Date :</td>
              <td style={{ ...tdData }}>{data.entryDate}</td>
              <td style={{ ...tdHeader }}>S/N (Châssis) :</td>
              <td style={{ ...tdData, fontFamily: "monospace", fontSize: "9.5px" }}>{data.chassis || "-"}</td>
              <td style={{ ...tdHeader }}>N° Fiche / OR :</td>
              <td style={{ ...tdData }}><strong>#{data.orNumber}</strong></td>
            </tr>
            <tr>
              <td style={{ ...tdHeader }}>Client &amp; Tél :</td>
              <td colSpan={3} style={{ ...tdData }}>
                <strong>{data.clientName}</strong> {data.phone ? `· Tél : ${data.phone}` : ""}
              </td>
              <td style={{ ...tdHeader }}>Compteur (KM) :</td>
              <td style={{ ...tdData }}>
                <strong style={{ fontSize: "11px" }}>
                  {data.mileage ? `${data.mileage.toLocaleString()} KM` : "-"}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 3. PANNE SIGNALÉE PAR LE CLIENT */}
        <div style={{ border: "1.5px solid #0f172a", marginBottom: "8px" }}>
          <div style={sectionBanner}>
            <span>1. PANNE SIGNALÉE PAR LE CLIENT (CONSTAT À LA RÉCEPTION)</span>
          </div>
          <div style={{ padding: "6px 8px", minHeight: "32px", fontSize: "10px", lineHeight: 1.35, color: "#0f172a" }}>
            {data.reportedFault || "Entretien périodique programmé & révision générale."}
          </div>
        </div>

        {/* 4. TYPE D'ENTRETIEN KILOMÉTRIQUE (LES 5 PALIERS - EXACT PHOTO 1) */}
        <div style={{ border: "1.5px solid #0f172a", marginBottom: "8px" }}>
          <div style={sectionBanner}>
            <span>2. TYPE D&apos;ENTRETIEN KILOMÉTRIQUE (PALIERS RECOMMANDÉS)</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", textAlign: "center" }}>
            {TIERS.map((tier) => {
              const isSelected = data.maintenanceTier === tier;
              return (
                <div
                  key={`tier-${tier}`}
                  style={{
                    borderRight: tier !== 100000 ? "1px solid #0f172a" : "none",
                    padding: "5px 2px",
                    background: isSelected ? "#0f172a" : "#ffffff",
                    color: isSelected ? "#ffffff" : "#0f172a",
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: "9.5px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "11px",
                      height: "11px",
                      border: isSelected ? "1.5px solid #ffffff" : "1.5px solid #0f172a",
                      borderRadius: "2px",
                      lineHeight: "10px",
                      textAlign: "center",
                      fontSize: "9px",
                      fontWeight: 900,
                    }}
                  >
                    {isSelected ? "✓" : ""}
                  </span>
                  <span>{tier.toLocaleString()} KM</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. DIAGNOSTICS & TRAVAUX PAR SECTEUR TECHNIQUE (LES 4 PÔLES - EXACT PHOTO 1) */}
        <div style={{ border: "1.5px solid #0f172a", marginBottom: "8px" }}>
          <div style={sectionBanner}>
            <span>3. TRAVAUX PAR SECTEUR TECHNIQUE (DIAGNOSTIC &amp; INSPECTION)</span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ ...poleHeader, width: "25%" }}>MOTEUR TRANSMISSION</td>
                <td style={{ ...poleContent, width: "75%" }}>
                  {data.faultMotorTransmission || "Contrôle moteur, niveau et étanchéité transmission OK."}
                </td>
              </tr>
              <tr>
                <td style={{ ...poleHeader }}>SUSPENSION</td>
                <td style={{ ...poleContent }}>
                  {data.faultSuspension || "Contrôle amortisseurs, rotules, pneumatiques et freinage OK."}
                </td>
              </tr>
              <tr>
                <td style={{ ...poleHeader }}>ÉLECTRICITÉ</td>
                <td style={{ ...poleContent }}>
                  {data.faultElectricity || "Scan calculateur, batterie, alternateur et circuit éclairage OK."}
                </td>
              </tr>
              <tr>
                <td style={{ ...poleHeader }}>AUTRES</td>
                <td style={{ ...poleContent }}>
                  {data.faultOthers || "Climatisation, carrosserie et accessoires conformes."}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 6. TRAVAUX EFFECTUÉS (BILAN D'INTERVENTION) */}
        <div style={{ border: "1.5px solid #0f172a", marginBottom: "8px" }}>
          <div style={sectionBanner}>
            <span>4. TRAVAUX EFFECTUÉS PAR L&apos;ATELIER</span>
          </div>
          <div
            style={{
              padding: "6px 8px",
              minHeight: "44px",
              fontSize: "10px",
              lineHeight: 1.4,
              color: "#0f172a",
              backgroundImage: "repeating-linear-gradient(transparent, transparent 15px, #e2e8f0 16px)",
            }}
          >
            {data.worksDone || "Travaux d'entretien réalisés conformément aux préconisations d'atelier."}
          </div>
        </div>

        {/* 7. OBSERVATIONS & PIÈCES À COMMANDER (DEUX COLONNES - EXACT PHOTO 1) */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
          <tbody>
            <tr>
              <td style={{ width: "50%", verticalAlign: "top", border: "1.5px solid #0f172a", padding: 0 }}>
                <div style={subBanner}>OBSERVATIONS TECHNIQUES</div>
                <div style={{ padding: "6px 8px", minHeight: "36px", fontSize: "9.5px", color: "#0f172a", lineHeight: 1.35 }}>
                  {data.observations || "Véhicule propre et en bon état général à la restitution."}
                </div>
              </td>
              <td style={{ width: "50%", verticalAlign: "top", border: "1.5px solid #0f172a", padding: 0 }}>
                <div style={subBanner}>PIÈCES À COMMANDER / MAGASIN</div>
                <div style={{ padding: "6px 8px", minHeight: "36px", fontSize: "9.5px", color: "#0f172a", lineHeight: 1.35 }}>
                  {data.partsToOrder || "Fournitures et pièces d'origine Carzone déstockées."}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 8. HORAIRES DE MAIN D'ŒUVRE */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1.5px solid #0f172a",
            padding: "4px 10px",
            fontSize: "9.5px",
            fontWeight: 700,
            marginBottom: "8px",
            backgroundColor: "#f8fafc",
          }}
        >
          <div>
            Heure de début : <strong>{data.startTime || "-"}</strong>
          </div>
          <div>
            Heure de fin : <strong>{data.endTime || "-"}</strong>
          </div>
          <div>
            Technicien assigné : <strong>{data.technicianName || "Équipe SAV Carzone"}</strong>
          </div>
        </div>

        {/* 9. VALIDATIONS & SIGNATURES TRIPARTITE (EXACT PHOTO 1) */}
        <div style={{ border: "1.5px solid #0f172a", marginBottom: "6px" }}>
          <div style={{ ...sectionBanner, textAlign: "center" }}>
            <span>VALIDATIONS &amp; SIGNATURES (ORDRE DE RÉPARATION ET RESTITUTION)</span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9" }}>
                <th style={{ ...signatureHeader, width: "33.3%" }}>CLIENT</th>
                <th style={{ ...signatureHeader, width: "33.3%" }}>TECHNICIENS</th>
                <th style={{ ...signatureHeader, width: "33.4%" }}>RESPONSABLE ATELIER</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* 1. CLIENT */}
                <td style={signatureCell}>
                  <div style={{ fontSize: "8.5px", color: "#64748b", marginBottom: "4px" }}>
                    Bon pour accord &amp; réception
                  </div>
                  <div style={{ fontSize: "9.5px", fontWeight: 700, color: "#0f172a", minHeight: "14px" }}>
                    {data.clientName}
                  </div>
                  <div style={{ height: "46px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {data.signatures?.client ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.signatures.client}
                        alt="Signature Client"
                        style={{ maxHeight: "44px", maxWidth: "90%", objectFit: "contain" }}
                      />
                    ) : (
                      <span style={{ fontSize: "8.5px", color: "#94a3b8", fontStyle: "italic" }}>
                        Signature client
                      </span>
                    )}
                  </div>
                </td>

                {/* 2. TECHNICIEN */}
                <td style={signatureCell}>
                  <div style={{ fontSize: "8.5px", color: "#64748b", marginBottom: "4px" }}>
                    Visa de réalisation
                  </div>
                  <div style={{ fontSize: "9.5px", fontWeight: 700, color: "#0f172a", minHeight: "14px" }}>
                    {data.technicianName || "Technicien Carzone"}
                  </div>
                  <div style={{ height: "46px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {data.signatures?.technician ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.signatures.technician}
                        alt="Signature Technicien"
                        style={{ maxHeight: "44px", maxWidth: "90%", objectFit: "contain" }}
                      />
                    ) : (
                      <span style={{ fontSize: "8.5px", color: "#94a3b8", fontStyle: "italic" }}>
                        Visa mécanicien
                      </span>
                    )}
                  </div>
                </td>

                {/* 3. RESPONSABLE ATELIER */}
                <td style={signatureCell}>
                  <div style={{ fontSize: "8.5px", color: "#64748b", marginBottom: "4px" }}>
                    Contrôle qualité &amp; sortie
                  </div>
                  <div style={{ fontSize: "9.5px", fontWeight: 700, color: "#0f172a", minHeight: "14px" }}>
                    {data.workshopManagerName || "Chef d'Atelier SAV"}
                  </div>
                  <div style={{ height: "46px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {data.signatures?.workshopManager ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.signatures.workshopManager}
                        alt="Signature Chef Atelier"
                        style={{ maxHeight: "44px", maxWidth: "90%", objectFit: "contain" }}
                      />
                    ) : (
                      <span style={{ fontSize: "8.5px", color: "#94a3b8", fontStyle: "italic" }}>
                        Cachet &amp; visa atelier
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 10. PIED DE PAGE LÉGAL */}
        <div
          style={{
            textAlign: "center",
            fontSize: "8px",
            color: "#64748b",
            marginTop: "4px",
            borderTop: "1px solid #cbd5e1",
            paddingTop: "3px",
          }}
        >
          CARZONE SARL · Société à Responsabilité Limitée · Concessionnaire Officiel Automobile · Système Informatique de Gestion SAV Carzone Ops
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
  fontSize: "9px",
  fontWeight: 700,
  color: "#1e293b",
  textTransform: "uppercase",
};

const tdData: React.CSSProperties = {
  border: "1px solid #0f172a",
  padding: "3px 6px",
  fontSize: "9.5px",
  color: "#0f172a",
};

const sectionBanner: React.CSSProperties = {
  backgroundColor: "#0f172a",
  color: "#ffffff",
  padding: "3px 8px",
  fontSize: "9.5px",
  fontWeight: 800,
  letterSpacing: "0.4px",
};

const subBanner: React.CSSProperties = {
  backgroundColor: "#f1f5f9",
  color: "#0f172a",
  padding: "3px 8px",
  fontSize: "9px",
  fontWeight: 750,
  borderBottom: "1px solid #0f172a",
  letterSpacing: "0.3px",
};

const poleHeader: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #0f172a",
  padding: "3px 8px",
  fontSize: "9px",
  fontWeight: 750,
  color: "#0f172a",
  textTransform: "uppercase",
};

const poleContent: React.CSSProperties = {
  border: "1px solid #0f172a",
  padding: "3px 8px",
  fontSize: "9.5px",
  color: "#0f172a",
};

const signatureHeader: React.CSSProperties = {
  border: "1px solid #0f172a",
  padding: "4px 6px",
  fontSize: "9px",
  fontWeight: 800,
  color: "#0f172a",
  textAlign: "center",
};

const signatureCell: React.CSSProperties = {
  border: "1px solid #0f172a",
  padding: "6px 8px",
  textAlign: "center",
  verticalAlign: "top",
};
