import Image from "next/image";

const LOGO_SIZES = {
  sm: { mark: 28, word: "1.02rem", gap: "8px" },
  md: { mark: 36, word: "1.22rem", gap: "10px" },
  lg: { mark: 52, word: "1.55rem", gap: "12px" },
  xl: { mark: 64, word: "1.85rem", gap: "14px" },
} as const;

export type CarzoneLogoSize = keyof typeof LOGO_SIZES;
export type OxcarLogoSize = CarzoneLogoSize;

const MARK_ASPECT = 640 / 356;
const BRAND_YELLOW = "#f5b301";

/**
 * Lockup CARZONE utilisé dans l'application de gestion et à la connexion :
 * emblème officiel + lettrage CARZONE entièrement jaune.
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
  const width = Math.round(conf.mark * MARK_ASPECT);

  return (
    <span
      className={`carzone-logo oxcar-logo carzone-logo--${size} oxcar-logo--${size}${className ? ` ${className}` : ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: conf.gap,
        textDecoration: "none",
        background: "transparent",
        borderRadius: 0,
        padding: 0,
        overflow: "visible",
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      <Image
        src="/brand/carzone-mark.png"
        alt=""
        width={width}
        height={conf.mark}
        priority={priority}
        className="carzone-logo__mark oxcar-logo__img"
        style={{ height: conf.mark, width: "auto", objectFit: "contain", flexShrink: 0 }}
      />
      <span
        style={{
          fontSize: conf.word,
          fontWeight: 900,
          letterSpacing: "0.02em",
          lineHeight: 1,
          color: BRAND_YELLOW,
          whiteSpace: "nowrap",
        }}
      >
        CARZONE
      </span>
    </span>
  );
}

export const OxcarLogo = CarzoneLogo;
export default CarzoneLogo;
