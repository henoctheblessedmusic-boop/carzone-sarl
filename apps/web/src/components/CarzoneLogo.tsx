import Image from "next/image";

const SIZES = {
  sm: { width: 140, height: 42 },
  md: { width: 180, height: 54 },
  lg: { width: 260, height: 78 },
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
    <span className={`carzone-logo oxcar-logo carzone-logo--${size} oxcar-logo--${size}${className ? ` ${className}` : ""}`}>
      <Image
        src="/brand/carzone-logo.svg"
        alt="CARZONE SARL"
        width={dim.width}
        height={dim.height}
        priority={priority}
        className="carzone-logo__img oxcar-logo__img"
      />
    </span>
  );
}

export const OxcarLogo = CarzoneLogo;
export default CarzoneLogo;
