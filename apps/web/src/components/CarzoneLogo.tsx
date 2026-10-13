import Image from "next/image";

const SIZES = {
  sm: { width: 165, height: 45 },
  md: { width: 220, height: 60 },
  lg: { width: 320, height: 87 },
  xl: { width: 420, height: 114 },
} as const;

export type CarzoneLogoSize = keyof typeof SIZES;
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
  const dim = SIZES[size];
  return (
    <span
      className={`carzone-logo oxcar-logo carzone-logo--${size} oxcar-logo--${size}${className ? ` ${className}` : ""}`}
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      <Image
        src="/brand/carzone-logo.svg"
        alt="CARZONE SARL - DRIVE YOUR DREAM"
        width={dim.width}
        height={dim.height}
        priority={priority}
        className="carzone-logo__img oxcar-logo__img"
        style={{ height: "auto", maxWidth: "100%", objectFit: "contain" }}
      />
    </span>
  );
}

export const OxcarLogo = CarzoneLogo;
export default CarzoneLogo;
