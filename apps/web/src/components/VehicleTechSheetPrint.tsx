import React from "react";
import type { TechnicalSheet } from "@/lib/tech-sheet-generator";
import { BrandLogoSvg, BRAND_METADATA, normalizeBrandName } from "@/lib/brand-logos";

export function VehicleTechSheetPrint({
  sheet,
  vehicleInfo,
}: {
  sheet: TechnicalSheet;
  vehicleInfo?: {
    vin?: string | null;
    color?: string | null;
    priceXof?: number | null;
  };
}) {
  const normBrand = normalizeBrandName(sheet.brand);
  const brandMeta = BRAND_METADATA[normBrand] || {
    displayName: sheet.brand,
    primaryColor: "#0f172a",
    accentColor: "#dc2626",
    badgeTextColor: "#0f172a",
  };

  // Détection si la variante correspond à une immatriculation béninoise (ex: "CJ 0291 RB")
  const isBeninPlate = sheet.variant && /\b[A-Z]{2}\s*\d{4}\s*RB\b/i.test(sheet.variant);

  return (
    <div className="ox-tech-sheet-wrapper" style={{ color: "#111827", background: "#f8fafc" }}>
      {/* ========================================================================= */}
      {/* PAGE 1 : PRÉSENTATION OFFICIELLE EN STUDIO SHOWROOM (1ÈRE DE COUVERTURE) */}
      {/* ========================================================================= */}
      <section
        className="ox-tech-sheet-page ox-tech-sheet-page-1"
        style={{
          width: "210mm",
          height: "297mm",
          maxHeight: "297mm",
          margin: "0 auto 2rem",
          background: "#ffffff",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          padding: "10mm 15mm 8mm",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          pageBreakInside: "avoid",
          breakInside: "avoid",
          pageBreakAfter: "always",
          breakAfter: "page",
        }}
      >
        {/* 1. TOP HEADER : CONCESSIONNAIRE CARZONE SARL + LOGO OFFICIEL CONSTRUCTEUR */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "4mm",
            borderBottom: "1.5px solid #e2e8f0",
          }}
        >
          {/* Identité Concessionnaire Bénin */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/carzone-logo.png"
              alt="Carzone SARL"
              style={{
                height: "46px",
                width: "auto",
                objectFit: "contain",
                borderRadius: "6px",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "1.08rem",
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  color: "#0f172a",
                  lineHeight: 1.1,
                }}
              >
                CARZONE SARL
              </div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.04em" }}>
                ATELIER &amp; CONCESSIONNAIRE AUTOMOBILE AGRÉÉ · RÉPUBLIQUE DU BÉNIN
              </div>
            </div>
          </div>

          {/* Logo officiel constructeur */}
          <div
            style={{
              padding: "6px 14px",
              background: "#ffffff",
              borderRadius: "10px",
              border: `1.5px solid ${brandMeta.primaryColor}22`,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <BrandLogoSvg brand={sheet.brand} size={28} />
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  color: brandMeta.primaryColor,
                  lineHeight: 1.1,
                }}
              >
                {sheet.brand}
              </div>
              <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.08em" }}>
                VÉHICULE CERTIFIÉ
              </div>
            </div>
          </div>
        </header>

        {/* 2. IDENTIFICATION OFFICIELLE DU VÉHICULE */}
        <div style={{ margin: "3mm 0 2mm" }}>
          <div
            style={{
              display: "inline-block",
              background: `${brandMeta.primaryColor}12`,
              color: brandMeta.primaryColor,
              padding: "3px 10px",
              borderRadius: "20px",
              fontSize: "0.66rem",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            FICHE TECHNIQUE OFFICIELLE · ATELIER &amp; CONCESSION
          </div>
          <div
            style={{
              fontSize: "1.7rem",
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            {sheet.title}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "14px",
              fontSize: "0.78rem",
              color: "#475569",
              marginTop: "4px",
              fontWeight: 600,
            }}
          >
            {sheet.variant && (
              <span>
                <strong style={{ color: "#0f172a" }}>
                  {isBeninPlate ? "Immatriculation Bénin / Atelier :" : "Version & Finition :"}
                </strong>{" "}
                <span style={{ color: isBeninPlate ? "#0f172a" : "#475569", fontWeight: isBeninPlate ? 800 : 600 }}>
                  {sheet.variant}
                </span>
              </span>
            )}
            {vehicleInfo?.vin && (
              <span>
                <strong style={{ color: "#0f172a" }}>N° VIN (Châssis) :</strong> {vehicleInfo.vin}
              </span>
            )}
            {vehicleInfo?.color && (
              <span>
                <strong style={{ color: "#0f172a" }}>Teinte d&apos;origine :</strong> {vehicleInfo.color}
              </span>
            )}
          </div>
        </div>

        {/* 3. HERO VEHICLE SHOWCASE : STUDIO CYCLORAMA ENTIER (OBJECT-FIT CONTAIN · SANS ROGNAGE NI ZOOM) */}
        <div
          style={{
            width: "100%",
            height: "142mm",
            position: "relative",
            borderRadius: "14px",
            border: "1.5px solid #e2e8f0",
            background: "radial-gradient(ellipse at 50% 50%, #ffffff 0%, #f8fafc 60%, #e2e8f0 100%)",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8mm",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sheet.mainPhotoUrl || "/images/vehicles/rich7-main.jpg"}
            alt={sheet.title}
            referrerPolicy="no-referrer"
            style={{
              width: "100%",
              height: "100%",
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
              objectPosition: "center center",
              filter: "drop-shadow(0 14px 28px rgba(15, 23, 42, 0.16))",
              position: "relative",
              zIndex: 2,
            }}
          />
          {/* Ombre douce de studio sous le véhicule */}
          <div
            style={{
              position: "absolute",
              bottom: "7mm",
              left: "12%",
              right: "12%",
              height: "15mm",
              background: "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.22) 0%, rgba(15, 23, 42, 0) 70%)",
              zIndex: 1,
              filter: "blur(4px)",
            }}
          />
        </div>

        {/* 4. CARTES SYNTHÈSE DES SPÉCIFICATIONS CLÉS (4 COLONNES) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            margin: "3mm 0",
          }}
        >
          <div
            style={{
              padding: "7px 10px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: brandMeta.primaryColor, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Motorisation
            </div>
            <div style={{ fontSize: "0.76rem", fontWeight: 900, color: "#0f172a", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {sheet.motorisation.displacementOrMotor || sheet.motorisation.fuelType}
            </div>
          </div>

          <div
            style={{
              padding: "7px 10px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: brandMeta.primaryColor, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Puissance Max
            </div>
            <div style={{ fontSize: "0.76rem", fontWeight: 900, color: "#0f172a", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {sheet.motorisation.maxPower.split("à")[0].trim()}
            </div>
          </div>

          <div
            style={{
              padding: "7px 10px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: brandMeta.primaryColor, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Transmission
            </div>
            <div style={{ fontSize: "0.76rem", fontWeight: 900, color: "#0f172a", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {sheet.motorisation.transmission.split(" ")[0]} {sheet.motorisation.transmission.includes("4WD") || sheet.motorisation.transmission.includes("4x4") || sheet.motorisation.transmission.includes("4MATIC") ? "· 4WD" : "· 2WD"}
            </div>
          </div>

          <div
            style={{
              padding: "7px 10px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: brandMeta.primaryColor, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Configuration
            </div>
            <div style={{ fontSize: "0.76rem", fontWeight: 900, color: "#0f172a", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {sheet.dimensions.seats} Places · {sheet.dimensions.doors} Portes
            </div>
          </div>
        </div>

        {/* 5. FOOTER OFFICIEL CONCESSIONNAIRE */}
        <footer
          style={{
            paddingTop: "4mm",
            borderTop: `2px solid ${brandMeta.primaryColor}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#0f172a" }}>
              CARZONE SARL · Importateur Agréé &amp; Atelier Concessionnaire Bénin
            </div>
            <div style={{ fontSize: "0.62rem", color: "#64748b" }}>
              Fiche certifiée conforme aux spécifications d&apos;usine · Destinée au marché Afrique de l&apos;Ouest
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                color: brandMeta.primaryColor,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Fiche Technique Conforme
            </div>
            <div style={{ fontSize: "0.66rem", fontWeight: 700, color: "#94a3b8" }}>
              Page 1 / 2
            </div>
          </div>
        </footer>
      </section>

      {/* ========================================================================= */}
      {/* PAGE 2 : SPÉCIFICATIONS TECHNIQUES STRUCTURÉES & PHOTOS COORDONNÉES       */}
      {/* ========================================================================= */}
      <section
        className="ox-tech-sheet-page ox-tech-sheet-page-2"
        style={{
          width: "210mm",
          height: "297mm",
          maxHeight: "297mm",
          margin: "0 auto",
          background: "#ffffff",
          padding: "9mm 15mm 7mm",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          overflow: "hidden",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          pageBreakInside: "avoid",
          breakInside: "avoid",
          pageBreakAfter: "avoid",
          breakAfter: "avoid",
        }}
      >
        {/* Header Title with Official Brand Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            marginBottom: "8px",
            paddingBottom: "6px",
            borderBottom: "1.5px solid #e2e8f0",
          }}
        >
          <BrandLogoSvg brand={sheet.brand} size={28} />
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "1.12rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                color: "#0f172a",
              }}
            >
              {sheet.title}
            </h1>
            <div
              style={{
                marginTop: "2px",
                fontSize: "0.72rem",
                fontWeight: 800,
                color: brandMeta.primaryColor,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              {sheet.subtitle || "SPÉCIFICATIONS TECHNIQUES OFFICIELLES"}
            </div>
          </div>
        </div>

        {/* SECTION 1 & 2 : DIMENSIONS & MOTORISATION (GRILLE 2 COLONNES) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "8px" }}>
          {/* DIMENSIONS */}
          <div>
            <div
              style={{
                background: brandMeta.primaryColor,
                color: "#ffffff",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "inline-block",
                marginBottom: "4px",
              }}
            >
              DIMENSIONS
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                lineHeight: "1.45",
                color: "#1e293b",
                borderTop: "1px solid #cbd5e1",
                paddingTop: "4px",
              }}
            >
              <div>L/l/h (mm) : <strong>{sheet.dimensions.lengthWidthHeight}</strong></div>
              <div>Empattement (mm) : <strong>{sheet.dimensions.wheelbase}</strong></div>
              <div>Nombre de portes : <strong>{sheet.dimensions.doors}</strong></div>
              <div>Nombre de places : <strong>{sheet.dimensions.seats}</strong></div>
              <div>Capacité réservoir / batterie : <strong>{sheet.dimensions.tankOrBattery}</strong></div>
            </div>
          </div>

          {/* MOTORISATION */}
          <div>
            <div
              style={{
                background: brandMeta.primaryColor,
                color: "#ffffff",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "inline-block",
                marginBottom: "4px",
              }}
            >
              MOTORISATION
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                lineHeight: "1.45",
                color: "#1e293b",
                borderTop: "1px solid #cbd5e1",
                paddingTop: "4px",
              }}
            >
              <div>Cylindrée / Moteur : <strong>{sheet.motorisation.displacementOrMotor}</strong></div>
              <div>Configuration : <strong>{sheet.motorisation.cylinders}</strong></div>
              <div>Transmission : <strong>{sheet.motorisation.transmission}</strong></div>
              <div>Type de carburant : <strong>{sheet.motorisation.fuelType}</strong></div>
              <div>Puissance maximale : <strong>{sheet.motorisation.maxPower}</strong></div>
              <div>Couple maximal : <strong>{sheet.motorisation.maxTorque}</strong></div>
              {sheet.motorisation.rangeKm && (
                <div>Autonomie homologuée : <strong>{sheet.motorisation.rangeKm}</strong></div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3 : ÉQUIPEMENT ET CONFORT (TEXTE GAUCHE + PHOTO HABITACLE DROITE) */}
        <div style={{ marginBottom: "8px" }}>
          <div
            style={{
              background: brandMeta.primaryColor,
              color: "#ffffff",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.7rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "3px",
            }}
          >
            EQUIPEMENT ET CONFORT
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.45fr 1fr",
              gap: "12px",
              alignItems: "center",
              borderTop: "1px solid #cbd5e1",
              paddingTop: "4px",
            }}
          >
            <ul style={{ margin: 0, paddingLeft: "15px", fontSize: "0.7rem", lineHeight: "1.38", color: "#1e293b" }}>
              {sheet.equipementConfort.slice(0, 8).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <div
              style={{
                height: 90,
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #cbd5e1",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                background: "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sheet.interiorPhotoUrl || "/images/vehicles/rich7-interior.jpg"}
                alt="Intérieur & Habitacle officiel"
                referrerPolicy="no-referrer"
                style={{ width: "100%", height: "100%", maxHeight: "100%", maxWidth: "100%", objectFit: "contain", objectPosition: "center center" }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 4 : EXTÉRIEUR (TEXTE GAUCHE + PHOTO PROFIL MÊME COULEUR DROITE SANS ROGNAGE) */}
        <div style={{ marginBottom: "8px" }}>
          <div
            style={{
              background: brandMeta.primaryColor,
              color: "#ffffff",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.7rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "3px",
            }}
          >
            EXTERIEUR
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.45fr 1fr",
              gap: "12px",
              alignItems: "center",
              borderTop: "1px solid #cbd5e1",
              paddingTop: "4px",
            }}
          >
            <ul style={{ margin: 0, paddingLeft: "15px", fontSize: "0.7rem", lineHeight: "1.38", color: "#1e293b" }}>
              {sheet.exterieur.slice(0, 8).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <div
              style={{
                height: 90,
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #cbd5e1",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                background: "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sheet.exteriorPhotoUrl || sheet.mainPhotoUrl || undefined}
                alt="Vue Extérieure officielle"
                referrerPolicy="no-referrer"
                style={{ width: "100%", height: "100%", maxHeight: "100%", maxWidth: "100%", objectFit: "contain", objectPosition: "center center" }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 5 : SÉCURITÉ (TEXTE GAUCHE + PHOTO ARRIÈRE MÊME COULEUR DROITE SANS ROGNAGE) */}
        <div style={{ marginBottom: "6px" }}>
          <div
            style={{
              background: brandMeta.primaryColor,
              color: "#ffffff",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.7rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "3px",
            }}
          >
            SECURITE
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.45fr 1fr",
              gap: "12px",
              alignItems: "center",
              borderTop: "1px solid #cbd5e1",
              paddingTop: "4px",
            }}
          >
            <ul style={{ margin: 0, paddingLeft: "15px", fontSize: "0.7rem", lineHeight: "1.38", color: "#1e293b" }}>
              {sheet.securite.slice(0, 8).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <div
              style={{
                height: 90,
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #cbd5e1",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                background: "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sheet.rearPhotoUrl || sheet.mainPhotoUrl || undefined}
                alt="Vue Arrière officielle"
                referrerPolicy="no-referrer"
                style={{ width: "100%", height: "100%", maxHeight: "100%", maxWidth: "100%", objectFit: "contain", objectPosition: "center center" }}
              />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "5px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.66rem",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          <div>
            CARZONE SARL · Importateur &amp; Concessionnaire Automobile Agréé Bénin
            {vehicleInfo?.vin ? ` · VIN: ${vehicleInfo.vin}` : ""}
            {vehicleInfo?.color ? ` · Teinte: ${vehicleInfo.color}` : ""}
          </div>
          <div>Fiche Technique certifiée conforme constructeur · Page 2 / 2</div>
        </div>
      </section>

      {/* Global Print Styles (Strict A4 2-Page Control) */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .ox-tech-sheet-wrapper {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .ox-tech-sheet-page {
            box-shadow: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .ox-tech-sheet-page-1 {
            page-break-after: always !important;
            break-after: page !important;
          }
          .ox-tech-sheet-page-2 {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
