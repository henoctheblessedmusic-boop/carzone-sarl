import Image from "next/image";
import Link from "next/link";

/**
 * En-tête CARZONE : logo officiel complet (emblème + CARZONE) affiché en entier,
 * avec la tagline « Drive your dream » en blanc juste en dessous.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="site-logo" aria-label="CARZONE SARL — Concessionnaire automobile multimarques">
      <Image
        src="/brand/carzone-logo.png"
        alt="CARZONE SARL"
        width={107}
        height={76}
        priority
        className="site-logo-img"
      />
      <span className="site-logo-tagline">Drive your dream</span>
    </Link>
  );
}
