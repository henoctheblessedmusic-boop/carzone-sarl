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
    accentColor: "#f59e0b",
    badgeTextColor: "#0f172a",
  };

  // Détection si la variante correspond à une immatriculation béninoise (ex: "CJ 0291 RB")
  const isBeninPlate = sheet.variant && /\b[A-Z]{2}\s*\d{4}\s*RB\b/i.test(sheet.variant);

  // Synthèse intelligente de la motorisation pour la carte page 1
  const motorSummary = sheet.motorisation.displacementOrMotor || sheet.motorisation.fuelType || "Moteur Haute Performance";
  const powerSummary = sheet.motorisation.maxPower ? sheet.motorisation.maxPower.split("à")[0].trim() : "Puissance Optimisée";
  const transSummary = sheet.motorisation.transmission
    ? `${sheet.motorisation.transmission.split(" ")[0]} ${
        sheet.motorisation.transmission.includes("4WD") ||
        sheet.motorisation.transmission.includes("4x4") ||
        sheet.motorisation.transmission.includes("4MATIC") ||
        sheet.motorisation.transmission.includes("AWD")
          ? "· 4WD"
          : "· 2WD"
      }`
    : "Transmission Assistée";
  const seatsSummary = `${sheet.dimensions.seats || 5} Places · ${sheet.dimensions.doors || 5} Portes`;

  // Anti-cache : force le navigateur à recharger les photos vérifiées (les anciennes photos de rue restaient en cache)
  const PHOTO_VERSION = "2026-10-14b";
  const v = (url: string) => (url.startsWith("/images/") ? `${url}?v=${PHOTO_VERSION}` : url);

  // Textes habitacle toujours affichés sous le duo photo (page 2)
  const confort = sheet.equipementConfort || [];
  const cockpitText =
    confort.find((i) => /cockpit|écran|ecran|numérique|digital|instrumentation/i.test(i)) ||
    "Cockpit digital avec combiné d'instrumentation numérique et écran tactile multimédia haute résolution";
  const seatsText =
    confort.find((i) => /cuir|sellerie/i.test(i)) ||
    confort.find((i) => /siège|sieges|sièges/i.test(i)) ||
    "Sièges sport en cuir avec maintien latéral renforcé et surpiqûres contrastées";
  const seatsExtra = confort.find((i) => i !== seatsText && /siège|sièges|chauffant|ventil|massant/i.test(i));

  return (
    <div className="ox-tech-sheet-wrapper" style={{ color: "#111827", background: "#f1f5f9" }}>
      {/* ========================================================================= */}
      {/* PAGE 1 : PRÉSENTATION OFFICIELLE EN STUDIO SHOWROOM (PAGE DE GARDE)        */}
      {/* ========================================================================= */}
      <section
        className="ox-tech-sheet-page ox-tech-sheet-page-1"
        style={{
          width: "210mm",
          height: "296mm",
          maxHeight: "296mm",
          margin: "0 auto 2rem",
          background: "#ffffff",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          padding: "8mm 14mm 7mm",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          pageBreakInside: "avoid",
          breakInside: "avoid",
          pageBreakAfter: "always",
          breakAfter: "page",
        }}
      >
        {/* 1. TOP HEADER : BADGE OFFICIEL CARZONE SARL + LOGO CONSTRUCTEUR CERTIFIÉ */}
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
              alt="Logo Officiel Carzone SARL"
              style={{
                height: "52px",
                width: "52px",
                borderRadius: "50%",
                objectFit: "contain",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  color: "#0f172a",
                  lineHeight: 1.1,
                }}
              >
                CARZONE SARL
              </div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.04em", marginTop: "2px" }}>
                CONCESSIONNAIRE AUTOMOBILE MULTI-MARQUES &amp; ATELIER AGRÉÉ · BÉNIN
              </div>
              <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#b45309", letterSpacing: "0.06em" }}>
                SERVICE CLIENT &amp; VENTES : +229 01 92 61 61 61
              </div>
            </div>
          </div>

          {/* Logo officiel constructeur */}
          <div
            style={{
              padding: "7px 14px",
              background: "#ffffff",
              borderRadius: "10px",
              border: `1.5px solid ${brandMeta.primaryColor}25`,
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.05)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <BrandLogoSvg brand={sheet.brand} size={30} />
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "0.98rem",
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  color: brandMeta.primaryColor,
                  lineHeight: 1.1,
                }}
              >
                {sheet.brand}
              </div>
              <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.08em" }}>
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
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "5px",
            }}
          >
            FICHE TECHNIQUE OFFICIELLE · CONCESSION &amp; ATELIER
          </div>
          <div
            style={{
              fontSize: "1.65rem",
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
              gap: "16px",
              fontSize: "0.78rem",
              color: "#475569",
              marginTop: "5px",
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
                <strong style={{ color: "#0f172a" }}>Teinte constructeur :</strong> {vehicleInfo.color}
              </span>
            )}
          </div>
        </div>

        {/* 3. HERO VEHICLE SHOWCASE : STUDIO CYCLORAMA ENTIER (OBJECT-FIT CONTAIN · SANS ROGNAGE NI ZOOM) */}
        <div
          style={{
            width: "100%",
            height: "130mm",
            maxHeight: "130mm",
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
            src={v(sheet.mainPhotoUrl || "/images/vehicles/prado-main.jpg")}
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
              left: "10%",
              right: "10%",
              height: "15mm",
              background: "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.24) 0%, rgba(15, 23, 42, 0) 70%)",
              zIndex: 1,
              filter: "blur(4px)",
            }}
          />
        </div>

        {/* 4. CARTES SYNTHÈSE DES SPÉCIFICATIONS CLÉS (100% RESPONSIVE · SANS DÉBORDEMENT NI COUPURE) */}
        <div
          className="ox-tech-specs-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "10px",
            margin: "3mm 0",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Motorisation */}
          <div
            style={{
              padding: "9px 12px",
              background: "#ffffff",
              border: `1.5px solid ${brandMeta.primaryColor}30`,
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: "0.62rem",
                fontWeight: 800,
                color: brandMeta.primaryColor,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "3px",
              }}
            >
              Motorisation
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
            >
              {motorSummary}
            </div>
          </div>

          {/* Puissance Max */}
          <div
            style={{
              padding: "9px 12px",
              background: "#ffffff",
              border: `1.5px solid ${brandMeta.primaryColor}30`,
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: "0.62rem",
                fontWeight: 800,
                color: brandMeta.primaryColor,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "3px",
              }}
            >
              Puissance Max
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
            >
              {powerSummary}
            </div>
          </div>

          {/* Transmission */}
          <div
            style={{
              padding: "9px 12px",
              background: "#ffffff",
              border: `1.5px solid ${brandMeta.primaryColor}30`,
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: "0.62rem",
                fontWeight: 800,
                color: brandMeta.primaryColor,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "3px",
              }}
            >
              Transmission
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
            >
              {transSummary}
            </div>
          </div>

          {/* Configuration */}
          <div
            style={{
              padding: "9px 12px",
              background: "#ffffff",
              border: `1.5px solid ${brandMeta.primaryColor}30`,
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: "0.62rem",
                fontWeight: 800,
                color: brandMeta.primaryColor,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "3px",
              }}
            >
              Configuration
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
            >
              {seatsSummary}
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
            <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#0f172a" }}>
              CARZONE SARL · Concessionnaire Multi-Marques Agréé &amp; Atelier Bénin
            </div>
            <div style={{ fontSize: "0.64rem", color: "#64748b" }}>
              Fiche certifiée conforme aux spécifications d&apos;usine · Destinée au marché Afrique de l&apos;Ouest · Tél: +229 01 92 61 61 61
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "0.70rem",
                fontWeight: 800,
                color: brandMeta.primaryColor,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Fiche Technique Conforme
            </div>
            <div style={{ fontSize: "0.70rem", fontWeight: 800, color: "#0f172a" }}>
              Page 1 / 3
            </div>
          </div>
        </footer>
      </section>

      {/* ========================================================================= */}
      {/* PAGE 2 : L'HABITACLE, POSTE DE CONDUITE & CONFORT EMBARQUÉ (FORMAT 4:3)   */}
      {/* ========================================================================= */}
      <section
        className="ox-tech-sheet-page ox-tech-sheet-page-2"
        style={{
          width: "210mm",
          height: "296mm",
          maxHeight: "296mm",
          margin: "0 auto 2rem",
          background: "#ffffff",
          padding: "8mm 14mm 7mm",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          overflow: "hidden",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          pageBreakInside: "avoid",
          breakInside: "avoid",
          pageBreakAfter: "always",
          breakAfter: "page",
        }}
      >
        {/* Header Title with Official Brand Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "3mm",
            borderBottom: "1.5px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/carzone-logo.png"
              alt="Carzone SARL"
              style={{ height: "40px", width: "40px", borderRadius: "50%", objectFit: "contain" }}
            />
            <div>
              <div style={{ fontSize: "1.02rem", fontWeight: 900, color: "#0f172a" }}>
                {sheet.title}
              </div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: brandMeta.primaryColor, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                HABITACLE, POSTE DE CONDUITE &amp; CONFORT EMBARQUÉ
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BrandLogoSvg brand={sheet.brand} size={26} />
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: brandMeta.primaryColor }}>{sheet.brand}</span>
          </div>
        </div>

        {/* DUO PHOTOGRAPHIES DE L'HABITACLE AU FORMAT 4:3 : POSTE DE PILOTAGE & SELLERIE CUIR */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            margin: "2mm 0",
          }}
        >
          {/* Photo 1 : Cockpit Numérique 4:3 */}
          <div
            style={{
              position: "relative",
              height: "56mm",
              maxHeight: "56mm",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1.5px solid #cbd5e1",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              background: "#f8fafc",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={v(sheet.interiorPhotoUrl || "/images/vehicles/x55-interior.jpg")}
              alt="Cockpit & Poste de Pilotage Officiel"
              referrerPolicy="no-referrer"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "6px",
                left: "8px",
                background: "rgba(15, 23, 42, 0.82)",
                backdropFilter: "blur(4px)",
                color: "#ffffff",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              Poste de Pilotage &amp; Cockpit Digital
            </div>
          </div>

          {/* Photo 2 : Sellerie Cuir & Confort Passagers 4:3 */}
          <div
            style={{
              position: "relative",
              height: "56mm",
              maxHeight: "56mm",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1.5px solid #cbd5e1",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              background: "#f8fafc",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={v(
                sheet.interiorSeatsPhotoUrl ||
                (sheet.interiorPhotoUrl?.includes("-interior")
                  ? sheet.interiorPhotoUrl.replace("-interior.jpg", "-seats.jpg")
                  : "/images/vehicles/x55-seats.jpg")
              )}
              alt="Sellerie Cuir & Confort Passagers"
              referrerPolicy="no-referrer"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "6px",
                left: "8px",
                background: "rgba(15, 23, 42, 0.82)",
                backdropFilter: "blur(4px)",
                color: "#ffffff",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              Sièges Cuir Sport &amp; Sellerie
            </div>
          </div>
        </div>

        {/* DESCRIPTION EXPLICITE SOUS LE DUO : COCKPIT DIGITAL + SIÈGES CUIR SPORT */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "0 0 2mm" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderTop: `3px solid ${brandMeta.primaryColor}`, borderRadius: "8px", padding: "6px 10px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 900, color: brandMeta.primaryColor, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "3px" }}>
              Cockpit Digital
            </div>
            <div style={{ fontSize: "0.78rem", color: "#1e293b", lineHeight: 1.4, fontWeight: 500 }}>{cockpitText}</div>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderTop: `3px solid ${brandMeta.primaryColor}`, borderRadius: "8px", padding: "6px 10px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 900, color: brandMeta.primaryColor, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "3px" }}>
              Sièges en Cuir Sport
            </div>
            <div style={{ fontSize: "0.78rem", color: "#1e293b", lineHeight: 1.4, fontWeight: 500 }}>
              {seatsText}
              {seatsExtra ? <> · {seatsExtra}</> : null}
            </div>
          </div>
        </div>

        {/* ÉQUIPEMENTS ET CONFORT : AÉRÉ, POLICES VISIBLES ET LISIBLES */}
        <div style={{ margin: "1mm 0" }}>
          <div
            style={{
              background: brandMeta.primaryColor,
              color: "#ffffff",
              padding: "3px 10px",
              borderRadius: "6px",
              fontSize: "0.74rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "6px",
            }}
          >
            Équipements de Confort &amp; Technologies de Bord
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px 18px",
              background: "#f8fafc",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <ul
              style={{
                margin: 0,
                paddingLeft: "16px",
                fontSize: "0.78rem",
                lineHeight: "1.4",
                color: "#1e293b",
                fontWeight: 500,
              }}
            >
              {sheet.equipementConfort.slice(0, 5).map((item, idx) => (
                <li key={idx} style={{ marginBottom: "3px" }}>
                  {item}
                </li>
              ))}
            </ul>

            <ul
              style={{
                margin: 0,
                paddingLeft: "16px",
                fontSize: "0.78rem",
                lineHeight: "1.4",
                color: "#1e293b",
                fontWeight: 500,
              }}
            >
              {sheet.equipementConfort.slice(5, 10).map((item, idx) => (
                <li key={idx} style={{ marginBottom: "3px" }}>
                  {item}
                </li>
              ))}
              {sheet.equipementConfort.length <= 5 && (
                <>
                  <li style={{ marginBottom: "3px" }}>Climatisation automatique trizone avec aérateurs arrière</li>
                  <li style={{ marginBottom: "3px" }}>Système multimédia tactile haute résolution avec Apple CarPlay &amp; Android Auto</li>
                  <li style={{ marginBottom: "3px" }}>Compartiment réfrigéré Cool Box pour voyages et boissons</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* ENCADRÉ EXPÉRIENCE CONDUCTEUR ET PASSAGERS */}
        <div
          style={{
            background: `${brandMeta.primaryColor}08`,
            borderLeft: `4px solid ${brandMeta.primaryColor}`,
            padding: "6px 12px",
            borderRadius: "0 8px 8px 0",
            fontSize: "0.72rem",
            color: "#334155",
            lineHeight: 1.4,
          }}
        >
          <strong>Exigence Qualité Carzone SARL :</strong> Tous les équipements d&apos;habitacle, selleries et systèmes multimédias ont été méticuleusement testés par les techniciens de notre atelier concessionnaire à Cotonou pour garantir un confort irréprochable et durable.
        </div>

        {/* Footer info Page 2 */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "3mm",
            borderTop: "1.5px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.68rem",
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          <div>
            CARZONE SARL · Atelier &amp; Concessionnaire Automobile Multi-Marques · Bénin (+229 01 92 61 61 61)
          </div>
          <div style={{ fontWeight: 800, color: "#0f172a" }}>Page 2 / 3</div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PAGE 3 : DESIGN EXTÉRIEUR, MOTORISATION DÉTAILLÉE & SÉCURITÉ (FORMAT 4:3) */}
      {/* ========================================================================= */}
      <section
        className="ox-tech-sheet-page ox-tech-sheet-page-3"
        style={{
          width: "210mm",
          height: "296mm",
          maxHeight: "296mm",
          margin: "0 auto",
          background: "#ffffff",
          padding: "8mm 14mm 7mm",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
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
            justifyContent: "space-between",
            paddingBottom: "3mm",
            borderBottom: "1.5px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/carzone-logo.png"
              alt="Carzone SARL"
              style={{ height: "40px", width: "40px", borderRadius: "50%", objectFit: "contain" }}
            />
            <div>
              <div style={{ fontSize: "1.02rem", fontWeight: 900, color: "#0f172a" }}>
                {sheet.title}
              </div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: brandMeta.primaryColor, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                DESIGN EXTÉRIEUR, ARCHITECTURE TECHNIQUE &amp; SÉCURITÉ
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BrandLogoSvg brand={sheet.brand} size={26} />
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: brandMeta.primaryColor }}>{sheet.brand}</span>
          </div>
        </div>

        {/* DOUBLE GALERIE VISUELLE AU FORMAT 4:3 : PROFIL & VUE ARRIÈRE SANS DÉFORMATION */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            margin: "2mm 0",
          }}
        >
          {/* Photo Profil 4:3 */}
          <div
            style={{
              position: "relative",
              height: "56mm",
              maxHeight: "56mm",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1.5px solid #cbd5e1",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              background: "#f8fafc",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={v(sheet.exteriorPhotoUrl || sheet.mainPhotoUrl || "/images/vehicles/prado-exterior.jpg")}
              alt="Vue Extérieure de Profil"
              referrerPolicy="no-referrer"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "6px",
                left: "8px",
                background: "rgba(15, 23, 42, 0.78)",
                color: "#ffffff",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              Ligne &amp; Profil Dynamique
            </div>
          </div>

          {/* Photo Arrière 4:3 */}
          <div
            style={{
              position: "relative",
              height: "56mm",
              maxHeight: "56mm",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1.5px solid #cbd5e1",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              background: "#f8fafc",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={v(sheet.rearPhotoUrl || sheet.mainPhotoUrl || "/images/vehicles/prado-rear.jpg")}
              alt="Vue Arrière Officielle"
              referrerPolicy="no-referrer"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "6px",
                left: "8px",
                background: "rgba(15, 23, 42, 0.78)",
                color: "#ffffff",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              Design &amp; Signature Lumineuse LED
            </div>
          </div>
        </div>

        {/* SECTION CARACTÉRISTIQUES DÉTAILLÉES : DIMENSIONS & MOTORISATION */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "1mm 0" }}>
          {/* Dimensions */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          >
            <div
              style={{
                fontSize: "0.70rem",
                fontWeight: 800,
                color: brandMeta.primaryColor,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                borderBottom: "1.5px solid #e2e8f0",
                paddingBottom: "3px",
                marginBottom: "4px",
              }}
            >
              Dimensions &amp; Habitabilité
            </div>
            <div style={{ fontSize: "0.76rem", lineHeight: "1.45", color: "#1e293b" }}>
              <div>L x l x h : <strong>{sheet.dimensions.lengthWidthHeight} mm</strong></div>
              <div>Empattement : <strong>{sheet.dimensions.wheelbase} mm</strong></div>
              <div>Capacité : <strong>{sheet.dimensions.seats} Places · {sheet.dimensions.doors} Portes</strong></div>
              <div>Réservoir / Batterie : <strong>{sheet.dimensions.tankOrBattery}</strong></div>
            </div>
          </div>

          {/* Motorisation */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          >
            <div
              style={{
                fontSize: "0.70rem",
                fontWeight: 800,
                color: brandMeta.primaryColor,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                borderBottom: "1.5px solid #e2e8f0",
                paddingBottom: "3px",
                marginBottom: "4px",
              }}
            >
              Motorisation &amp; Transmission
            </div>
            <div style={{ fontSize: "0.76rem", lineHeight: "1.45", color: "#1e293b" }}>
              <div>Technologie : <strong>{sheet.motorisation.displacementOrMotor}</strong></div>
              <div>Transmission : <strong>{sheet.motorisation.transmission}</strong></div>
              <div>Puissance maximale : <strong>{sheet.motorisation.maxPower}</strong></div>
              <div>Couple maximal : <strong>{sheet.motorisation.maxTorque}</strong></div>
            </div>
          </div>
        </div>

        {/* SECTION SÉCURITÉ ACTIVE & PASSIVE */}
        <div
          style={{
            background: "#ffffff",
            border: "1.5px solid #e2e8f0",
            borderRadius: "8px",
            padding: "8px 12px",
            margin: "1mm 0",
          }}
        >
          <div
            style={{
              fontSize: "0.70rem",
              fontWeight: 800,
              color: "#b45309",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🛡️</span> Sécurité Active, Passive &amp; Aides à la Conduite
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px" }}>
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.75rem", lineHeight: "1.38", color: "#1e293b" }}>
              {sheet.securite.slice(0, 4).map((sec, idx) => (
                <li key={idx} style={{ marginBottom: "2px" }}>{sec}</li>
              ))}
            </ul>
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.75rem", lineHeight: "1.38", color: "#1e293b" }}>
              {sheet.securite.slice(4, 8).map((sec, idx) => (
                <li key={idx} style={{ marginBottom: "2px" }}>{sec}</li>
              ))}
              {sheet.securite.length <= 4 && (
                <>
                  <li style={{ marginBottom: "2px" }}>Caméras panoramiques 360° avec vue sous châssis</li>
                  <li style={{ marginBottom: "2px" }}>Pack complet 7 airbags avec protection genoux et rideaux</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* BLOC CERTIFICATION & CONTACT CONCESSIONNAIRE CARZONE SARL */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#ffffff",
            borderRadius: "10px",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "1.5mm",
            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/carzone-logo.png"
              alt="Badge Officiel Carzone SARL"
              style={{
                height: "42px",
                width: "42px",
                borderRadius: "50%",
                objectFit: "contain",
                border: "2px solid #f59e0b",
              }}
            />
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: 900, letterSpacing: "0.06em", color: "#fcd34d" }}>
                CARZONE SARL · CONCESSIONNAIRE &amp; ATELIER HOMOLOGUÉ
              </div>
              <div style={{ fontSize: "0.66rem", color: "#cbd5e1", marginTop: "1px" }}>
                Cotonou, République du Bénin · Téléphone direct : <strong>+229 01 92 61 61 61</strong>
              </div>
              <div style={{ fontSize: "0.62rem", color: "#94a3b8" }}>
                Véhicule sélectionné, contrôlé et certifié conforme · Pièces d&apos;origine &amp; garantie atelier
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right", borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: "14px" }}>
            <div style={{ fontSize: "0.62rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Garantie Concession
            </div>
            <div style={{ fontSize: "0.80rem", fontWeight: 900, color: "#22c55e" }}>
              CONFORME
            </div>
          </div>
        </div>

        {/* Footer info Page 3 */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "3mm",
            borderTop: "1.5px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.68rem",
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          <div>
            CARZONE SARL · Fiche certifiée conforme constructeur · {vehicleInfo?.vin ? `N° VIN: ${vehicleInfo.vin}` : ""}
          </div>
          <div style={{ fontWeight: 800, color: "#0f172a" }}>Page 3 / 3</div>
        </div>
      </section>

      {/* Global Print & Responsive Styles (Strict A4 3-Page Control) */}
      <style>{`
        @media screen and (max-width: 768px) {
          .ox-tech-sheet-page {
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            padding: 1.2rem 1rem !important;
            margin-bottom: 1.5rem !important;
            box-shadow: 0 4px 16px rgba(0,0,0,0.06) !important;
          }
          .ox-tech-specs-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }
        }

        @media screen and (max-width: 480px) {
          .ox-tech-specs-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
          }
          html, body {
            background: #ffffff !important;
            margin: 0mm !important;
            padding: 0mm !important;
            width: 210mm !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print,
          header.no-print,
          .ox-header,
          .ox-aside,
          .ox-mobile-header-bar {
            display: none !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          .ox-tech-sheet-page-root,
          .ox-tech-sheet-print-container,
          .ox-tech-sheet-wrapper {
            background: #ffffff !important;
            padding: 0mm !important;
            margin: 0mm !important;
            width: 210mm !important;
            min-height: 0 !important;
          }
          .ox-tech-sheet-page {
            box-shadow: none !important;
            margin: 0mm !important;
            width: 210mm !important;
            height: 296mm !important;
            max-height: 296mm !important;
            min-height: 296mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            padding: 8mm 14mm 7mm !important;
          }
          .ox-tech-sheet-page-1 {
            page-break-before: avoid !important;
            break-before: avoid !important;
            page-break-after: page !important;
            break-after: page !important;
          }
          .ox-tech-sheet-page-2 {
            page-break-before: page !important;
            break-before: page !important;
            page-break-after: page !important;
            break-after: page !important;
          }
          .ox-tech-sheet-page-3 {
            page-break-before: page !important;
            break-before: page !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
