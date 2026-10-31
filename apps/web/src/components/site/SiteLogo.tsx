import Image from "next/image";
import Link from "next/link";

/**
 * Lockup d'en-tête CARZONE : emblème officiel + CARZONE jaune + tagline visible.
 * Le logo complet officiel est utilisé en pied de page, sur l'écran de
 * connexion et dans les documents imprimés.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="site-logo" aria-label="CARZONE SARL — Concessionnaire automobile multimarques">
      <Image
        src="/brand/carzone-mark.png"
        alt=""
        width={100}
        height={56}
        priority
        className="site-logo-mark-img"
      />
      <span className="site-logo-text">
        <span className="site-logo-word">CARZONE</span>
        <span className="site-logo-tagline">Drive your dream</span>
      </span>
    </Link>
  );
}
