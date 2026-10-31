import Image from "next/image";

const LOGO_HEIGHTS = {
  sm: 52,
  md: 64,
  lg: 84,
  xl: 96,
} as const;

export type CarzoneLogoSize = keyof typeof LOGO_HEIGHTS;
export type OxcarLogoSize = CarzoneLogoSize;

const LOGO_ASPECT = 1200 / 856;

/**
 * Logo officiel CARZONE complet (emblème + lettrage) utilisé dans
 * l'application de gestion, sur la page de connexion et dans les documents.
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
  const height = LOGO_HEIGHTS[size];
  const width = Math.round(height * LOGO_ASPECT);

  return (
    <span
      className={`carzone-logo oxcar-logo carzone-logo--${size} oxcar-logo--${size}${className ? ` ${className}` : ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
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
        src="/brand/carzone-logo.png"
        alt="CARZONE SARL"
        width={width}
        height={height}
        priority={priority}
        className="carzone-logo__img oxcar-logo__img"
        style={{ height, width: "auto", objectFit: "contain", flexShrink: 0 }}
      />
    </span>
  );
}

export const OxcarLogo = CarzoneLogo;
export default CarzoneLogo;