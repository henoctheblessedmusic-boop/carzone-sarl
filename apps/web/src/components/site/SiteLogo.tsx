import Image from "next/image";
import Link from "next/link";

/**
 * Lockup d'en-tête CARZONE : emblème officiel resserré + lettrage entièrement jaune.
 * Le logo complet officiel (emblème + CARZONE) est utilisé en pied de page,
 * sur l'écran de connexion et dans les documents imprimés.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="site-logo" aria-label="CARZONE SARL — Concessionnaire automobile multimarques">
      <Image
        src="/brand/carzone-mark.png"
        alt=""
        width={83}
        height={46}
        priority
        className="site-logo-mark-img"
      />
      <span className="site-logo-word">CARZONE</span>
    </Link>
  );
}
