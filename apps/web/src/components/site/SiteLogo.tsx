import Image from "next/image";
import Link from "next/link";

/**
 * Lockup d'en-tête CARZONE : emblème officiel à gauche, CARZONE en jaune,
 * et « Drive your dream » en dessous, dans le style de la charte validée.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="site-logo" aria-label="CARZONE SARL — Concessionnaire automobile multimarques">
      <Image
        src="/brand/carzone-mark.png"
        alt=""
        width={110}
        height={62}
        priority
        className="site-logo-emblem"
      />
      <span className="site-logo-lockup">
        <span className="site-logo-word">CARZONE</span>
        <span className="site-logo-tagline">Drive your dream</span>
      </span>
    </Link>
  );
}