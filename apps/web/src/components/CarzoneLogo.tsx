import Image from "next/image";

const LOGO_SIZES = {
  sm: { logo: 38, word: "0.95rem", tagline: "0.46rem", gap: "7px" },
  md: { logo: 44, word: "1.12rem", tagline: "0.52rem", gap: "8px" },
  lg: { logo: 60, word: "1.45rem", tagline: "0.64rem", gap: "10px" },
  xl: { logo: 74, word: "1.75rem", tagline: "0.74rem", gap: "12px" },
} as const;

export type CarzoneLogoSize = keyof typeof LOGO_SIZES;
export type OxcarLogoSize = CarzoneLogoSize;

const LOGO_ASPECT = 1200 / 856;
const BRAND_YELLOW = "#f5b301";

/**
 * Lockup CARZONE de l'application (sidebar, connexion) : logo officiel complet
 * (jamais rogné) + CARZONE jaune + tagline blanche.
 */
export function CarzoneLogo({
  size = "md",
  className,
  priority = false,
}: {
  size?: CarzoneLogoSize;
  className?: string;
  priority?: boolean;
}) {
  const conf = LOGO_SIZES[size];
  const logoWidth = Math.round(conf.logo * LOGO_ASPECT);

  return (
    <span
      className={`carzone-logo oxcar-logo carzone-logo--${size} oxcar-logo--${size}${className ? ` ${className}` : ""}`}
      style={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: conf.gap,
        textDecoration: "none",
        background: "transparent",
        borderRadius: 0,
        padding: 0,
        overflow: "visible",
        maxWidth: "none",
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      <Image
        src="/brand/carzone-logo.png"
        alt="CARZONE SARL"
        width={logoWidth}
        height={conf.logo}
        priority={priority}
        className="carzone-logo__img oxcar-logo__img"
        style={{ height: conf.logo, width: "auto", objectFit: "contain", flexShrink: 0, maxWidth: "none" }}
      />
      <span style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.22em", lineHeight: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: conf.word,
            fontWeight: 900,
            letterSpacing: "0.01em",
            lineHeight: 0.95,
            color: BRAND_YELLOW,
            whiteSpace: "nowrap",
          }}
        >
          CARZONE
        </span>
        <span
          style={{
            fontSize: conf.tagline,
            fontWeight: 800,
            letterSpacing: "0.14em",
            lineHeight: 1,
            textTransform: "uppercase",
            color: "#e6edf7",
            whiteSpace: "nowrap",
          }}
        >
          Drive your dream
        </span>
      </span>
    </span>
  );
}

export const OxcarLogo = CarzoneLogo;
export default CarzoneLogo;
