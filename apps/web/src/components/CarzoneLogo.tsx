import Image from "next/image";

const BADGE_DIMENSIONS = {
  sm: { badge: 36, text: "0.95rem", sub: "0.60rem" },
  md: { badge: 46, text: "1.15rem", sub: "0.68rem" },
  lg: { badge: 64, text: "1.45rem", sub: "0.78rem" },
  xl: { badge: 84, text: "1.85rem", sub: "0.90rem" },
} as const;

export type CarzoneLogoSize = keyof typeof BADGE_DIMENSIONS;
export type OxcarLogoSize = CarzoneLogoSize;

export function CarzoneLogo({
  size = "md",
  className,
  priority = false,
}: {
  size?: CarzoneLogoSize;
  className?: string;
  priority?: boolean;
}) {
  const conf = BADGE_DIMENSIONS[size];
  return (
    <span
      className={`carzone-logo oxcar-logo carzone-logo--${size} oxcar-logo--${size}${className ? ` ${className}` : ""}`}
      style={{ display: "inline-flex", alignItems: "center", gap: size === "sm" ? "8px" : "12px", textDecoration: "none" }}
    >
      <Image
        src="/brand/carzone-logo.png"
        alt="CARZONE SARL - Concessionnaire Multi-Marques Bénin"
        width={conf.badge}
        height={conf.badge}
        priority={priority}
        className="carzone-logo__img oxcar-logo__img"
        style={{
          width: conf.badge,
          height: conf.badge,
          borderRadius: "50%",
          objectFit: "contain",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          flexShrink: 0,
        }}
      />
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span
          style={{
            fontWeight: 900,
            fontSize: conf.text,
            letterSpacing: "0.04em",
            color: "currentColor",
          }}
        >
          CAR<span style={{ color: "#f59e0b" }}>ZONE</span>
        </span>
        <span
          style={{
            fontSize: conf.sub,
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: "#94a3b8",
            textTransform: "uppercase",
          }}
        >
          SARL · BÉNIN
        </span>
      </span>
    </span>
  );
}

export const OxcarLogo = CarzoneLogo;
export default CarzoneLogo;
