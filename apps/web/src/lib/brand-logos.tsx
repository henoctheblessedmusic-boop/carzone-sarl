import React from "react";

export interface BrandMetadata {
  displayName: string;
  primaryColor: string;
  accentColor: string;
  badgeTextColor: string;
}

export const BRAND_METADATA: Record<string, BrandMetadata> = {
  "MERCEDES-BENZ": {
    displayName: "Mercedes-Benz",
    primaryColor: "#0f172a",
    accentColor: "#38bdf8",
    badgeTextColor: "#0f172a",
  },
  "JEEP": {
    displayName: "JEEP",
    primaryColor: "#1e3a1e",
    accentColor: "#d97706",
    badgeTextColor: "#1e3a1e",
  },
  "TOYOTA": {
    displayName: "TOYOTA",
    primaryColor: "#dc2626",
    accentColor: "#ef4444",
    badgeTextColor: "#dc2626",
  },
  "MITSUBISHI": {
    displayName: "MITSUBISHI MOTORS",
    primaryColor: "#dc2626",
    accentColor: "#b91c1c",
    badgeTextColor: "#dc2626",
  },
  "JETOUR": {
    displayName: "JETOUR",
    primaryColor: "#0284c7",
    accentColor: "#38bdf8",
    badgeTextColor: "#0284c7",
  },
  "KIA": {
    displayName: "KIA",
    primaryColor: "#05141f",
    accentColor: "#e11d48",
    badgeTextColor: "#05141f",
  },
  "BMW": {
    displayName: "BMW",
    primaryColor: "#1c69d4",
    accentColor: "#60a5fa",
    badgeTextColor: "#1c69d4",
  },
  "FORD": {
    displayName: "FORD",
    primaryColor: "#002c6c",
    accentColor: "#3b82f6",
    badgeTextColor: "#002c6c",
  },
  "BAIC": {
    displayName: "BAIC MOTORS",
    primaryColor: "#e11d48",
    accentColor: "#f43f5e",
    badgeTextColor: "#e11d48",
  },
  "BEIJING": {
    displayName: "BEIJING AUTO",
    primaryColor: "#e11d48",
    accentColor: "#f43f5e",
    badgeTextColor: "#e11d48",
  },
  "DONGFENG": {
    displayName: "DONGFENG",
    primaryColor: "#dc2626",
    accentColor: "#ef4444",
    badgeTextColor: "#dc2626",
  },
  "LYNK & CO": {
    displayName: "LYNK & CO",
    primaryColor: "#18181b",
    accentColor: "#f59e0b",
    badgeTextColor: "#18181b",
  },
  "BYD": {
    displayName: "BYD",
    primaryColor: "#005082",
    accentColor: "#0284c7",
    badgeTextColor: "#005082",
  },
  "GEELY": {
    displayName: "GEELY",
    primaryColor: "#0369a1",
    accentColor: "#38bdf8",
    badgeTextColor: "#0369a1",
  },
  "NISSAN": {
    displayName: "NISSAN",
    primaryColor: "#c2410c",
    accentColor: "#ea580c",
    badgeTextColor: "#c2410c",
  },
  "LEXUS": {
    displayName: "LEXUS",
    primaryColor: "#1e293b",
    accentColor: "#475569",
    badgeTextColor: "#1e293b",
  },
  "HONDA": {
    displayName: "HONDA",
    primaryColor: "#dc2626",
    accentColor: "#b91c1c",
    badgeTextColor: "#dc2626",
  },
  "CHANGAN": {
    displayName: "CHANGAN",
    primaryColor: "#003b7a",
    accentColor: "#0284c7",
    badgeTextColor: "#003b7a",
  },
  "DEEPAL": {
    displayName: "DEEPAL",
    primaryColor: "#065f46",
    accentColor: "#10b981",
    badgeTextColor: "#065f46",
  },
  "CHERY": {
    displayName: "CHERY / OMODA",
    primaryColor: "#b91c1c",
    accentColor: "#ef4444",
    badgeTextColor: "#b91c1c",
  },
  "FORTHING": {
    displayName: "FORTHING",
    primaryColor: "#4338ca",
    accentColor: "#6366f1",
    badgeTextColor: "#4338ca",
  },
};

export function normalizeBrandName(rawBrand: string): string {
  const b = (rawBrand || "").trim().toUpperCase();
  if (b.includes("MERCEDES") || b.includes("BENZ") || b === "MB") return "MERCEDES-BENZ";
  if (b.includes("JEEP")) return "JEEP";
  if (b.includes("TOYOTA")) return "TOYOTA";
  if (b.includes("MITSUBISHI")) return "MITSUBISHI";
  if (b.includes("JETOUR")) return "JETOUR";
  if (b.includes("KIA")) return "KIA";
  if (b.includes("BMW")) return "BMW";
  if (b.includes("FORD")) return "FORD";
  if (b.includes("BAIC") || b.includes("BEIJING")) return "BAIC";
  if (b.includes("DONGFENG")) return "DONGFENG";
  if (b.includes("LYNK")) return "LYNK & CO";
  if (b.includes("BYD")) return "BYD";
  if (b.includes("GEELY")) return "GEELY";
  if (b.includes("NISSAN")) return "NISSAN";
  if (b.includes("LEXUS")) return "LEXUS";
  if (b.includes("HONDA")) return "HONDA";
  if (b.includes("CHANGAN")) return "CHANGAN";
  if (b.includes("DEEPAL")) return "DEEPAL";
  if (b.includes("CHERY") || b.includes("OMODA")) return "CHERY";
  if (b.includes("FORTHING")) return "FORTHING";
  return b || "CARZONE";
}

/**
 * Composant de Logo Officiel Constructeur (SVG haute fidélité vectoriel)
 */
export function BrandLogoSvg({ brand, size = 38 }: { brand: string; size?: number }) {
  const norm = normalizeBrandName(brand);

  switch (norm) {
    case "MERCEDES-BENZ":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" stroke="#0f172a" strokeWidth="5" />
          <path
            d="M50 8 L50 50 L14 71 L50 50 L86 71 Z"
            fill="#0f172a"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="50" r="6" fill="#0f172a" />
        </svg>
      );

    case "JEEP":
      return (
        <svg width={size * 2.2} height={size} viewBox="0 0 140 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Jeep Iconic Bold Typography */}
          <text
            x="0"
            y="38"
            fill="#1e3a1e"
            fontFamily="'Arial Black', Impact, sans-serif"
            fontWeight="900"
            fontSize="42"
            letterSpacing="2"
          >
            Jeep
          </text>
        </svg>
      );

    case "TOYOTA":
      return (
        <svg width={size * 1.5} height={size} viewBox="0 0 100 65" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Oval */}
          <ellipse cx="50" cy="32.5" rx="46" ry="29" stroke="#dc2626" strokeWidth="5.5" />
          {/* Inner Vertical Oval */}
          <ellipse cx="50" cy="32.5" rx="14" ry="24" stroke="#dc2626" strokeWidth="5.5" />
          {/* Inner Horizontal Oval forming T */}
          <ellipse cx="50" cy="22" rx="30" ry="11" stroke="#dc2626" strokeWidth="5.5" />
        </svg>
      );

    case "MITSUBISHI":
      return (
        <svg width={size * 1.15} height={size} viewBox="0 0 100 86" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top Diamond */}
          <polygon points="50,0 66,28 50,56 34,28" fill="#dc2626" />
          {/* Bottom Left Diamond */}
          <polygon points="17,56 33,85 1,85 -15,56" transform="translate(17,0)" fill="#dc2626" />
          {/* Bottom Right Diamond */}
          <polygon points="67,56 99,56 83,85 51,85" fill="#dc2626" />
        </svg>
      );

    case "JETOUR":
      return (
        <svg width={size * 2.4} height={size} viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Jetour Stylized Wing / Dual Arrow Emblem */}
          <path d="M10 25 L25 10 L40 25 L32 25 L25 18 L18 25 Z" fill="#0284c7" />
          <path d="M20 35 L35 20 L50 35 L42 35 L35 28 L28 35 Z" fill="#0369a1" />
          {/* JETOUR Typography */}
          <text
            x="58"
            y="33"
            fill="#0f172a"
            fontFamily="'Helvetica Neue', Arial, sans-serif"
            fontWeight="900"
            fontSize="26"
            letterSpacing="3"
          >
            JETOUR
          </text>
        </svg>
      );

    case "KIA":
      return (
        <svg width={size * 2.2} height={size} viewBox="0 0 140 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* KIA Modern Connected Wordmark */}
          <path
            d="M12 40 L12 10 L28 40 M28 10 L28 40 L44 10 L56 10 L56 40 M68 40 L68 10 L84 10 L84 40 M96 40 L96 10 L122 40 L122 10"
            stroke="#05141f"
            strokeWidth="7"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      );

    case "BMW":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="47" stroke="#111827" strokeWidth="4" />
          <circle cx="50" cy="50" r="32" stroke="#111827" strokeWidth="3" />
          {/* Bavarian Quarters */}
          <path d="M50 18 A32 32 0 0 1 82 50 L50 50 Z" fill="#1c69d4" />
          <path d="M50 50 L50 82 A32 32 0 0 1 18 50 Z" fill="#1c69d4" />
          <path d="M50 18 L50 50 L18 50 A32 32 0 0 1 50 18 Z" fill="#ffffff" />
          <path d="M50 50 L82 50 A32 32 0 0 1 50 82 Z" fill="#ffffff" />
          {/* Letters */}
          <text x="32" y="15" fill="#111827" fontSize="12" fontWeight="900" fontFamily="sans-serif">B</text>
          <text x="45" y="13" fill="#111827" fontSize="12" fontWeight="900" fontFamily="sans-serif">M</text>
          <text x="60" y="15" fill="#111827" fontSize="12" fontWeight="900" fontFamily="sans-serif">W</text>
        </svg>
      );

    case "FORD":
      return (
        <svg width={size * 1.8} height={size} viewBox="0 0 120 65" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="60" cy="32.5" rx="56" ry="28" fill="#002c6c" stroke="#ffffff" strokeWidth="2.5" />
          <ellipse cx="60" cy="32.5" rx="52" ry="24" stroke="#ffffff" strokeWidth="1.5" />
          <text
            x="32"
            y="42"
            fill="#ffffff"
            fontFamily="'Brush Script MT', cursive, sans-serif"
            fontStyle="italic"
            fontWeight="bold"
            fontSize="32"
          >
            Ford
          </text>
        </svg>
      );

    case "BAIC":
    case "BEIJING":
      return (
        <svg width={size * 1.8} height={size} viewBox="0 0 130 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="25" cy="25" r="20" stroke="#e11d48" strokeWidth="4" />
          <path d="M16 25 Q25 12 34 25 Q25 38 16 25 Z" fill="#e11d48" />
          <text
            x="54"
            y="33"
            fill="#0f172a"
            fontFamily="'Arial Black', Impact, sans-serif"
            fontWeight="900"
            fontSize="24"
            letterSpacing="2"
          >
            BAIC
          </text>
        </svg>
      );

    case "DONGFENG":
      return (
        <svg width={size * 1.8} height={size} viewBox="0 0 140 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dual Swallows Circle */}
          <circle cx="25" cy="25" r="21" stroke="#dc2626" strokeWidth="3.5" />
          <path d="M15 25 C15 17 25 15 29 20 C25 22 21 27 25 33 C19 32 15 29 15 25 Z" fill="#dc2626" />
          <path d="M35 25 C35 33 25 35 21 30 C25 28 29 23 25 17 C31 18 35 21 35 25 Z" fill="#dc2626" />
          <text
            x="54"
            y="33"
            fill="#0f172a"
            fontFamily="'Helvetica Neue', Arial, sans-serif"
            fontWeight="900"
            fontSize="18"
            letterSpacing="1"
          >
            DONGFENG
          </text>
        </svg>
      );

    case "LYNK & CO":
      return (
        <svg width={size * 2.4} height={size} viewBox="0 0 170 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="10" width="18" height="30" stroke="#18181b" strokeWidth="4" />
          <text
            x="32"
            y="32"
            fill="#18181b"
            fontFamily="'Helvetica Neue', Arial, sans-serif"
            fontWeight="800"
            fontSize="20"
            letterSpacing="2"
          >
            LYNK &amp; CO
          </text>
        </svg>
      );

    case "BYD":
      return (
        <svg width={size * 1.8} height={size} viewBox="0 0 120 55" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="60" cy="27.5" rx="55" ry="23" stroke="#005082" strokeWidth="4" />
          <text
            x="24"
            y="36"
            fill="#005082"
            fontFamily="'Arial Black', Impact, sans-serif"
            fontWeight="900"
            fontSize="26"
            letterSpacing="4"
          >
            BYD
          </text>
        </svg>
      );

    default:
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 10px",
            background: "#0f172a",
            color: "#ffffff",
            borderRadius: "6px",
            fontWeight: 800,
            fontSize: "0.9rem",
            letterSpacing: "0.08em",
          }}
        >
          {brand}
        </div>
      );
  }
}
