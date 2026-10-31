import Image from "next/image";

const LOGO_HEIGHTS = {
  sm: 32,
  md: 44,
  lg: 72,
  xl: 88,
} as const;

export type CarzoneLogoSize = keyof typeof LOGO_HEIGHTS;
export type OxcarLogoSize = CarzoneLogoSize;

const LOGO_ASPECT = 1200 / 859;

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
      style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", background: "transparent", borderRadius: 0, padding: 0, overflow: "visible" }}
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
